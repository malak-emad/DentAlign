from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta, time
from django.db.models import Q
import json

from staff.models import Patient, Appointment, Treatment, Invoice, MedicalRecord, Staff


class IsPatientOnly:
    """Permission class to allow only patients"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'patient_profile')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get patient dashboard statistics and data"""
    try:
        # Try to get the patient profile
        try:
            patient = Patient.objects.get(user=request.user)
        except Patient.DoesNotExist:
            # For now, return mock data if no patient profile exists
            # In production, we should create the patient profile properly
            patient_name = request.user.full_name or request.user.username or 'Patient'
            
            mock_data = {
                'patient_info': {
                    'name': patient_name,
                    'email': request.user.email or 'patient@example.com',
                    'patient_id': 'TEMP-001'
                },
                'next_appointment': {
                    'doctor_name': 'Dr. Smith',
                    'date': '2025-12-15',
                    'time': '10:00 AM',
                    'reason': 'Regular Checkup'
                },
                'pending_bills': {
                    'count': 2,
                    'total_amount': 250.00,
                    'latest_bill': {
                        'invoice_number': 'INV-001',
                        'amount': 150.00,
                        'due_date': '2025-12-20'
                    }
                },
                'latest_treatment': {
                    'treatment_type': 'Cleaning',
                    'date': '2025-11-15',
                    'doctor_name': 'Dr. Smith',
                    'notes': 'Regular dental cleaning completed'
                },
                'medical_records_count': 5
            }
            
            return Response(mock_data, status=status.HTTP_200_OK)
        
        # If patient exists, get real data
        
        # Get upcoming appointments
        today = timezone.now().date()
        upcoming_appointments = Appointment.objects.filter(
            patient=patient,
            start_time__date__gte=today,
            status__in=['scheduled', 'confirmed']
        ).order_by('start_time')[:3]
        
        # Get recent appointments for history
        recent_appointments = Appointment.objects.filter(
            patient=patient,
            start_time__date__lt=today
        ).order_by('-start_time')[:5]
        
        # Get pending invoices
        pending_invoices = Invoice.objects.filter(
            patient=patient,
            status__in=['pending', 'overdue']
        )
        
        # Get recent treatments
        recent_treatments = Treatment.objects.filter(
            appointment__patient=patient
        ).order_by('-appointment__start_time')[:3]
        
        # Get medical records count
        medical_records_count = MedicalRecord.objects.filter(patient=patient).count()
        
        # Format upcoming appointments
        next_appointment_data = None
        if upcoming_appointments:
            next_apt = upcoming_appointments[0]
            next_appointment_data = {
                'appointment_id': str(next_apt.appointment_id),
                'doctor_name': f"{next_apt.staff.first_name or ''} {next_apt.staff.last_name or ''}".strip() or "Staff Member",
                'date': next_apt.start_time.strftime('%Y-%m-%d'),
                'time': next_apt.start_time.strftime('%I:%M %p'),
                'reason': next_apt.reason or 'General Consultation',
                'status': next_apt.status
            }
        
        # Format recent treatments for prescriptions/latest treatment
        latest_treatment = None
        if recent_treatments:
            treatment = recent_treatments[0]
            latest_treatment = {
                'treatment_id': str(treatment.treatment_id),
                'treatment_code': treatment.treatment_code,
                'description': treatment.description,
                'date': treatment.appointment.start_time.strftime('%Y-%m-%d') if treatment.appointment else None,
                'cost': float(treatment.cost) if treatment.cost else 0
            }
        
        dashboard_data = {
            'patient_info': {
                'name': f"{patient.first_name} {patient.last_name}",
                'email': patient.email,
                'patient_id': str(patient.patient_id)
            },
            'next_appointment': next_appointment_data,
            'pending_bills': {
                'count': pending_invoices.count(),
                'total_amount': float(pending_invoices.aggregate(total=Sum('total_amount'))['total'] or 0),
                'invoices': [
                    {
                        'invoice_id': str(inv.invoice_id),
                        'amount': float(inv.total_amount),
                        'due_date': inv.due_date.strftime('%Y-%m-%d') if inv.due_date else None,
                        'status': inv.status
                    } for inv in pending_invoices[:3]
                ]
            },
            'latest_treatment': latest_treatment,
            'medical_records_count': medical_records_count,
            'upcoming_appointments_count': upcoming_appointments.count(),
            'recent_appointments': [
                {
                    'appointment_id': str(apt.appointment_id),
                    'date': apt.appointment_date.strftime('%Y-%m-%d'),
                    'time': apt.start_time.strftime('%I:%M %p') if apt.start_time else 'Time TBD',
                    'status': apt.status,
                    'reason': apt.reason or 'General Consultation'
                } for apt in recent_appointments
            ]
        }
        
        return Response(dashboard_data)
        
    except Patient.DoesNotExist:
        return Response(
            {'error': 'Patient profile not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def patient_profile(request):
    """Get or update patient profile"""
    try:
        # Try to get the patient profile
        try:
            patient = Patient.objects.get(user=request.user)
        except Patient.DoesNotExist:
            # Return error if no patient profile exists instead of mock data
            return Response(
                {'error': 'Patient profile not found. Please contact admin to set up your profile.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        if request.method == 'GET':
            # Return patient profile data with clean, empty values for unspecified fields
            profile_data = {
                'name': f"{patient.first_name} {patient.last_name}",
                'email': patient.email,
                'phone': patient.phone or '',
                'gender': patient.gender or '',
                'birthdate': patient.dob.strftime('%Y-%m-%d') if patient.dob else '',
                'blood_type': '',  # Empty until user specifies
                'address': patient.address or '',
                'medical_history': patient.medical_history or '',
                'emergency_contact': {
                    'name': '',  # Empty until user specifies
                    'phone': '',
                    'relationship': ''
                }
            }
            return Response(profile_data, status=status.HTTP_200_OK)
        
        elif request.method == 'PUT':
            # Update patient profile
            data = request.data
            
            # Update fields if provided
            if 'name' in data:
                name_parts = data['name'].split(' ', 1)
                patient.first_name = name_parts[0]
                patient.last_name = name_parts[1] if len(name_parts) > 1 else ''
            
            if 'email' in data:
                patient.email = data['email']
            
            if 'phone' in data:
                patient.phone = data['phone']
                
            if 'gender' in data:
                patient.gender = data['gender']
                
            if 'birthdate' in data:
                try:
                    patient.dob = datetime.strptime(data['birthdate'], '%Y-%m-%d').date()
                except ValueError:
                    pass
                    
            if 'address' in data:
                patient.address = data['address']
                
            if 'medical_history' in data:
                patient.medical_history = data['medical_history']
            
            patient.save()
            
            # Return updated profile
            updated_profile = {
                'name': f"{patient.first_name} {patient.last_name}",
                'email': patient.email,
                'phone': patient.phone or '',
                'gender': patient.gender or '',
                'birthdate': patient.dob.strftime('%Y-%m-%d') if patient.dob else '',
                'blood_type': '',  # Empty until user specifies
                'address': patient.address or '',
                'medical_history': patient.medical_history or '',
                'emergency_contact': {
                    'name': '',  # Empty until user specifies
                    'phone': '',
                    'relationship': ''
                }
            }
            return Response(updated_profile, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Define available services (can be moved to a model later)
AVAILABLE_SERVICES = [
    {"id": "orthodontics", "title": "Orthodontics", "subtitle": "Braces, aligners & adjustments", "duration_mins": 30},
    {"id": "cleaning", "title": "Dental Cleaning", "subtitle": "Scale & polish", "duration_mins": 45},
    {"id": "consultation", "title": "Consultation", "subtitle": "New patient consult / exam", "duration_mins": 20},
    {"id": "root_canal", "title": "Root Canal", "subtitle": "Endodontic treatment", "duration_mins": 60},
    {"id": "radiology", "title": "Radiology (X‑Ray)", "subtitle": "In‑house imaging", "duration_mins": 15},
]

# Map staff specializations to services they can perform
STAFF_SERVICES = {
    "orthodontist": ["orthodontics", "consultation"],
    "general_dentist": ["cleaning", "consultation", "root_canal"], 
    "radiologist": ["radiology"],
    "dentist": ["cleaning", "consultation", "root_canal"],  # fallback
}


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def available_services(request):
    """Get list of available services"""
    return Response({'services': AVAILABLE_SERVICES}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def available_doctors(request):
    """Get list of available doctors with their services"""
    try:
        # Get service filter if provided
        service_id = request.GET.get('service')
        
        # Get all staff who can see patients
        staff_members = Staff.objects.filter(
            role_title__in=['Doctor', 'Dentist', 'Orthodontist', 'Radiologist']
        ).select_related('user')
        
        doctors_data = []
        for staff in staff_members:
            # Determine staff specialty and services
            specialty = staff.specialization or staff.role_title or 'General Dentist'
            specialty_key = specialty.lower().replace(' ', '_')
            
            # Get services this staff can perform
            staff_services = STAFF_SERVICES.get(specialty_key, STAFF_SERVICES.get('dentist', []))
            
            # Filter by requested service if specified
            if service_id and service_id not in staff_services:
                continue
                
            doctor_data = {
                'id': str(staff.staff_id),
                'name': f"Dr. {staff.first_name or ''} {staff.last_name or ''}".strip() or f"Dr. {staff.user.full_name}",
                'specialty': specialty,
                'services': staff_services,
                'avatar': '/assets/doctors/default.jpg'  # Use default avatar for now
            }
            doctors_data.append(doctor_data)
        
        return Response({'doctors': doctors_data}, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def available_slots(request):
    """Get available time slots for a specific doctor and date"""
    try:
        doctor_id = request.GET.get('doctor_id')
        date_str = request.GET.get('date')
        
        if not doctor_id or not date_str:
            return Response(
                {'error': 'doctor_id and date parameters are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            appointment_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            staff = Staff.objects.get(staff_id=doctor_id)
        except (ValueError, Staff.DoesNotExist):
            return Response(
                {'error': 'Invalid doctor_id or date format'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if date is in the past
        if appointment_date < timezone.now().date():
            return Response({'slots': []}, status=status.HTTP_200_OK)
        
        # Generate time slots (9 AM to 5 PM, 30-minute intervals)
        base_slots = []
        start_hour = 9
        end_hour = 17
        
        for hour in range(start_hour, end_hour):
            for minute in [0, 30]:
                if hour == 16 and minute == 30:  # Stop at 4:30 PM
                    break
                slot_time = time(hour, minute)
                base_slots.append(slot_time.strftime('%H:%M'))
        
        # Get existing appointments for this doctor and date
        existing_appointments = Appointment.objects.filter(
            staff=staff,
            start_time__date=appointment_date,
            status__in=['scheduled', 'confirmed', 'in_progress']
        )
        
        # Remove booked slots
        booked_times = set()
        for appointment in existing_appointments:
            if appointment.start_time:
                booked_times.add(appointment.start_time.strftime('%H:%M'))
        
        available_slots = [slot for slot in base_slots if slot not in booked_times]
        
        # Check if it's weekend (reduce available slots)
        weekday = appointment_date.weekday()
        if weekday >= 5:  # Saturday = 5, Sunday = 6
            # Weekend - only morning slots
            available_slots = [slot for slot in available_slots if int(slot.split(':')[0]) < 13]
        
        return Response({'slots': available_slots}, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_appointments(request):
    """Get patient's appointments"""
    try:
        # Try to get patient profile
        try:
            patient = Patient.objects.get(user=request.user)
        except Patient.DoesNotExist:
            # Return empty list if no patient profile
            return Response({'appointments': []}, status=status.HTTP_200_OK)
        
        # Get status filter
        status_filter = request.GET.get('status', 'all')
        
        # Base queryset
        appointments = Appointment.objects.filter(patient=patient).select_related('staff')
        
        # Apply status filter
        if status_filter == 'upcoming':
            appointments = appointments.filter(
                start_time__gte=timezone.now(),
                status__in=['scheduled', 'confirmed']
            )
        elif status_filter == 'past':
            appointments = appointments.filter(
                Q(start_time__lt=timezone.now()) | Q(status__in=['completed', 'cancelled', 'no_show'])
            )
        elif status_filter != 'all':
            appointments = appointments.filter(status=status_filter)
        
        # Order by date
        appointments = appointments.order_by('-start_time')
        
        appointments_data = []
        for appointment in appointments:
            appointment_data = {
                'id': str(appointment.appointment_id),
                'doctor_name': f"Dr. {appointment.staff.first_name or ''} {appointment.staff.last_name or ''}".strip() or f"Dr. {appointment.staff.user.full_name}",
                'doctor_specialty': appointment.staff.specialization or appointment.staff.role_title,
                'date': appointment.start_time.strftime('%Y-%m-%d') if appointment.start_time else None,
                'time': appointment.start_time.strftime('%H:%M') if appointment.start_time else None,
                'status': appointment.status,
                'reason': appointment.reason or 'General Consultation',
                'fee': float(appointment.fee) if appointment.fee else None
            }
            appointments_data.append(appointment_data)
        
        return Response({'appointments': appointments_data}, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def book_appointment(request):
    """Book a new appointment"""
    try:
        # Try to get patient profile
        try:
            patient = Patient.objects.get(user=request.user)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Patient profile not found. Please contact admin to set up your profile.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        data = request.data
        
        # Validate required fields
        required_fields = ['doctor_id', 'date', 'time', 'service']
        for field in required_fields:
            if field not in data:
                return Response(
                    {'error': f'{field} is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Get and validate staff
        try:
            staff = Staff.objects.get(staff_id=data['doctor_id'])
        except Staff.DoesNotExist:
            return Response(
                {'error': 'Doctor not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Parse date and time
        try:
            appointment_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            appointment_time = datetime.strptime(data['time'], '%H:%M').time()
            start_datetime = timezone.make_aware(datetime.combine(appointment_date, appointment_time))
        except ValueError as e:
            return Response(
                {'error': 'Invalid date or time format'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if date/time is in the past
        if start_datetime < timezone.now():
            return Response(
                {'error': 'Cannot book appointment in the past'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check for conflicting appointments
        existing_appointment = Appointment.objects.filter(
            staff=staff,
            start_time=start_datetime,
            status__in=['scheduled', 'confirmed', 'in_progress']
        ).exists()
        
        if existing_appointment:
            return Response(
                {'error': 'This time slot is no longer available'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find service duration
        service_info = next((s for s in AVAILABLE_SERVICES if s['id'] == data['service']), None)
        duration_mins = service_info['duration_mins'] if service_info else 30
        
        # Calculate end time
        end_datetime = start_datetime + timedelta(minutes=duration_mins)
        
        # Create appointment
        appointment = Appointment.objects.create(
            patient=patient,
            staff=staff,
            start_time=start_datetime,
            end_time=end_datetime,
            reason=data.get('reason', service_info['title'] if service_info else 'General Consultation'),
            status='scheduled'
        )
        
        # Return appointment details
        appointment_data = {
            'id': str(appointment.appointment_id),
            'doctor_name': f"Dr. {staff.first_name or ''} {staff.last_name or ''}".strip() or f"Dr. {staff.user.full_name}",
            'date': appointment.start_time.strftime('%Y-%m-%d'),
            'time': appointment.start_time.strftime('%H:%M'),
            'service': service_info['title'] if service_info else data['service'],
            'status': appointment.status,
            'reason': appointment.reason
        }
        
        return Response(
            {
                'message': 'Your appointment has been successfully booked. See you soon!',
                'appointment': appointment_data
            }, 
            status=status.HTTP_201_CREATED
        )
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def test_endpoint(request):
    """Simple test endpoint to verify URL routing"""
    return Response({'message': 'Test endpoint working'}, status=status.HTTP_200_OK)
