from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.http import JsonResponse
from django.utils import timezone
from django.db.models import Sum, Count, Q
from datetime import datetime, timedelta

# Import models from staff app (where the real models are defined)
from staff.models import Patient, Staff, Appointment, Treatment, Invoice, Payment

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
            # Revenue from paid_amount in invoices table (exclude cancelled appointments)
            this_month_revenue_query = Invoice.objects.filter(
                created_at__date__gte=this_month
            ).select_related('appointment')
            
            # Calculate revenue excluding cancelled appointments
            this_month_revenue = 0
            for invoice in this_month_revenue_query:
                # Only count if appointment is not cancelled (or if no appointment linked)
                if not invoice.appointment or invoice.appointment.status != 'cancelled':
                    this_month_revenue += float(invoice.paid_amount or 0)
                    
        except Exception as e:
            this_month_revenue = f"Error: {str(e)}"
            
        try:
            # Number of services/treatments
            total_treatments = Treatment.objects.count()
        except Exception as e:
            total_treatments = f"Error: {str(e)}"
        
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
                'this_month': this_month_revenue,
                'last_month': 0,  # Temporarily disabled
                'growth_percentage': 0,
            },
            'treatments': {
                'total': total_treatments,
                'this_month': 0,  # Can add this later if needed
            },
            'recent_activities': {
                'recent_appointments': [],  # Temporarily empty
                'system_overview': {
                    'activeServices': total_treatments,  # Use total treatments as active services
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
    API endpoint for admin services list - from treatments table
    """
    try:
        # Get all treatments with service name from description and price from cost
        # Order by newest first (most recently created)
        treatments = Treatment.objects.all().order_by('-created_at')
        
        services_data = []
        for treatment in treatments:
            service = {
                'id': treatment.treatment_id,
                'service_name': treatment.description or 'Unnamed Service',
                'price': float(treatment.cost) if treatment.cost else 0.0,
                'patient_name': f"{treatment.patient.first_name} {treatment.patient.last_name}" if treatment.patient else 'Unknown Patient',
                'staff_name': f"Dr. {treatment.staff.first_name} {treatment.staff.last_name}" if treatment.staff else 'Unknown Staff',
                'date': treatment.created_at.strftime('%Y-%m-%d') if treatment.created_at else 'Unknown Date',
                'status': getattr(treatment, 'status', 'Completed')
            }
            services_data.append(service)
        
        # Get some summary stats
        total_services = len(services_data)
        total_revenue = sum(service['price'] for service in services_data)
        avg_price = total_revenue / total_services if total_services > 0 else 0
        
        response_data = {
            'services': services_data,
            'summary': {
                'total_services': total_services,
                'total_revenue': total_revenue,
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
    API endpoint to add a new service - saves to treatments table
    """
    try:
        service_name = request.data.get('name')
        price = request.data.get('price')
        
        if not service_name or price is None:
            return Response(
                {'error': 'Service name and price are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # For now, let's create a dummy appointment to satisfy the foreign key
        # This is a template service, not a real treatment
        try:
            # Try to find an existing appointment to use as template
            template_appointment = Appointment.objects.first()
            
            if not template_appointment:
                return Response(
                    {'error': 'No appointments found. Cannot create service template.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create a new treatment record to represent this service
            new_treatment = Treatment(
                appointment_id=template_appointment.appointment_id,  # Use appointment_id field
                description=service_name,          # service name goes in description
                cost=float(price),                # price goes in cost
                treatment_code=f"SRV-{timezone.now().strftime('%Y%m%d%H%M%S')}", # Generate code
                created_at=timezone.now()
            )
            new_treatment.save()
            
            # Return the created service data
            service_data = {
                'id': str(new_treatment.treatment_id),
                'service_name': new_treatment.description,
                'price': float(new_treatment.cost),
                'patient_name': f"{template_appointment.patient.first_name} {template_appointment.patient.last_name}" if template_appointment.patient else 'Template',
                'staff_name': f"Dr. {template_appointment.staff.first_name} {template_appointment.staff.last_name}" if template_appointment.staff else 'Admin',
                'date': new_treatment.created_at.strftime('%Y-%m-%d'),
                'status': 'Active'
            }
            
            return Response(service_data, status=status.HTTP_201_CREATED)
            
        except Exception as db_error:
            return Response(
                {'error': f'Database error: {str(db_error)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
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
                'status': 'active',  # Default status, can be enhanced later
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
    API endpoint for admin user approvals - from staff table
    Gets all staff (verified and unverified) for approval management
    """
    try:
        # Get all staff with related user data (both verified and unverified)
        staff_members = Staff.objects.select_related('user').order_by('-created_at')
        
        approvals_data = []
        for staff in staff_members:
            if staff.user:  # Make sure user exists
                approval_item = {
                    'id': str(staff.staff_id),
                    'user_id': str(staff.user.user_id),
                    'full_name': f"{staff.first_name or ''} {staff.last_name or ''}".strip() or staff.user.username,
                    'first_name': staff.first_name or '',
                    'last_name': staff.last_name or '',
                    'email': staff.user.email,
                    'role': staff.role_title or 'Staff',
                    'specialization': staff.specialization or 'General',
                    'license_number': staff.license_number or 'N/A',
                    'phone': staff.phone or 'N/A',
                    'is_verified': staff.user.is_verified,
                    'created_at': staff.created_at.strftime('%Y-%m-%d') if staff.created_at else 'Unknown'
                }
                approvals_data.append(approval_item)
        
        # Get some summary stats
        total_requests = len(approvals_data)
        pending_requests = len([s for s in approvals_data if not s['is_verified']])
        approved_requests = total_requests - pending_requests
        
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
    API endpoint to approve a user by setting is_verified=True
    """
    try:
        # Import User model
        from accounts.models import User
        
        user = User.objects.get(user_id=user_id)
        user.is_verified = True
        user.save()
        
        return Response({
            'message': f'User {user.username} has been approved successfully',
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
    API endpoint for admin invoices - invoices pending approval (is_approved IS NULL)
    """
    try:
        # Get invoices pending approval with related data
        invoices = Invoice.objects.filter(is_approved__isnull=True).select_related('patient', 'appointment', 'appointment__staff').order_by('-created_at')
        
        invoices_data = []
        for invoice in invoices:
            # Get services from appointment or default
            services = []
            if invoice.appointment:
                appointment_treatments = Treatment.objects.filter(appointment=invoice.appointment)
                if appointment_treatments.exists():
                    services = [
                        {
                            'name': t.description or 'General Treatment',
                            'price': float(t.cost or 0)
                        }
                        for t in appointment_treatments
                    ]
                else:
                    services = [{
                        'name': 'General Consultation',
                        'price': float(invoice.total_amount or 0)
                    }]
            else:
                services = [{
                    'name': 'General Service',
                    'price': float(invoice.total_amount or 0)
                }]
            
            # Determine approval status
            approval_status = 'pending'
            if invoice.is_approved is True:
                approval_status = 'approved'
            elif invoice.is_approved is False:
                approval_status = 'rejected'
            
            appointment_status = invoice.appointment.status if invoice.appointment else 'N/A'
            invoice_data = {
                'id': str(invoice.invoice_id),
                'patient': invoice.patient.full_name,
                'doctor': f"Dr. {invoice.appointment.staff.first_name} {invoice.appointment.staff.last_name}" if invoice.appointment and invoice.appointment.staff else 'N/A',
                'date': invoice.issued_date.strftime('%Y-%m-%d'),
                'total': float(invoice.total_amount),
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
        # Get approved invoices with related data
        invoices = Invoice.objects.filter(is_approved=True).select_related('patient', 'appointment', 'appointment__staff').order_by('-created_at')
        
        invoices_data = []
        for invoice in invoices:
            # Get services from appointment or default
            services = []
            if invoice.appointment:
                appointment_treatments = Treatment.objects.filter(appointment=invoice.appointment)
                if appointment_treatments.exists():
                    services = [
                        {
                            'name': t.description or 'General Treatment',
                            'price': float(t.cost or 0)
                        }
                        for t in appointment_treatments
                    ]
                else:
                    services = [{
                        'name': 'General Consultation',
                        'price': float(invoice.total_amount or 0)
                    }]
            else:
                services = [{
                    'name': 'General Service',
                    'price': float(invoice.total_amount or 0)
                }]
            
            invoice_data = {
                'id': str(invoice.invoice_id),
                'patient': invoice.patient.full_name,
                'doctor': f"Dr. {invoice.appointment.staff.first_name} {invoice.appointment.staff.last_name}" if invoice.appointment and invoice.appointment.staff else 'N/A',
                'date': invoice.issued_date.strftime('%Y-%m-%d'),
                'total': float(invoice.total_amount),
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