from rest_framework import status, generics, serializers
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta, time
from django.db.models import Q
import json

from staff.serializers import ChronicConditionSerializer, AllergySerializer, PastSurgerySerializer

from staff.models import Patient, Appointment, Treatment, Invoice, MedicalRecord, Staff, Service, Diagnosis, ChronicCondition, Allergy, PastSurgery, ChronicCondition, Allergy, PastSurgery


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
                'medical_records_count': 3
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
            status__in=['unpaid', 'pending', 'overdue']
        )
        
        # Get recent treatments
        recent_treatments = Treatment.objects.filter(
            appointment__patient=patient
        ).select_related('appointment__staff__user', 'appointment__medical_record', 'service').order_by('-appointment__start_time')[:3]
        
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
            # Get doctor name from appointment staff
            doctor_name = 'N/A'
            if treatment.appointment and treatment.appointment.staff:
                doctor_name = f"Dr. {treatment.appointment.staff.first_name or ''} {treatment.appointment.staff.last_name or ''}".strip()
                if not doctor_name or doctor_name == 'Dr.':
                    doctor_name = f"Dr. {treatment.appointment.staff.user.full_name}" if treatment.appointment.staff.user else 'N/A'
            
            # Get notes from medical record if available
            notes = 'Treatment completed'
            if treatment.appointment and treatment.appointment.medical_record:
                medical_record = treatment.appointment.medical_record
                if medical_record.chief_complaint:
                    notes = medical_record.chief_complaint
                elif medical_record.examination_notes:
                    notes = medical_record.examination_notes
            
            # Get total cost from invoice instead of individual treatment cost
            total_cost = 0
            if treatment.appointment:
                invoice = Invoice.objects.filter(appointment=treatment.appointment).first()
                if invoice:
                    total_cost = float(invoice.total_amount)
            
            latest_treatment = {
                'treatment_id': str(treatment.treatment_id),
                'treatment_type': treatment.service.name if treatment.service else 'Unknown Treatment',
                'description': treatment.description or f'{treatment.service.name if treatment.service else "Treatment"} service',
                'date': treatment.appointment.start_time.strftime('%Y-%m-%d') if treatment.appointment else None,
                'doctor_name': doctor_name,
                'notes': notes,
                'cost': total_cost
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
                    'date': apt.appointment_date.strftime('%Y-%m-%d') if apt.appointment_date else (apt.start_time.strftime('%Y-%m-%d') if apt.start_time else 'TBD'),
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
@permission_classes([])
def available_services(request):
    """Get list of available services"""
    services = Service.objects.filter(is_active=True).order_by('name')
    services_data = [
        {
            'id': str(service.service_id),
            'title': service.name,
            'subtitle': service.description or f'Standard {service.name.lower()} service',
            'duration_mins': 30,  # Default duration, can be customized later
            'price': float(service.price)
        }
        for service in services
    ]
    return Response({'services': services_data}, status=status.HTTP_200_OK)


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
        required_fields = ['doctor_id', 'date', 'time', 'service_ids']
        for field in required_fields:
            if field not in data:
                return Response(
                    {'error': f'{field} is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        service_ids = data['service_ids']
        if not isinstance(service_ids, list) or len(service_ids) == 0:
            return Response(
                {'error': 'service_ids must be a non-empty list'}, 
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
        
        # Get and validate services
        services = []
        for service_id in service_ids:
            try:
                service = Service.objects.get(service_id=service_id, is_active=True)
                services.append(service)
            except Service.DoesNotExist:
                return Response(
                    {'error': f'Service {service_id} not found or not available'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # Use service duration (default to 30 mins if not specified)
        duration_mins = 30  # Can be added to Service model later
        
        # Calculate end time
        end_datetime = start_datetime + timedelta(minutes=duration_mins)
        
        # Create appointment
        appointment = Appointment.objects.create(
            patient=patient,
            staff=staff,
            start_time=start_datetime,
            end_time=end_datetime,
            appointment_date=start_datetime,  # Save the appointment time in both fields
            reason=data.get('reason', ', '.join(s.name for s in services)),
            status='scheduled'
        )
        
        # Note: Treatments are created during the prescription modal, not during booking
        
        # Calculate total amount
        total_amount = sum(float(service.price) for service in services)
        
        # Create invoice
        Invoice.objects.create(
            patient=patient,
            appointment=appointment,
            total_amount=total_amount,
            paid_amount=0,
            status='unpaid',
            issued_date=timezone.now().date(),
            due_date=timezone.now().date() + timedelta(days=30),
            is_approved=False
        )
        
        # Return appointment details
        appointment_data = {
            'id': str(appointment.appointment_id),
            'doctor_name': f"Dr. {staff.first_name or ''} {staff.last_name or ''}".strip() or f"Dr. {staff.user.full_name}",
            'date': appointment.start_time.strftime('%Y-%m-%d'),
            'time': appointment.start_time.strftime('%H:%M'),
            'services': [s.name for s in services],
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_bills(request):
    """
    API endpoint for patient bills - returns all invoices for the logged-in patient
    Similar to admin/billing but filtered to current patient only
    """
    try:
        # Get the patient profile for the logged-in user
        try:
            patient = Patient.objects.get(user=request.user)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Patient profile not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get all invoices for this patient with related data and prefetch treatments
        invoices = Invoice.objects.filter(patient=patient).select_related(
            'appointment', 'appointment__staff'
        ).prefetch_related('appointment__treatments__service').order_by('-issued_date')
        
        bills_data = []
        for invoice in invoices:
            # Get services/treatments from the appointment
            items = []
            calculated_total = 0.0
            
            if invoice.appointment:
                # Get treatments for this appointment with service details
                appointment_treatments = list(Treatment.objects.filter(
                    appointment_id=invoice.appointment.appointment_id
                ).select_related('service').order_by('created_at'))
                
                if appointment_treatments:
                    items = [
                        {
                            'name': t.service.name if t.service else 'Unknown Service',
                            'price': float(t.cost) if t.cost else 0
                        }
                        for t in appointment_treatments
                    ]
                    # Calculate total from all treatments
                    calculated_total = sum(float(t.cost) if t.cost else 0 for t in appointment_treatments)
                else:
                    # No treatments found - use invoice total as single item
                    items = [{
                        'name': 'General Service',
                        'price': float(invoice.total_amount or 0)
                    }]
                    calculated_total = float(invoice.total_amount or 0)
            else:
                # No appointment linked - use invoice total as single item
                items = [{
                    'name': 'General Service',
                    'price': float(invoice.total_amount or 0)
                }]
                calculated_total = float(invoice.total_amount or 0)
            
            # Determine payment status - map to frontend expected values
            payment_status = 'Unpaid'
            if invoice.status == 'paid':
                payment_status = 'Paid'
            elif invoice.status == 'partially_paid':
                payment_status = 'Unpaid'  # Show as Unpaid for partially paid invoices
            # All other statuses (unpaid, pending, overdue, cancelled) show as Unpaid
            
            # Get doctor name
            doctor_name = 'N/A'
            if invoice.appointment and invoice.appointment.staff:
                doctor_name = f"Dr. {invoice.appointment.staff.first_name or ''} {invoice.appointment.staff.last_name or ''}".strip()
                if not doctor_name or doctor_name == 'Dr.':
                    doctor_name = f"Dr. {invoice.appointment.staff.user.full_name}" if invoice.appointment.staff.user else 'N/A'
            
            # Get service title (use first treatment/service name, or "Invoice")
            title = items[0]['name'] if items else 'Invoice'
            
            bill_data = {
                'id': str(invoice.invoice_id),
                'title': title,
                'doctor': doctor_name,
                'date': invoice.issued_date.strftime('%Y-%m-%d'),
                'status': payment_status,
                'total': calculated_total,
                'items': items
            }
            bills_data.append(bill_data)
        
        return Response({'bills': bills_data}, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Patient bills error: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_prescriptions(request):
    """Get patient's prescriptions/medical history"""
    try:
        # Try to get patient profile
        try:
            patient = Patient.objects.get(user=request.user)
        except Patient.DoesNotExist:
            # Return empty list if no patient profile
            return Response({'prescriptions': []}, status=status.HTTP_200_OK)
        
        # Get patient's medical records (only those created by doctors, not nurses)
        medical_records = MedicalRecord.objects.filter(
            patient=patient
        ).select_related('created_by', 'staff').exclude(
            created_by__role_title='Nurse'
        ).order_by('-record_date')
        
        prescriptions_data = []
        for record in medical_records:
            # Get doctor name from created_by field
            doctor_name = 'N/A'
            if record.created_by:
                doctor_name = f"Dr. {record.created_by.first_name or ''} {record.created_by.last_name or ''}".strip()
                if not doctor_name or doctor_name == 'Dr.':
                    doctor_name = f"Dr. {record.created_by.user.full_name}" if record.created_by.user else 'N/A'
            elif record.staff:
                # Fallback to staff field if created_by is not set
                doctor_name = f"Dr. {record.staff.first_name or ''} {record.staff.last_name or ''}".strip()
                if not doctor_name or doctor_name == 'Dr.':
                    doctor_name = f"Dr. {record.staff.user.full_name}" if record.staff.user else 'N/A'
            
            # Get diagnosis from chief_complaint
            diagnosis = record.chief_complaint or 'No diagnosis recorded'
            
            # Get medications from diagnosis table
            diagnoses = Diagnosis.objects.filter(record=record)
            medications = []
            for diag in diagnoses:
                if diag.notes and diag.notes.strip():
                    medications.append(diag.notes.strip())
            
            prescription_data = {
                'id': str(record.record_id),
                'doctor': doctor_name,
                'date': record.record_date.strftime('%Y-%m-%d') if record.record_date else None,
                'diagnosis': diagnosis,
                'medications': medications,
                'record_date': record.record_date.strftime('%Y-%m-%d') if record.record_date else None,
            }
            prescriptions_data.append(prescription_data)
        
        return Response({'prescriptions': prescriptions_data}, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Patient prescriptions error: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_medical_history(request):
    """Get patient's complete medical history including visits, conditions, and radiology"""
    try:
        # Try to get patient profile
        try:
            patient = Patient.objects.get(user=request.user)
        except Patient.DoesNotExist:
            # Return empty data if no patient profile
            return Response({
                'visits': [],
                'conditions': {'chronic': [], 'allergies': [], 'surgeries': []},
                'radiology': []
            }, status=status.HTTP_200_OK)
        
        # Get visit history (appointments with medical records)
        visits = []
        appointments = Appointment.objects.filter(
            patient=patient
        ).select_related('staff__user', 'medical_record').order_by('-start_time')
        
        for appointment in appointments:
            # Get doctor name
            doctor_name = 'N/A'
            if appointment.staff:
                doctor_name = f"Dr. {appointment.staff.first_name or ''} {appointment.staff.last_name or ''}".strip()
                if not doctor_name or doctor_name == 'Dr.':
                    doctor_name = f"Dr. {appointment.staff.user.full_name}" if appointment.staff.user else 'N/A'
            
            # Get medical record data
            diagnosis = 'No diagnosis recorded'
            outcome_parts = []
            
            if appointment.medical_record:
                medical_record = appointment.medical_record
                
                # Build diagnosis from examination and diagnosis notes
                diagnosis_parts = []
                if medical_record.examination_notes:
                    diagnosis_parts.append(f"Examination: {medical_record.examination_notes}")
                if medical_record.diagnosis_notes:
                    diagnosis_parts.append(f"Diagnosis: {medical_record.diagnosis_notes}")
                if diagnosis_parts:
                    diagnosis = ' | '.join(diagnosis_parts)
                
                # Build outcome from outcome, treatment plan, and follow-up
                if medical_record.outcome:
                    outcome_parts.append(medical_record.outcome)
                if medical_record.treatment_plan:
                    outcome_parts.append(f"Treatment: {medical_record.treatment_plan}")
                if medical_record.follow_up_instructions:
                    outcome_parts.append(f"Follow-up: {medical_record.follow_up_instructions}")
                
                radiology_needed = medical_record.radiology_needed
            
            outcome = ' | '.join(outcome_parts) if outcome_parts else 'No outcome recorded'
            
            visit_data = {
                'id': str(appointment.appointment_id),
                'date': appointment.start_time.strftime('%Y-%m-%d') if appointment.start_time else None,
                'time': appointment.start_time.strftime('%H:%M') if appointment.start_time else None,
                'doctor': doctor_name,
                'reason': appointment.medical_record.chief_complaint if appointment.medical_record and appointment.medical_record.chief_complaint else (appointment.reason or 'General Consultation'),
                'diagnosis': diagnosis,
                'outcome': outcome,
                'radiology_needed': radiology_needed
            }
            visits.append(visit_data)
        
        # Get conditions from dedicated models
        chronic_conditions = ChronicCondition.objects.filter(patient=patient).values(
            'condition_id', 'condition_name', 'notes', 'status'
        )
        allergies = Allergy.objects.filter(patient=patient).values(
            'allergy_id', 'allergen_name', 'severity', 'reaction'
        )
        surgeries = PastSurgery.objects.filter(patient=patient).values(
            'surgery_id', 'procedure_name', 'surgery_date', 'surgeon', 'hospital', 'notes', 'complications'
        ).order_by('-surgery_date')
        
        # Get radiology summary (appointments where radiology was needed)
        radiology = []
        radiology_appointments = Appointment.objects.filter(
            patient=patient,
            medical_record__radiology_needed=True
        ).select_related('medical_record').order_by('-start_time')
        
        for appointment in radiology_appointments:
            if appointment.medical_record:
                rad_data = {
                    'id': f"rad_{appointment.appointment_id}",
                    'type': 'Dental Radiology',
                    'date': appointment.start_time.strftime('%Y-%m-%d') if appointment.start_time else None,
                    'status': 'Completed' if appointment.status == 'completed' else 'Pending'
                }
                radiology.append(rad_data)
        
        return Response({
            'visits': visits,
            'conditions': {
                'chronic': chronic_conditions,
                'allergies': allergies,
                'surgeries': surgeries
            },
            'radiology': radiology
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Patient medical history error: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class ChronicConditionListView(generics.ListCreateAPIView):
    """List and create chronic conditions for the current patient"""
    serializer_class = ChronicConditionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            patient = Patient.objects.get(user=self.request.user)
            return ChronicCondition.objects.filter(patient=patient).order_by('condition_name')
        except Patient.DoesNotExist:
            return ChronicCondition.objects.none()

    def perform_create(self, serializer):
        try:
            patient = Patient.objects.get(user=self.request.user)
            serializer.save(patient=patient)
        except Patient.DoesNotExist:
            raise serializers.ValidationError("Patient profile not found")


class ChronicConditionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete chronic condition for the current patient"""
    serializer_class = ChronicConditionSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'condition_id'

    def get_queryset(self):
        try:
            patient = Patient.objects.get(user=self.request.user)
            return ChronicCondition.objects.filter(patient=patient)
        except Patient.DoesNotExist:
            return ChronicCondition.objects.none()


class AllergyListView(generics.ListCreateAPIView):
    """List and create allergies for the current patient"""
    serializer_class = AllergySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            patient = Patient.objects.get(user=self.request.user)
            return Allergy.objects.filter(patient=patient).order_by('allergen_name')
        except Patient.DoesNotExist:
            return Allergy.objects.none()

    def perform_create(self, serializer):
        try:
            patient = Patient.objects.get(user=self.request.user)
            serializer.save(patient=patient)
        except Patient.DoesNotExist:
            raise serializers.ValidationError("Patient profile not found")


class AllergyDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete allergy for the current patient"""
    serializer_class = AllergySerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'allergy_id'

    def get_queryset(self):
        try:
            patient = Patient.objects.get(user=self.request.user)
            return Allergy.objects.filter(patient=patient)
        except Patient.DoesNotExist:
            return Allergy.objects.none()


class PastSurgeryListView(generics.ListCreateAPIView):
    """List and create past surgeries for the current patient"""
    serializer_class = PastSurgerySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            patient = Patient.objects.get(user=self.request.user)
            return PastSurgery.objects.filter(patient=patient).order_by('-surgery_date')
        except Patient.DoesNotExist:
            return PastSurgery.objects.none()

    def perform_create(self, serializer):
        try:
            patient = Patient.objects.get(user=self.request.user)
            serializer.save(patient=patient)
        except Patient.DoesNotExist:
            raise serializers.ValidationError("Patient profile not found")


class PastSurgeryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete past surgery for the current patient"""
    serializer_class = PastSurgerySerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'surgery_id'

    def get_queryset(self):
        try:
            patient = Patient.objects.get(user=self.request.user)
            return PastSurgery.objects.filter(patient=patient)
        except Patient.DoesNotExist:
            return PastSurgery.objects.none()
