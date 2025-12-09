from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta

from .models import Patient, Staff, Appointment, MedicalRecord, Treatment, Diagnosis, Invoice, Payment
from .serializers import (
    PatientSerializer, PatientListSerializer,
    StaffSerializer,
    AppointmentSerializer, AppointmentListSerializer,
    MedicalRecordSerializer,
    TreatmentSerializer, TreatmentSummarySerializer,
    DiagnosisSerializer,
    InvoiceSerializer, InvoiceSummarySerializer,
    PaymentSerializer
)


class PatientListView(generics.ListAPIView):
    """List all patients for staff dashboard"""
    queryset = Patient.objects.all()
    serializer_class = PatientListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
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
        
        # Add related data
        data = serializer.data
        data['appointments'] = AppointmentListSerializer(
            patient.appointments.order_by('-appointment_date')[:10], 
            many=True
        ).data
        data['medical_records'] = MedicalRecordSerializer(
            patient.records.order_by('-record_date')[:5], 
            many=True
        ).data
        data['treatments'] = TreatmentSummarySerializer(
            Treatment.objects.filter(appointment__patient=patient).order_by('-created_at')[:10],
            many=True
        ).data
        data['invoices'] = InvoiceSummarySerializer(
            patient.invoices.order_by('-issued_date')[:10],
            many=True
        ).data
        
        return Response(data)


class AppointmentListView(generics.ListAPIView):
    """List appointments for staff"""
    queryset = Appointment.objects.all()
    serializer_class = AppointmentListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        date = self.request.query_params.get('date', None)
        status_filter = self.request.query_params.get('status', None)
        staff_id = self.request.query_params.get('staff_id', None)

        if date:
            try:
                filter_date = datetime.strptime(date, '%Y-%m-%d').date()
                queryset = queryset.filter(appointment_date=filter_date)
            except ValueError:
                pass

        if status_filter:
            queryset = queryset.filter(status=status_filter)

        if staff_id:
            queryset = queryset.filter(staff__staff_id=staff_id)

        return queryset.order_by('appointment_date', 'appointment_time')


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


class InvoiceListView(generics.ListCreateAPIView):
    """List and create invoices"""
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status', None)
        patient_id = self.request.query_params.get('patient_id', None)
        overdue = self.request.query_params.get('overdue', None)

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if patient_id:
            queryset = queryset.filter(patient__patient_id=patient_id)
        if overdue == 'true':
            queryset = queryset.filter(due_date__lt=timezone.now().date(), status__in=['pending', 'partially_paid'])

        return queryset.order_by('-issued_date')


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


@api_view(['GET'])
def dashboard_stats(request):
    """Get dashboard statistics for staff"""
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

    today = timezone.now().date()
    this_month = timezone.now().replace(day=1).date()
    
    stats = {
        'patients': {
            'total': Patient.objects.count(),
            'new_this_month': Patient.objects.filter(created_at__date__gte=this_month).count(),
        },
        'appointments': {
            'today': Appointment.objects.filter(appointment_date=today).count(),
            'this_week': Appointment.objects.filter(
                appointment_date__gte=today - timedelta(days=7)
            ).count(),
            'pending': Appointment.objects.filter(status='scheduled').count(),
        },
        'treatments': {
            'this_month': Treatment.objects.filter(created_at__date__gte=this_month).count(),
            'total_revenue': Treatment.objects.filter(
                created_at__date__gte=this_month
            ).aggregate(total=Sum('cost'))['total'] or 0,
        },
        'invoices': {
            'pending': Invoice.objects.filter(status='pending').count(),
            'overdue': Invoice.objects.filter(
                due_date__lt=today, 
                status__in=['pending', 'partially_paid']
            ).count(),
            'total_outstanding': Invoice.objects.filter(
                status__in=['pending', 'partially_paid']
            ).aggregate(total=Sum('total_amount'))['total'] or 0,
        },
        'recent_activities': {
            'recent_appointments': AppointmentListSerializer(
                Appointment.objects.filter(appointment_date=today).order_by('appointment_time')[:5],
                many=True
            ).data,
            'recent_treatments': TreatmentSummarySerializer(
                Treatment.objects.filter(created_at__date=today).order_by('-created_at')[:5],
                many=True
            ).data,
            'overdue_invoices': InvoiceSummarySerializer(
                Invoice.objects.filter(
                    due_date__lt=today,
                    status__in=['pending', 'partially_paid']
                ).order_by('due_date')[:5],
                many=True
            ).data,
        }
    }
    
    return Response(stats)


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
