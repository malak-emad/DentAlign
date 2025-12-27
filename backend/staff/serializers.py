from rest_framework import serializers
from .models import Patient, Staff, Appointment, MedicalRecord, Treatment, Diagnosis, Invoice, Payment, Service


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
    nurse_name = serializers.CharField(source='nurse.user.full_name', read_only=True, default=None)
    medical_record_id = serializers.UUIDField(source='medical_record.record_id', read_only=True, default=None)
    appointment_date = serializers.DateTimeField()
    start_time = serializers.DateTimeField()

    class Meta:
        model = Appointment
        fields = '__all__'
        # Optionally, you can explicitly list fields for more control
        # fields = ['appointment_id', 'patient', 'patient_name', 'staff', 'staff_name', 'start_time', 'end_time', 'appointment_date', 'nurse', 'nurse_name', 'medical_record', 'medical_record_id', 'fee', 'status', 'reason', 'created_at', 'updated_at']


class MedicalRecordSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    staff_name = serializers.CharField(source='staff.user.full_name', read_only=True)
    
    class Meta:
        model = MedicalRecord
        fields = '__all__'


class TreatmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='appointment.patient.full_name', read_only=True)
    staff_name = serializers.CharField(source='appointment.staff.user.full_name', read_only=True)
    appointment_date = serializers.SerializerMethodField()
    
    class Meta:
        model = Treatment
        fields = '__all__'
    
    def get_appointment_date(self, obj):
        return obj.appointment.start_time.date() if obj.appointment and obj.appointment.start_time else None


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


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'


# List serializers for dashboard views
class PatientListSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()
    last_appointment = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = ['patient_id', 'first_name', 'last_name', 'full_name', 'email', 'phone', 'dob', 'age', 'last_appointment']
    
    def get_age(self, obj):
        if obj.dob:
            from datetime import date
            today = date.today()
            return today.year - obj.dob.year - ((today.month, today.day) < (obj.dob.month, obj.dob.day))
        return None
    
    def get_last_appointment(self, obj):
        last_apt = obj.appointments.order_by('-start_time').first()
        return last_apt.start_time.date().isoformat() if last_apt else None


class AppointmentListSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    staff_name = serializers.CharField(source='staff.user.full_name', read_only=True)
    nurse_name = serializers.CharField(source='nurse.user.full_name', read_only=True, default=None)
    appointment_date = serializers.DateTimeField()
    medical_record_id = serializers.UUIDField(source='medical_record.record_id', read_only=True, default=None)
    start_time = serializers.DateTimeField()

    class Meta:
        model = Appointment
        fields = ['appointment_id', 'patient', 'patient_name', 'staff', 'staff_name', 'nurse_name', 'appointment_date', 'status', 'reason', 'medical_record_id','start_time']

    def get_appointment_date(self, obj):
        # Prefer appointment_date if set, else fallback to start_time
        return obj.appointment_date or obj.start_time


class TreatmentSummarySerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='appointment.patient.full_name', read_only=True)
    appointment_date = serializers.SerializerMethodField()
    treatment_code = serializers.SerializerMethodField()

    class Meta:
        model = Treatment
        fields = ['treatment_id', 'patient_name', 'treatment_code', 'description', 'cost', 'appointment_date', 'created_at']

    def get_appointment_date(self, obj):
        return obj.appointment.start_time.date() if obj.appointment and obj.appointment.start_time else None

    def get_treatment_code(self, obj):
        # Return the service_id (which is the treatment_code column in DB)
        return str(obj.service_id) if obj.service_id else None


class InvoiceSummarySerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    balance_due = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Invoice
        fields = ['invoice_id', 'patient_name', 'total_amount', 'paid_amount', 'balance_due', 'status', 'due_date', 'is_overdue']