from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
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
            # Revenue from paid_amount in invoices table
            this_month_revenue = Invoice.objects.filter(
                created_at__date__gte=this_month
            ).aggregate(total=Sum('paid_amount'))['total'] or 0
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
            # Get service name from treatments table using treatment_id
            service_name = 'No Service'
            try:
                if appointment.treatment_id:
                    # Use the treatment_id to get treatment details directly
                    treatment = Treatment.objects.get(treatment_id=appointment.treatment_id)
                    service_name = treatment.description or 'Unknown Service'
            except Treatment.DoesNotExist:
                service_name = 'No Service'
            except Exception:
                service_name = 'No Service'
            
            # Get payment status from invoices table using invoice_id
            payment_status = 'Pending'
            try:
                if appointment.invoice_id:
                    # Use the invoice_id to get invoice status directly
                    invoice = Invoice.objects.get(invoice_id=appointment.invoice_id)
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
                    payment_status = status_mapping.get(invoice.status, 'Pending')
                    print(f"Appointment {appointment.appointment_id}: Found invoice {invoice.invoice_id} with status '{invoice.status}' -> mapped to '{payment_status}'")
                elif appointment.status == 'completed':
                    payment_status = 'Paid' 
                elif appointment.status == 'cancelled':
                    payment_status = 'Cancelled'
                else:
                    print(f"Appointment {appointment.appointment_id}: No invoice_id, status is '{appointment.status}' -> defaulting to 'Pending'")
            except Invoice.DoesNotExist:
                print(f"Appointment {appointment.appointment_id}: Invoice {appointment.invoice_id} not found")
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