from rest_framework import serializers
from .models import Patient, Staff, Appointment, MedicalRecord, Treatment, Diagnosis, Invoice, Payment


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'
        

class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = '__all__'


class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    staff_name = serializers.CharField(source='staff.user.full_name', read_only=True)
    
    class Meta:
        model = Appointment
        fields = '__all__'


class MedicalRecordSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    staff_name = serializers.CharField(source='staff.user.full_name', read_only=True)
    
    class Meta:
        model = MedicalRecord
        fields = '__all__'


class TreatmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='appointment.patient.full_name', read_only=True)
    staff_name = serializers.CharField(source='appointment.staff.user.full_name', read_only=True)
    appointment_date = serializers.DateField(source='appointment.appointment_date', read_only=True)
    
    class Meta:
        model = Treatment
        fields = '__all__'


class DiagnosisSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='record.patient.full_name', read_only=True)
    record_date = serializers.DateField(source='record.record_date', read_only=True)
    
    class Meta:
        model = Diagnosis
        fields = '__all__'


class InvoiceSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    balance_due = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_fully_paid = serializers.BooleanField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Invoice
        fields = '__all__'


class PaymentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='invoice.patient.full_name', read_only=True)
    invoice_total = serializers.DecimalField(source='invoice.total_amount', max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Payment
        fields = '__all__'


# List serializers for dashboard views
class PatientListSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()
    last_appointment = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = ['patient_id', 'first_name', 'last_name', 'full_name', 'email', 'phone', 'date_of_birth', 'age', 'last_appointment']
    
    def get_age(self, obj):
        return obj.age
    
    def get_last_appointment(self, obj):
        last_apt = obj.appointments.order_by('-appointment_date').first()
        return last_apt.appointment_date.isoformat() if last_apt else None


class AppointmentListSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    staff_name = serializers.CharField(source='staff.user.full_name', read_only=True)
    
    class Meta:
        model = Appointment
        fields = ['appointment_id', 'patient_name', 'staff_name', 'appointment_date', 'appointment_time', 'status', 'appointment_type']


class TreatmentSummarySerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='appointment.patient.full_name', read_only=True)
    appointment_date = serializers.DateField(source='appointment.appointment_date', read_only=True)
    
    class Meta:
        model = Treatment
        fields = ['treatment_id', 'patient_name', 'treatment_code', 'description', 'cost', 'appointment_date', 'created_at']


class InvoiceSummarySerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    balance_due = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Invoice
        fields = ['invoice_id', 'patient_name', 'total_amount', 'paid_amount', 'balance_due', 'status', 'due_date', 'is_overdue']