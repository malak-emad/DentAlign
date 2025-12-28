from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.http import JsonResponse
from django.utils import timezone
from django.db.models import Sum, Count, Q, Avg
from datetime import datetime, timedelta

# Import models from staff app (where the real models are defined)
from staff.models import Patient, Staff, Appointment, Treatment, Invoice, Payment, Service

# Create your views here.


@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Use proper authentication like staff
def dashboard_stats(request):
    """
    API endpoint for admin dashboard statistics - DEBUGGING VERSION
    """
    try:
        today = timezone.now().date()
        this_month = timezone.now().replace(day=1).date()
        
        # Start simple - test basic queries one by one
        try:
            total_patients = Patient.objects.count()
        except Exception as e:
            total_patients = f"Error: {str(e)}"
            
        try:
            total_staff = Staff.objects.count()
        except Exception as e:
            total_staff = f"Error: {str(e)}"
            
        try:
            today_appointments = Appointment.objects.filter(start_time__date=today).count()
        except Exception as e:
            today_appointments = f"Error: {str(e)}"
            
        try:
            # Total revenue from all paid_amount in invoices table (exclude cancelled appointments)
            total_revenue_query = Invoice.objects.all().select_related('appointment')
            
            # Calculate total revenue excluding cancelled appointments
            total_revenue = 0
            for invoice in total_revenue_query:
                # Only count if appointment is not cancelled (or if no appointment linked)
                if not invoice.appointment or invoice.appointment.status != 'cancelled':
                    total_revenue += float(invoice.paid_amount or 0)
                    
        except Exception as e:
            total_revenue = f"Error: {str(e)}"
            
        try:
            # Number of available services
            total_services = Service.objects.count()
        except Exception as e:
            total_services = f"Error: {str(e)}"
            
        try:
            # Recent appointments (last 5 appointments)
            recent_appointments_query = Appointment.objects.select_related(
                'patient', 'staff'
            ).order_by('-start_time')[:5]
            
            recent_appointments = []
            for appointment in recent_appointments_query:
                appointment_data = {
                    'appointment_id': str(appointment.appointment_id),
                    'patientName': f"{appointment.patient.first_name} {appointment.patient.last_name}" if appointment.patient else "Unknown Patient",
                    'doctorName': f"Dr. {appointment.staff.first_name} {appointment.staff.last_name}" if appointment.staff else "Unknown Doctor",
                    'time': appointment.start_time.strftime('%b %d, %Y %I:%M %p') if appointment.start_time else "Unknown Time",
                    'status': appointment.status,
                    'reason': appointment.reason or "General Consultation"
                }
                recent_appointments.append(appointment_data)
        except Exception as e:
            recent_appointments = []
        
        # Simple response to debug
        stats = {
            'patients': {
                'total': total_patients,
                'new_this_month': 0,  # Temporarily disabled
            },
            'staff': {
                'total': total_staff,
                'doctors': 0,  # Temporarily disabled
                'nurses': 0,   # Temporarily disabled
                'support': 0,  # Temporarily disabled
            },
            'appointments': {
                'today': today_appointments,
                'this_week': 0,  # Temporarily disabled
                'pending': 0,    # Temporarily disabled
            },
            'revenue': {
                'total': total_revenue,
                'this_month': 0,  # Can add monthly breakdown later if needed
                'growth_percentage': 0,
            },
            'treatments': {
                'total': total_services,
                'this_month': 0,  # Can add this later if needed
            },
            'recent_activities': {
                'recent_appointments': recent_appointments,
                'system_overview': {
                    'activeServices': total_services,  # Use total services as active services
                    'pendingReports': 0,
                    'systemStatus': 'Operational'
                }
            },
            'user': request.user.username if hasattr(request.user, 'username') else 'Admin',
        }
        
        return Response(stats, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': f'Dashboard error: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def services_list(request):
    """
    API endpoint for admin services list - from services_available table (catalog of available services)
    """
    try:
        # Get all available services from the services catalog
        services = Service.objects.all().order_by('name')
        
        services_data = []
        for service in services:
            service_data = {
                'id': str(service.service_id),
                'service_name': service.name,
                'price': float(service.price),
                'description': service.description or '',
                'is_active': service.is_active,
                'date': service.created_at.strftime('%Y-%m-%d') if service.created_at else '',
                'status': 'Active' if service.is_active else 'Inactive'
            }
            services_data.append(service_data)
        
        # Get some summary stats
        total_services = len(services_data)
        active_services = len([s for s in services_data if s['is_active']])
        avg_price = sum(s['price'] for s in services_data) / total_services if total_services > 0 else 0
        
        response_data = {
            'services': services_data,
            'summary': {
                'total_services': total_services,
                'active_services': active_services,
                'average_price': round(avg_price, 2)
            }
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': f'Services error: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_service(request):
    """
    API endpoint to add a new service - saves to services_available table (catalog)
    """
    try:
        service_name = request.data.get('name')
        price = request.data.get('price')
        description = request.data.get('description', '')
        
        if not service_name or price is None:
            return Response(
                {'error': 'Service name and price are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if service with same name already exists
        if Service.objects.filter(name=service_name).exists():
            return Response(
                {'error': f'Service "{service_name}" already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create a new service in the catalog
        new_service = Service(
            name=service_name,
            price=float(price),
            description=description,
            is_active=True
        )
        new_service.save()
        
        # Return the created service data
        service_data = {
            'id': str(new_service.service_id),
            'service_name': new_service.name,
            'price': float(new_service.price),
            'description': new_service.description or '',
            'is_active': new_service.is_active,
            'date': new_service.created_at.strftime('%Y-%m-%d'),
            'status': 'Active'
        }
        
        return Response(service_data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Add service error: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def schedules_list(request):
    """
    API endpoint for admin schedules list - from appointments table
    Gets service name from related treatments and payment status from related invoices
    """
    try:
        # Get all appointments with related data
        appointments = Appointment.objects.select_related('patient', 'staff').order_by('-start_time')
        
        schedules_data = []
        for appointment in appointments:
            # Get service name from treatments - look for treatments for this patient
            service_name = 'General Consultation'
            try:
                # Look for treatments for this patient around the appointment time
                patient_treatments = Treatment.objects.filter(appointment__patient=appointment.patient).order_by('-created_at')
                if patient_treatments.exists():
                    # Use the most recent treatment for this patient
                    service_name = patient_treatments.first().description or 'General Consultation'
            except Exception:
                service_name = 'General Consultation'
            
            # Get payment status from invoices linked to this appointment
            payment_status = 'Pending'
            try:
                # Use the proper relationship - invoices have appointment foreign key
                appointment_invoice = Invoice.objects.filter(appointment=appointment).first()
                if appointment_invoice:
                    # Map database status to display status
                    status_mapping = {
                        'pending': 'Pending',
                        'paid': 'Paid',
                        'overdue': 'Overdue', 
                        'cancelled': 'Cancelled',
                        'partially_paid': 'Pending',
                        'partial': 'Pending',
                        'unpaid': 'Unpaid'
                    }
                    payment_status = status_mapping.get(appointment_invoice.status, 'Pending')
                    print(f"Appointment {appointment.appointment_id}: Found invoice {appointment_invoice.invoice_id} with status '{appointment_invoice.status}' -> mapped to '{payment_status}'")
                elif appointment.status == 'completed':
                    payment_status = 'Paid' 
                elif appointment.status == 'cancelled':
                    payment_status = 'Cancelled'
                else:
                    print(f"Appointment {appointment.appointment_id}: No linked invoice, status is '{appointment.status}' -> defaulting to 'Pending'")
            except Exception as e:
                print(f"Error getting payment status for appointment {appointment.appointment_id}: {str(e)}")
                # Fallback to appointment status
                if appointment.status == 'completed':
                    payment_status = 'Paid' 
                elif appointment.status == 'cancelled':
                    payment_status = 'Cancelled'
            except Exception:
                payment_status = 'Pending'
            
            schedule = {
                'id': str(appointment.appointment_id),
                'patient_name': f"{appointment.patient.first_name} {appointment.patient.last_name}" if appointment.patient else 'Unknown Patient',
                'staff_name': f"Dr. {appointment.staff.first_name} {appointment.staff.last_name}" if appointment.staff else 'Unknown Staff',
                'service_name': service_name,  # From treatments table
                'date': appointment.start_time.strftime('%Y-%m-%d') if appointment.start_time else 'Unknown Date',
                'time': appointment.start_time.strftime('%H:%M') if appointment.start_time else 'Unknown Time',
                'duration': '30 min',  # Default duration
                'status': appointment.status or 'Scheduled',
                'payment_status': payment_status,
                'notes': appointment.reason or ''  # Using reason as notes for now
            }
            schedules_data.append(schedule)
        
        # Get some summary stats
        total_appointments = len(schedules_data)
        today_appointments = len([s for s in schedules_data if s['date'] == timezone.now().strftime('%Y-%m-%d')])
        completed_appointments = len([s for s in schedules_data if s['status'] == 'completed'])
        
        response_data = {
            'schedules': schedules_data,
            'summary': {
                'total_appointments': total_appointments,
                'today_appointments': today_appointments,
                'completed_appointments': completed_appointments,
                'pending_appointments': total_appointments - completed_appointments
            }
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': f'Schedules error: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def staff_list(request):
    """
    API endpoint for admin staff list - from staff table
    Gets all staff with their details including license number and specialization
    """
    try:
        # Get all verified staff with related user data
        staff_members = Staff.objects.select_related('user').filter(user__is_verified=True).order_by('first_name', 'last_name')
        
        staff_data = []
        for staff in staff_members:
            staff_item = {
                'id': str(staff.staff_id),
                'full_name': f"{staff.first_name or ''} {staff.last_name or ''}".strip() or staff.user.username,
                'first_name': staff.first_name or '',
                'last_name': staff.last_name or '',
                'role_title': staff.role_title or 'Staff',
                'specialization': staff.specialization or 'General',
                'license_number': staff.license_number or 'N/A',
                'phone': staff.phone or 'N/A',
                'email': staff.user.email if staff.user else 'N/A',
                'status': 'active' if staff.is_active else 'inactive',  # Show actual active status
                'created_at': staff.created_at.strftime('%Y-%m-%d') if staff.created_at else 'Unknown'
            }
            staff_data.append(staff_item)
        
        # Get some summary stats
        total_staff = len(staff_data)
        doctors = len([s for s in staff_data if 'doctor' in s['role_title'].lower()])
        nurses = len([s for s in staff_data if 'nurse' in s['role_title'].lower()])
        
        response_data = {
            'staff': staff_data,
            'summary': {
                'total_staff': total_staff,
                'doctors': doctors,
                'nurses': nurses,
                'other': total_staff - doctors - nurses
            }
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': f'Staff list error: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def user_approvals_list(request):
    """
    API endpoint for admin user approvals - from users table
    Gets users with role 'doctor', 'staff', or 'nurse' who have is_verified=False
    """
    try:
        from accounts.models import User, Role

        # Get doctor, staff, and nurse roles
        doctor_role = Role.objects.filter(name__iexact='doctor').first()
        staff_role = Role.objects.filter(name__iexact='staff').first()
        nurse_role = Role.objects.filter(name__iexact='nurse').first()

        # Get users with doctor/staff/nurse role who are not verified
        pending_users = User.objects.filter(
            Q(role=doctor_role) | Q(role=staff_role) | Q(role=nurse_role),
            is_verified=False
        ).select_related('role').order_by('-created_at')

        approvals_data = []
        for user in pending_users:
            approval_item = {
                'id': str(user.user_id),
                'user_id': str(user.user_id),
                'full_name': user.full_name,
                'first_name': user.full_name.split(' ')[0] if user.full_name else '',
                'last_name': ' '.join(user.full_name.split(' ')[1:]) if user.full_name and len(user.full_name.split(' ')) > 1 else '',
                'email': user.email,
                'role': user.role.name if user.role else 'Unknown',
                'specialization': '',  # Will be filled when staff record is created
                'license_number': user.medical_license_number or 'N/A',
                'phone': '',  # Will be filled when staff record is created
                'is_verified': user.is_verified,
                'created_at': user.created_at.strftime('%Y-%m-%d') if user.created_at else 'Unknown'
            }
            approvals_data.append(approval_item)

        # Get some summary stats
        total_requests = len(approvals_data)
        pending_requests = total_requests  # All are pending since we filter by is_verified=False
        approved_requests = User.objects.filter(
            Q(role=doctor_role) | Q(role=staff_role) | Q(role=nurse_role),
            is_verified=True
        ).count()

        response_data = {
            'requests': approvals_data,
            'summary': {
                'total_requests': total_requests,
                'pending_requests': pending_requests,
                'approved_requests': approved_requests
            }
        }

        return Response(response_data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': f'User approvals error: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def approve_user(request, user_id):
    """
    API endpoint to approve a user by setting is_verified=True and creating staff record
    """
    try:
        from accounts.models import User
        from django.db import transaction

        with transaction.atomic():
            user = User.objects.select_related('role').get(user_id=user_id)

            # Set user as approved and verified
            user.is_approved = True
            user.is_verified = True
            user.save()

            # Create staff record if it doesn't exist
            staff, created = Staff.objects.get_or_create(
                user=user,
                defaults={
                    'first_name': user.full_name.split(' ')[0] if user.full_name else '',
                    'last_name': ' '.join(user.full_name.split(' ')[1:]) if user.full_name and len(user.full_name.split(' ')) > 1 else '',
                    'role_title': user.role.name if user.role else 'Staff',
                    'license_number': user.medical_license_number,
                    'is_active': True  # Set as active by default after approval
                }
            )

            # If staff record already existed, make sure it's active
            if not created:
                staff.is_active = True
                staff.save()

            return Response({
                'message': f'User {user.full_name} has been approved and verified successfully',
                'user_id': str(user.user_id),
                'is_approved': user.is_approved,
                'is_verified': user.is_verified,
                'staff_created': created,
                'staff_id': str(staff.staff_id) if staff else None
            }, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Approval error: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def reject_user(request, user_id):
    """
    API endpoint to reject a user by setting is_verified=False
    """
    try:
        # Import User model
        from accounts.models import User
        
        user = User.objects.get(user_id=user_id)
        user.is_verified = False
        user.save()
        
        return Response({
            'message': f'User {user.username} has been rejected',
            'user_id': str(user.user_id),
            'is_verified': user.is_verified
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Rejection error: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def patients_list(request):
    """
    API endpoint for admin patients list - from patients table
    Gets all patients with their basic information
    """
    try:
        # Get all patients ordered by creation date (newest first)
        patients = Patient.objects.all().order_by('-created_at')
        
        patients_data = []
        for patient in patients:
            patient_item = {
                'patient_id': str(patient.patient_id),
                'full_name': patient.full_name,
                'first_name': patient.first_name,
                'last_name': patient.last_name,
                'email': patient.email,
                'phone': patient.phone or 'N/A',
                'dob': patient.dob.strftime('%Y-%m-%d') if patient.dob else 'N/A',
                'gender': patient.gender or 'N/A',
                'address': patient.address or 'N/A',
                'created_at': patient.created_at.strftime('%Y-%m-%d') if patient.created_at else 'Unknown'
            }
            patients_data.append(patient_item)
        
        # Get some summary stats
        total_patients = len(patients_data)
        today = timezone.now().date()
        today_patients = len([p for p in patients_data if p['created_at'] == today.strftime('%Y-%m-%d')])
        
        response_data = {
            'patients': patients_data,
            'summary': {
                'total_patients': total_patients,
                'today_patients': today_patients
            }
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': f'Patients list error: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def patient_details(request, patient_id):
    """
    API endpoint for admin patient details - from patients table with related data
    Gets individual patient with appointments, invoices, and medical records
    """
    try:
        # Get patient with related data
        patient = Patient.objects.select_related('user').get(patient_id=patient_id)
        
        # Get patient's appointments with related staff and treatments
        appointments = Appointment.objects.filter(patient=patient).select_related('staff').order_by('-start_time')
        appointments_data = []
        for appointment in appointments:
            # Get service name from treatments - look for treatments for this patient
            service_name = "General Consultation"
            try:
                # Look for treatments for this patient around the appointment time
                patient_treatments = Treatment.objects.filter(appointment__patient=appointment.patient).order_by('-created_at')
                if patient_treatments.exists():
                    # Use the most recent treatment for this patient
                    service_name = patient_treatments.first().description or service_name
            except Exception:
                pass
            
            appointment_data = {
                'id': str(appointment.appointment_id),
                'date': appointment.start_time.strftime('%Y-%m-%d'),
                'time': appointment.start_time.strftime('%H:%M'),
                'doctor': f"{appointment.staff.first_name or ''} {appointment.staff.last_name or ''}".strip() or appointment.staff.user.username,
                'service': service_name,
                'status': appointment.status,
                'fee': str(appointment.fee) if appointment.fee else '0.00'
            }
            appointments_data.append(appointment_data)
        
        # Get patient's invoices (exclude invoices for cancelled appointments)
        invoices = Invoice.objects.filter(patient=patient).select_related('appointment').order_by('-created_at')
        invoices_data = []
        for invoice in invoices:
            # Check if related appointment is cancelled
            is_cancelled_appointment = invoice.appointment and invoice.appointment.status == 'cancelled'
            
            invoice_data = {
                'id': str(invoice.invoice_id),
                'date': invoice.issued_date.strftime('%Y-%m-%d'),
                'amount': float(invoice.total_amount),
                'paid_amount': float(invoice.paid_amount),
                'status': invoice.status,
                'due_date': invoice.due_date.strftime('%Y-%m-%d'),
                'is_overdue': invoice.is_overdue,
                'is_cancelled_appointment': is_cancelled_appointment  # Flag for frontend
            }
            invoices_data.append(invoice_data)
        
        # Calculate age from date of birth
        age = 'N/A'
        if patient.dob:
            from datetime import date
            today = date.today()
            age = today.year - patient.dob.year - ((today.month, today.day) < (patient.dob.month, patient.dob.day))
        
        patient_data = {
            'id': str(patient.patient_id),
            'full_name': patient.full_name,
            'first_name': patient.first_name,
            'last_name': patient.last_name,
            'email': patient.email,
            'phone': patient.phone or 'N/A',
            'dob': patient.dob.strftime('%Y-%m-%d') if patient.dob else 'N/A',
            'age': age,
            'gender': patient.gender or 'N/A',
            'address': patient.address or 'N/A',
            'medical_history': patient.medical_history or 'N/A',
            'registered_at': patient.created_at.strftime('%Y-%m-%d') if patient.created_at else 'Unknown',
            'appointments': appointments_data,
            'invoices': invoices_data
        }
        
        return Response(patient_data, status=status.HTTP_200_OK)
        
    except Patient.DoesNotExist:
        return Response(
            {'error': 'Patient not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Patient details error: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def invoices_list(request):
    """
    API endpoint for admin invoices - invoices pending approval (is_approved=False)
    """
    try:
        # Get invoices pending approval with related data and prefetch treatments
        invoices = Invoice.objects.filter(is_approved=False).select_related(
            'patient', 'appointment', 'appointment__patient', 'appointment__staff'
        ).prefetch_related('appointment__treatments').order_by('-created_at')
        
        invoices_data = []
        for invoice in invoices:
            # Get services from appointment or default
            services = []
            calculated_total = 0.0
            if invoice.appointment:
                # IMPORTANT: Get treatments ONLY for this specific appointment
                # Use explicit filter with select_related to get service details
                appointment_treatments = list(Treatment.objects.filter(
                    appointment_id=invoice.appointment.appointment_id
                ).select_related('service').order_by('created_at'))
                
                # Debug: Log what we're getting
                print(f"DEBUG Invoice {invoice.invoice_id}: Patient {invoice.patient.full_name}, Appointment {invoice.appointment.appointment_id}")
                print(f"DEBUG Found {len(appointment_treatments)} treatments:")
                for t in appointment_treatments:
                    service_name = t.service.name if t.service else 'Unknown Service'
                    cost = float(t.cost) if t.cost else 0
                    print(f"  - {service_name} (cost: {cost}, appointment_id: {t.appointment.appointment_id})")
                
                if appointment_treatments:
                    services = [
                        {
                            'name': t.service.name if t.service else 'Unknown Service',
                            'price': float(t.cost) if t.cost else 0
                        }
                        for t in appointment_treatments
                    ]
                    # Calculate total from all treatments in the appointment
                    calculated_total = sum(float(t.cost) if t.cost else 0 for t in appointment_treatments)
                else:
                    # No treatments found for this appointment - return empty services
                    services = []
                    calculated_total = 0.0
            else:
                # No appointment linked - return empty services
                services = []
                calculated_total = 0.0
            
            # Determine approval status - for unapproved invoices in this list, status is 'pending'
            approval_status = 'pending'
            
            appointment_status = invoice.appointment.status if invoice.appointment else 'N/A'
            invoice_data = {
                'id': str(invoice.invoice_id),
                'patient': invoice.patient.full_name,
                'doctor': f"Dr. {invoice.appointment.staff.first_name} {invoice.appointment.staff.last_name}" if invoice.appointment and invoice.appointment.staff else 'N/A',
                'date': invoice.issued_date.strftime('%Y-%m-%d'),
                'total': calculated_total,  # Use calculated total from treatments
                'status': approval_status,
                'appointmentStatus': appointment_status,
                'services': services
            }
            invoices_data.append(invoice_data)
        
        return Response(invoices_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Invoices list error: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def billing_list(request):
    """
    API endpoint for admin billing - approved invoices only (is_approved=True)
    """
    try:
        # Get approved invoices with related data and prefetch treatments
        invoices = Invoice.objects.filter(is_approved=True).select_related(
            'patient', 'appointment', 'appointment__patient', 'appointment__staff'
        ).prefetch_related('appointment__treatments').order_by('-created_at')
        
        invoices_data = []
        for invoice in invoices:
            # Get services from appointment or default
            services = []
            calculated_total = 0.0
            if invoice.appointment:
                # IMPORTANT: Get treatments ONLY for this specific appointment
                # Use explicit filter with select_related to get service details
                appointment_treatments = list(Treatment.objects.filter(
                    appointment_id=invoice.appointment.appointment_id
                ).select_related('service').order_by('created_at'))
                
                # Debug: Log what we're getting
                print(f"DEBUG Invoice {invoice.invoice_id}: Patient {invoice.patient.full_name}, Appointment {invoice.appointment.appointment_id}")
                print(f"DEBUG Found {len(appointment_treatments)} treatments:")
                for t in appointment_treatments:
                    service_name = t.service.name if t.service else 'Unknown Service'
                    cost = float(t.cost) if t.cost else 0
                    print(f"  - {service_name} (cost: {cost}, appointment_id: {t.appointment.appointment_id})")
                
                if appointment_treatments:
                    services = [
                        {
                            'name': t.service.name if t.service else 'Unknown Service',
                            'price': float(t.cost) if t.cost else 0
                        }
                        for t in appointment_treatments
                    ]
                    # Calculate total from all treatments in the appointment
                    calculated_total = sum(float(t.cost) if t.cost else 0 for t in appointment_treatments)
                else:
                    # No treatments found for this appointment - return empty services
                    services = []
                    calculated_total = 0.0
            else:
                # No appointment linked - return empty services
                services = []
                calculated_total = 0.0
            
            invoice_data = {
                'id': str(invoice.invoice_id),
                'patient': invoice.patient.full_name,
                'doctor': f"Dr. {invoice.appointment.staff.first_name} {invoice.appointment.staff.last_name}" if invoice.appointment and invoice.appointment.staff else 'N/A',
                'date': invoice.issued_date.strftime('%Y-%m-%d'),
                'total': calculated_total,  # Use calculated total from treatments
                'status': 'approved',  # all billing items are approved
                'paymentStatus': invoice.status,  # payment status
                'services': services
            }
            invoices_data.append(invoice_data)
        
        return Response(invoices_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Billing list error: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def approve_invoice(request, invoice_id):
    """
    API endpoint to approve an invoice (set is_approved=True)
    """
    try:
        invoice = Invoice.objects.get(invoice_id=invoice_id)
        invoice.is_approved = True
        invoice.save()
        
        return Response({'message': 'Invoice approved successfully'}, status=status.HTTP_200_OK)
        
    except Invoice.DoesNotExist:
        return Response(
            {'error': 'Invoice not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Approve invoice error: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def reject_invoice(request, invoice_id):
    """
    API endpoint to reject an invoice (set is_approved=False)
    """
    try:
        invoice = Invoice.objects.get(invoice_id=invoice_id)
        invoice.is_approved = False
        invoice.status = 'cancelled'  # Also update payment status
        invoice.save()
        
        return Response({'message': 'Invoice rejected successfully'}, status=status.HTTP_200_OK)
        
    except Invoice.DoesNotExist:
        return Response(
            {'error': 'Invoice not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Reject invoice error: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def update_payment_status(request, invoice_id):
    """
    API endpoint to update payment status of an invoice
    """
    try:
        payment_status = request.data.get('status')
        if not payment_status:
            return Response(
                {'error': 'Payment status is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        invoice = Invoice.objects.get(invoice_id=invoice_id)
        invoice.status = payment_status
        
        # If marking as paid, update paid_amount
        if payment_status == 'paid':
            invoice.paid_amount = invoice.total_amount
        elif payment_status == 'unpaid':
            invoice.paid_amount = 0
            
        invoice.save()
        
        return Response({'message': f'Invoice marked as {payment_status} successfully'}, status=status.HTTP_200_OK)
        
    except Invoice.DoesNotExist:
        return Response(
            {'error': 'Invoice not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Update payment status error: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def reports_data(request):
    """
    API endpoint for admin reports - comprehensive clinic performance metrics
    """
    try:
        today = timezone.now().date()
        this_month_start = timezone.now().replace(day=1).date()
        
        # ===== METRICS =====
        # Total Revenue: Sum of ALL paid_amount values from invoices table (includes partially paid)
        total_revenue = Invoice.objects.aggregate(
            total=Sum('paid_amount')
        )['total'] or 0
        total_revenue = float(total_revenue)
        
        # Paid Invoices: Count of invoices where status = 'paid'
        paid_invoices = Invoice.objects.filter(status='paid').count()
        
        # Unpaid Invoices: Count of invoices where status != 'paid' (includes 'Partially', 'unpaid', etc.)
        unpaid_invoices = Invoice.objects.exclude(status='paid').count()
        
        # Total Visits: Count of appointments where status = 'completed'
        total_visits = Appointment.objects.filter(status='completed').count()
        
        # Active Doctors: Count of staff where role_title contains 'Doctor' or 'Dentist' AND is_active=True AND user.is_approved=True
        active_doctors = Staff.objects.filter(
            role_title__iregex=r'(Doctor|Dentist|Orthodontist)',
            is_active=True,
            user__is_approved=True
        ).count()
        
        # Active Nurses: Count of staff where role_title contains 'Nurse' AND is_active=True AND user.is_approved=True
        active_nurses = Staff.objects.filter(
            role_title__iregex=r'Nurse',
            is_active=True,
            user__is_approved=True
        ).count()
        
        # ===== REVENUE OVERVIEW =====
        # Today Revenue: Sum of ALL paid_amount from invoices where issued_date = today
        today_revenue = Invoice.objects.filter(
            issued_date=today
        ).aggregate(total=Sum('paid_amount'))['total'] or 0
        today_revenue = float(today_revenue)
        
        # This Month Revenue: Sum of ALL paid_amount from invoices where issued_date >= this_month_start
        month_revenue = Invoice.objects.filter(
            issued_date__gte=this_month_start
        ).aggregate(total=Sum('paid_amount'))['total'] or 0
        month_revenue = float(month_revenue)
        
        # Average Invoice: Average of total_amount from all invoices
        avg_invoice = Invoice.objects.aggregate(
            avg=Avg('total_amount')
        )['avg'] or 0
        avg_invoice = round(float(avg_invoice), 2)
        
        # ===== INVOICE STATUS =====
        # Pending: Count where is_approved IS NULL
        pending_invoices = Invoice.objects.filter(is_approved__isnull=True).count()
        
        # Approved: Count where is_approved = True
        approved_invoices = Invoice.objects.filter(is_approved=True).count()
        
        # Paid: Count where status = 'paid'
        paid_invoices_count = Invoice.objects.filter(status='paid').count()
        
        # Unpaid: Count where status != 'paid' (includes 'Partially', 'unpaid', etc.)
        unpaid_invoices_count = Invoice.objects.exclude(status='paid').count()
        
        # ===== DOCTOR PERFORMANCE =====
        # Get all active, approved doctors
        doctors = Staff.objects.filter(
            role_title__iregex=r'(Doctor|Dentist|Orthodontist)',
            is_active=True,
            user__is_approved=True
        ).select_related('user')
        
        doctor_stats = []
        for doctor in doctors:
            # Doctor name
            doctor_name = f"Dr. {doctor.first_name or ''} {doctor.last_name or ''}".strip()
            if not doctor_name or doctor_name == 'Dr.':
                doctor_name = f"Dr. {doctor.user.full_name}" if doctor.user else f"Dr. {doctor.staff_id}"
            
            # Visits: Count of appointments where staff_id = doctor.staff_id AND status = 'completed'
            visits = Appointment.objects.filter(
                staff=doctor,
                status='completed'
            ).count()
            
            # Revenue: Sum of ALL invoice.paid_amount for invoices linked to appointments where staff_id = doctor.staff_id
            doctor_appointments = Appointment.objects.filter(staff=doctor)
            doctor_revenue = Invoice.objects.filter(
                appointment__in=doctor_appointments
            ).aggregate(total=Sum('paid_amount'))['total'] or 0
            doctor_revenue = float(doctor_revenue)
            
            doctor_stats.append({
                'name': doctor_name,
                'visits': visits,
                'revenue': doctor_revenue
            })
        
        # ===== NURSE PERFORMANCE =====
        # Get all active, approved nurses
        nurses = Staff.objects.filter(
            role_title__iregex=r'Nurse',
            is_active=True,
            user__is_approved=True
        ).select_related('user')
        
        nurse_stats = []
        for nurse in nurses:
            # Nurse name
            nurse_name = f"{nurse.first_name or ''} {nurse.last_name or ''}".strip()
            if not nurse_name:
                nurse_name = nurse.user.full_name if nurse.user else f"Nurse {nurse.staff_id}"
            
            # Visits: Count of ALL appointments where staff_id = nurse.staff_id (any status)
            visits = Appointment.objects.filter(
                staff=nurse
            ).count()
            
            nurse_stats.append({
                'name': nurse_name,
                'visits': visits
            })
        
        # Sort both by their respective metrics (doctors by revenue, nurses by visits)
        doctor_stats.sort(key=lambda x: x['revenue'], reverse=True)
        nurse_stats.sort(key=lambda x: x['visits'], reverse=True)
        
        # Build response
        response_data = {
            'metrics': {
                'totalRevenue': total_revenue,
                'paidInvoices': paid_invoices,
                'unpaidInvoices': unpaid_invoices,
                'totalVisits': total_visits,
                'activeDoctors': active_doctors,
                'activeNurses': active_nurses
            },
            'revenue': {
                'today': today_revenue,
                'month': month_revenue,
                'avgInvoice': avg_invoice
            },
            'invoiceStats': [
                {'label': 'Pending', 'value': pending_invoices},
                {'label': 'Approved', 'value': approved_invoices},
                {'label': 'Paid', 'value': paid_invoices_count},
                {'label': 'Unpaid', 'value': unpaid_invoices_count}
            ],
            'doctorStats': doctor_stats,
            'nurseStats': nurse_stats
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Reports error: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deactivate_staff(request, staff_id):
    """
    API endpoint to deactivate a staff member (set is_active=False in staff table)
    """
    try:
        staff = Staff.objects.get(staff_id=staff_id)
        staff.is_active = False
        staff.save()
        
        return Response({'message': 'Staff member deactivated successfully'}, status=status.HTTP_200_OK)
        
    except Staff.DoesNotExist:
        return Response(
            {'error': 'Staff member not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Deactivate staff error: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def activate_staff(request, staff_id):
    """
    API endpoint to activate a staff member (set is_active=True in staff table)
    """
    try:
        staff = Staff.objects.get(staff_id=staff_id)
        staff.is_active = True
        staff.save()
        
        return Response({'message': 'Staff member activated successfully'}, status=status.HTTP_200_OK)
        
    except Staff.DoesNotExist:
        return Response(
            {'error': 'Staff member not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Activate staff error: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_staff(request, staff_id):
    """
    API endpoint to "delete" a staff member by deactivating them and removing their approvals
    Sets is_active=False in staff table, is_verified=False and is_approved=False in user table
    """
    try:
        staff = Staff.objects.get(staff_id=staff_id)
        
        # Deactivate in staff table
        staff.is_active = False
        staff.save()
        
        # Remove approvals in user table
        if staff.user:
            staff.user.is_verified = False
            staff.user.is_approved = False
            staff.user.save()
        
        return Response({'message': 'Staff member removed successfully'}, status=status.HTTP_200_OK)
        
    except Staff.DoesNotExist:
        return Response(
            {'error': 'Staff member not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Delete staff error: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )