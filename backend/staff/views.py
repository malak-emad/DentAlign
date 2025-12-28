from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta

from .permissions import IsDoctorOnly, IsDoctorOrStaff

from .models import Patient, Staff, Appointment, MedicalRecord, Treatment, Diagnosis, Invoice, Payment, Service, ChronicCondition, Allergy, PastSurgery
from .serializers import (
    PatientSerializer, PatientListSerializer,
    StaffSerializer,
    AppointmentSerializer, AppointmentListSerializer,
    MedicalRecordSerializer,
    TreatmentSerializer, TreatmentSummarySerializer,
    DiagnosisSerializer,
    InvoiceSerializer, InvoiceSummarySerializer,
    PaymentSerializer,
    ServiceSerializer,
    ChronicConditionSerializer, AllergySerializer, PastSurgerySerializer
)


class PatientListView(generics.ListAPIView):
    """List all patients for staff dashboard"""
    serializer_class = PatientListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Get the current staff member
        try:
            current_staff = Staff.objects.get(user=self.request.user)
        except Staff.DoesNotExist:
            # If no staff profile, return empty queryset
            return Patient.objects.none()
        
        # Only return patients that have had appointments with this staff member
        queryset = Patient.objects.filter(
            appointments__staff=current_staff
        ).distinct()
        
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search)
            )
        return queryset.order_by('last_name', 'first_name')


class PatientDetailView(generics.RetrieveAPIView):
    """Get patient details with related data"""
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'patient_id'

    def get(self, request, *args, **kwargs):
        patient = self.get_object()
        serializer = self.get_serializer(patient)
        
        # Add related data with error handling
        data = serializer.data
        
        try:
            data['appointments'] = AppointmentListSerializer(
                patient.appointments.order_by('-start_time')[:10], 
                many=True
            ).data
        except Exception:
            data['appointments'] = []
        
        try:
            # Check if medical_records relationship exists
            if hasattr(patient, 'medical_records'):
                data['medical_records'] = MedicalRecordSerializer(
                    patient.medical_records.order_by('-record_date')[:5], 
                    many=True
                ).data
            else:
                data['medical_records'] = []
        except Exception:
            data['medical_records'] = []
            
        try:
            data['treatments'] = TreatmentSummarySerializer(
                Treatment.objects.filter(appointment__patient=patient).order_by('-created_at')[:10],
                many=True
            ).data
        except Exception:
            data['treatments'] = []
        
        try:
            # Check if invoices relationship exists  
            if hasattr(patient, 'invoices'):
                data['invoices'] = InvoiceSummarySerializer(
                    patient.invoices.order_by('-issued_date')[:10],
                    many=True
                ).data
            else:
                data['invoices'] = []
        except Exception:
            data['invoices'] = []
        
        return Response(data)


class NursesListView(generics.ListAPIView):
    """List active nurses for selection"""
    queryset = Staff.objects.filter(role_title='Nurse', is_active=True)
    serializer_class = StaffSerializer
    permission_classes = [IsAuthenticated]


class AppointmentListView(generics.ListAPIView):
    """List appointments for staff"""
    queryset = Appointment.objects.all()
    serializer_class = AppointmentListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        date = self.request.query_params.get('date', None)
        date_gte = self.request.query_params.get('date_gte', None)  # Start date for ranges
        date_lte = self.request.query_params.get('date_lte', None)  # End date for ranges
        start_time_gte = self.request.query_params.get('start_time__gte', None)
        status_filter = self.request.query_params.get('status', None)
        staff_id = self.request.query_params.get('staff', None)

        if date:
            try:
                filter_date = datetime.strptime(date, '%Y-%m-%d').date()
                queryset = queryset.filter(start_time__date=filter_date)
            except ValueError:
                pass

        if date_gte:
            try:
                start_date = datetime.strptime(date_gte, '%Y-%m-%d').date()
                queryset = queryset.filter(start_time__date__gte=start_date)
            except ValueError:
                pass

        if date_lte:
            try:
                end_date = datetime.strptime(date_lte, '%Y-%m-%d').date()
                queryset = queryset.filter(start_time__date__lte=end_date)
            except ValueError:
                pass

        if start_time_gte:
            try:
                start_datetime = datetime.fromisoformat(start_time_gte.replace('Z', '+00:00'))
                queryset = queryset.filter(start_time__gte=start_datetime)
            except ValueError:
                pass

        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Handle staff filter robustly: ignore 'null'/'undefined' strings, support UUID or username/email
        if staff_id and staff_id not in ('null', 'undefined', ''):
            # First try treating it as a UUID (staff.staff_id)
            try:
                import uuid as _uuid
                _uuid.UUID(staff_id)
                queryset = queryset.filter(staff__staff_id=staff_id)
            except Exception:
                # Fall back to username or email on the related user
                queryset = queryset.filter(Q(staff__user__username=staff_id) | Q(staff__user__email=staff_id))

        return queryset.order_by('start_time')


class AppointmentDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve and update appointment details"""
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'appointment_id'


class TreatmentListView(generics.ListCreateAPIView):
    """List and create treatments"""
    queryset = Treatment.objects.all()
    serializer_class = TreatmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        patient_id = self.request.query_params.get('patient_id', None)
        appointment_id = self.request.query_params.get('appointment_id', None)

        if patient_id:
            queryset = queryset.filter(appointment__patient__patient_id=patient_id)
        if appointment_id:
            queryset = queryset.filter(appointment__appointment_id=appointment_id)

        return queryset.order_by('-created_at')


class MedicalRecordListView(generics.ListCreateAPIView):
    """List and create medical records"""
    queryset = MedicalRecord.objects.all()
    serializer_class = MedicalRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        patient_id = self.request.query_params.get('patient_id', None)
        appointment_id = self.request.query_params.get('appointment_id', None)

        if patient_id:
            queryset = queryset.filter(patient__patient_id=patient_id)
        if appointment_id:
            queryset = queryset.filter(appointment__appointment_id=appointment_id)

        return queryset.order_by('-record_date')


class DiagnosisListView(generics.ListCreateAPIView):
    """List and create diagnoses"""
    queryset = Diagnosis.objects.all()
    serializer_class = DiagnosisSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        record_id = self.request.query_params.get('record_id', None)
        patient_id = self.request.query_params.get('patient_id', None)

        if record_id:
            queryset = queryset.filter(record__record_id=record_id)
        if patient_id:
            queryset = queryset.filter(record__patient__patient_id=patient_id)

        return queryset.order_by('-diagnosed_at')


class InvoiceListView(generics.ListCreateAPIView):
    """List and create invoices"""
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status', None)
        patient_id = self.request.query_params.get('patient_id', None)
        appointment_id = self.request.query_params.get('appointment', None)
        overdue = self.request.query_params.get('overdue', None)

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if patient_id:
            queryset = queryset.filter(patient__patient_id=patient_id)
        if appointment_id:
            queryset = queryset.filter(appointment__appointment_id=appointment_id)
        if overdue == 'true':
            queryset = queryset.filter(due_date__lt=timezone.now().date(), status__in=['pending', 'partially_paid'])

        return queryset.order_by('-issued_date')


class InvoiceDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve and update invoice details"""
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'invoice_id'


class PaymentListView(generics.ListCreateAPIView):
    """List and create payments"""
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        invoice_id = self.request.query_params.get('invoice_id', None)
        patient_id = self.request.query_params.get('patient_id', None)

        if invoice_id:
            queryset = queryset.filter(invoice__invoice_id=invoice_id)
        if patient_id:
            queryset = queryset.filter(invoice__patient__patient_id=patient_id)

        return queryset.order_by('-paid_at')


class ServiceListView(generics.ListAPIView):
    """List available services"""
    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]


@api_view(['GET'])
@permission_classes([IsDoctorOnly])
def dashboard_stats(request):
    """Get dashboard statistics for staff - DOCTOR ONLY"""
    # No need to check is_authenticated since IsDoctorOnly already checks it
    today = timezone.now().date()
    this_month = timezone.now().replace(day=1).date()
    
    # Get the current staff member
    try:
        current_staff = Staff.objects.get(user=request.user)
    except Staff.DoesNotExist:
        return Response({'error': 'Staff profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get patients that have had appointments with this staff member
    patients_with_appointments = Patient.objects.filter(
        appointments__staff=current_staff
    ).distinct()
    
    stats = {
        'patients': {
            'total': patients_with_appointments.count(),
            'new_this_month': patients_with_appointments.filter(created_at__date__gte=this_month).count(),
        },
        'appointments': {
            'today': Appointment.objects.filter(staff=current_staff, start_time__date=today).count(),
            'this_week': Appointment.objects.filter(
                staff=current_staff,
                start_time__date__gte=today - timedelta(days=7)
            ).count(),
            'pending': Appointment.objects.filter(staff=current_staff, status='scheduled').count(),
        },
        'treatments': {
            'this_month': Treatment.objects.filter(appointment__staff=current_staff, created_at__date__gte=this_month).count(),
            'total_revenue': Treatment.objects.filter(
                appointment__staff=current_staff,
                created_at__date__gte=this_month
            ).aggregate(total=Sum('actual_cost'))['total'] or 0,
        },
        'invoices': {
            'pending': Invoice.objects.filter(appointment__staff=current_staff, status='pending').count(),
            'overdue': Invoice.objects.filter(
                appointment__staff=current_staff,
                due_date__lt=today, 
                status__in=['pending', 'partially_paid']
            ).count(),
            'total_outstanding': Invoice.objects.filter(
                appointment__staff=current_staff,
                status__in=['pending', 'partially_paid']
            ).aggregate(total=Sum('total_amount'))['total'] or 0,
        },
        'recent_activities': {
            'recent_appointments': AppointmentListSerializer(
                Appointment.objects.filter(staff=current_staff, start_time__date=today).order_by('start_time')[:5],
                many=True
            ).data,
            'recent_treatments': TreatmentSummarySerializer(
                Treatment.objects.filter(appointment__staff=current_staff, created_at__date=today).order_by('-created_at')[:5],
                many=True
            ).data,
            'overdue_invoices': InvoiceSummarySerializer(
                Invoice.objects.filter(
                    appointment__staff=current_staff,
                    due_date__lt=today,
                    status__in=['pending', 'partially_paid']
                ).order_by('due_date')[:5],
                many=True
            ).data,
        }
    }
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([IsDoctorOnly])
def staff_reports(request):
    """Get reports and metrics for the current doctor"""
    try:
        # Get current staff member
        staff = request.user.staff_profile
        
        today = timezone.now().date()
        current_month = today.replace(day=1)
        
        # 1. Total patients - count unique patients from appointments
        total_patients = Appointment.objects.filter(staff=staff).values('patient').distinct().count()
        
        # 2. Appointments this month
        appointments_this_month = Appointment.objects.filter(
            staff=staff,
            start_time__date__gte=current_month,
            start_time__date__lte=today
        ).count()
        
        # 3. Completed appointments
        completed_appointments = Appointment.objects.filter(
            staff=staff,
            status='completed'
        ).count()
        
        # 4. Most common treatment - from treatments table
        most_common_treatment = Treatment.objects.filter(
            appointment__staff=staff
        ).values('service__name').annotate(
            count=Count('service__name')
        ).order_by('-count').first()
        
        most_common_treatment_name = most_common_treatment['service__name'] if most_common_treatment else 'No treatments yet'
        
        # Monthly data for chart (last 6 months)
        monthly_data = []
        for i in range(5, -1, -1):
            month_date = today.replace(day=1) - timedelta(days=i*30)
            month_name = month_date.strftime('%b')
            month_start = month_date.replace(day=1)
            month_end = (month_date.replace(day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            
            appointments_count = Appointment.objects.filter(
                staff=staff,
                start_time__date__gte=month_start,
                start_time__date__lte=month_end
            ).count()
            
            monthly_data.append({
                'month': month_name,
                'appointments': appointments_count
            })
        
        response_data = {
            'stats': [
                {'label': 'Total Patients', 'value': total_patients},
                {'label': 'Appointments This Month', 'value': appointments_this_month},
                {'label': 'Completed Appointments', 'value': completed_appointments},
                {'label': 'Most Common Treatment', 'value': most_common_treatment_name},
            ],
            'monthlyData': monthly_data
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Staff.DoesNotExist:
        return Response(
            {'error': 'Staff profile not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Reports error: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def patient_search(request):
    """Search patients by name, email, or phone"""
    query = request.query_params.get('q', '')
    if len(query) < 2:
        return Response({'results': []})
    
    patients = Patient.objects.filter(
        Q(first_name__icontains=query) |
        Q(last_name__icontains=query) |
        Q(email__icontains=query) |
        Q(phone__icontains=query)
    ).order_by('last_name', 'first_name')[:10]
    
    serializer = PatientListSerializer(patients, many=True)
    return Response({'results': serializer.data})


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def staff_profile(request):
    """Get or update staff profile data"""
    try:
        # Get the current user's staff profile
        staff = Staff.objects.get(user=request.user)
        
        if request.method == 'GET':
            # Get profile data
            profile_data = {
                'staff_id': str(staff.staff_id),
                'first_name': staff.first_name,
                'last_name': staff.last_name,
                'full_name': f"{staff.first_name or ''} {staff.last_name or ''}".strip(),
                'email': staff.user.email,
                'phone': staff.phone,
                'role': staff.role_title or 'Staff Member',
                'department': staff.specialization,
                'hire_date': staff.created_at.strftime('%Y-%m-%d') if staff.created_at else None,
                'experience_years': None,
                'specialty': staff.specialization,
                'license_number': staff.license_number,
                'address': getattr(staff, 'address', None),
                'bio': getattr(staff, 'bio', None),
            }
            
            # Calculate years of experience if created_at exists
            if staff.created_at:
                today = timezone.now().date()
                hire_date = staff.created_at.date()
                years = (today - hire_date).days / 365.25
                profile_data['experience_years'] = f"{int(years)}+ years" if years >= 1 else "Less than 1 year"
            
            return Response(profile_data)
            
        elif request.method == 'PUT':
            # Update profile data
            data = request.data
            
            # Update staff fields
            if 'first_name' in data:
                staff.first_name = data['first_name']
            if 'last_name' in data:
                staff.last_name = data['last_name']
            if 'phone' in data:
                staff.phone = data['phone']
            if 'department' in data:
                staff.specialization = data['department']
            if 'role_title' in data:
                staff.role_title = data['role_title']
            
            staff.save()
            
            return Response({'message': 'Profile updated successfully'})
            
    except Staff.DoesNotExist:
        return Response(
            {'error': 'Staff profile not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def recalculate_invoice_total(request, appointment_id):
    """Recalculate the total amount for an invoice based on actual treatments performed"""
    try:
        # Get the appointment
        appointment = Appointment.objects.get(appointment_id=appointment_id)
        
        # Get the invoice for this appointment
        try:
            invoice = Invoice.objects.get(appointment=appointment)
        except Invoice.DoesNotExist:
            return Response(
                {'error': 'No invoice found for this appointment'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Calculate total from treatments
        treatments = Treatment.objects.filter(appointment=appointment)
        total_amount = sum(treatment.cost for treatment in treatments)
        
        # Update the invoice
        invoice.total_amount = total_amount
        invoice.save()
        
        return Response({
            'message': 'Invoice total updated successfully',
            'total_amount': float(total_amount),
            'treatment_count': treatments.count()
        }, status=status.HTTP_200_OK)
        
    except Appointment.DoesNotExist:
        return Response(
            {'error': 'Appointment not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChronicConditionListView(generics.ListCreateAPIView):
    """List and create chronic conditions for a patient"""
    serializer_class = ChronicConditionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ChronicCondition.objects.all()
        patient_id = self.request.query_params.get('patient_id', None)
        if patient_id:
            queryset = queryset.filter(patient__patient_id=patient_id)
        return queryset.order_by('condition_name')

    def perform_create(self, serializer):
        patient_id = self.request.data.get('patient_id')
        patient = Patient.objects.get(patient_id=patient_id)
        serializer.save(patient=patient)


class ChronicConditionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete chronic condition"""
    queryset = ChronicCondition.objects.all()
    serializer_class = ChronicConditionSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'


class AllergyListView(generics.ListCreateAPIView):
    """List and create allergies for a patient"""
    serializer_class = AllergySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Allergy.objects.all()
        patient_id = self.request.query_params.get('patient_id', None)
        if patient_id:
            queryset = queryset.filter(patient__patient_id=patient_id)
        return queryset.order_by('allergen_name')

    def perform_create(self, serializer):
        patient_id = self.request.data.get('patient_id')
        patient = Patient.objects.get(patient_id=patient_id)
        serializer.save(patient=patient)


class AllergyDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete allergy"""
    queryset = Allergy.objects.all()
    serializer_class = AllergySerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'


class PastSurgeryListView(generics.ListCreateAPIView):
    """List and create past surgeries for a patient"""
    serializer_class = PastSurgerySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = PastSurgery.objects.all()
        patient_id = self.request.query_params.get('patient_id', None)
        if patient_id:
            queryset = queryset.filter(patient__patient_id=patient_id)
        return queryset.order_by('-surgery_date')

    def perform_create(self, serializer):
        patient_id = self.request.data.get('patient_id')
        patient = Patient.objects.get(patient_id=patient_id)
        serializer.save(patient=patient)


class PastSurgeryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete past surgery"""
    queryset = PastSurgery.objects.all()
    serializer_class = PastSurgerySerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
