from django.db import models
from django.utils import timezone
from accounts.models import User
import uuid

def default_record_date():
    return timezone.now().date()

# Staff models for the dental practice management system
# These models map to existing tables in the Neon database

class Patient(models.Model):
    """Model mapping to existing patients table"""
    patient_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name='patient_profile', db_column='user_id')
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50) 
    email = models.EmailField(max_length=255, unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    dob = models.DateField(blank=True, null=True)  # date of birth
    gender = models.CharField(max_length=10, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    medical_history = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'patients'

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property 
    def date_of_birth(self):
        """Alias for backwards compatibility"""
        return self.dob


class Staff(models.Model):
    """Model mapping to existing staff table"""
    staff_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    first_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50, blank=True, null=True) 
    role_title = models.CharField(max_length=100, blank=True, null=True)
    license_number = models.CharField(max_length=50, blank=True, null=True)
    specialization = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'staff'

    def __str__(self):
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name} - {self.role_title or 'Staff'}"
        return f"{self.user.full_name} - {self.role_title or 'Staff'}"


class MedicalRecord(models.Model):
    """Model mapping to existing medical_records table"""
    record_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medical_records')
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='medical_records', db_column='staff')
    appointment = models.ForeignKey('Appointment', on_delete=models.CASCADE, blank=True, null=True)
    record_date = models.DateField(default=default_record_date)
    chief_complaint = models.TextField(blank=True, null=True, db_column='chief_complaint')
    examination_notes = models.TextField(blank=True, null=True)
    diagnosis_notes = models.TextField(blank=True, null=True)
    treatment_plan = models.TextField(blank=True, null=True)
    medications = models.TextField(blank=True, null=True)
    follow_up_instructions = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    # Additional fields for enhanced functionality
    radiology_needed = models.BooleanField(default=False)
    outcome = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='created_records', db_column='created_by', blank=True, null=True)

    class Meta:
        db_table = 'medical_records'

    def __str__(self):
        return f"Record for {self.patient.full_name} - {self.record_date}"

    @property
    def notes(self):
        """Alias for chief_complaint for backwards compatibility"""
        return self.chief_complaint

    @property
    def patient_name(self):
        return self.patient.full_name


class Appointment(models.Model):
    """Model mapping to existing appointments table"""
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]

    appointment_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='appointments', db_column='staff_id')
    start_time = models.DateTimeField(default=timezone.now)
    end_time = models.DateTimeField(default=timezone.now()+timezone.timedelta(hours=1))
    appointment_date = models.DateTimeField(blank=True, null=True, help_text="Actual date/time of appointment session, can differ from scheduled start_time.")
    nurse = models.ForeignKey('Staff', on_delete=models.SET_NULL, related_name='nurse_appointments', blank=True, null=True, help_text="Nurse assisting in the appointment.", db_column='nurse_id')
    medical_record = models.OneToOneField('MedicalRecord', on_delete=models.SET_NULL, blank=True, null=True, related_name='appointment_record', help_text="Medical record for this appointment.")
    fee = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'appointments'

    def __str__(self):
        return f"{self.patient.full_name} - {self.start_time}"
    

    
    @property
    def appointment_time(self):
        """Return the time part of start_time for backwards compatibility"""
        return self.start_time.time()


class Treatment(models.Model):
    """
    Model for actual treatments performed during appointments
    References Service from services_available table for service details
    """
    treatment_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='treatments')
    service = models.ForeignKey('Service', on_delete=models.PROTECT, related_name='treatments', db_column='treatment_code', blank=True, null=True)
    # Optional: actual cost charged (may differ from service price)
    actual_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'treatments'

    def __str__(self):
        return f"{self.service.name if self.service else 'Unknown'} - {self.appointment.patient.full_name if self.appointment else 'No Appointment'}"

    @property
    def patient(self):
        return self.appointment.patient

    @property
    def staff(self):
        return self.appointment.staff
    
    @property
    def description(self):
        """Get service description from related Service"""
        return self.service.description if self.service else ''
    
    @property
    def cost(self):
        """Get cost - use actual_cost if set, otherwise use service price"""
        if self.actual_cost is not None:
            return self.actual_cost
        return self.service.price if self.service else 0


class Diagnosis(models.Model):
    """Model mapping to existing diagnoses table"""
    diagnosis_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    record = models.ForeignKey('MedicalRecord', on_delete=models.CASCADE, related_name='diagnoses')
    icd10_code = models.CharField(max_length=20, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    diagnosed_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'diagnoses'

    def __str__(self):
        return f"{self.icd10_code} - {self.record.patient.full_name}"

    @property
    def patient(self):
        return self.record.patient


class Invoice(models.Model):
    """Model mapping to existing invoices table"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('cancelled', 'Cancelled'),
        ('partially_paid', 'Partially Paid'),
    ]

    invoice_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='invoices')
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='invoices', blank=True, null=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    issued_date = models.DateField(default=timezone.now)
    due_date = models.DateField()
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_approved = models.BooleanField(null=True, blank=True, default=None)

    class Meta:
        db_table = 'invoices'

    def __str__(self):
        return f"Invoice #{self.invoice_id} - {self.patient.full_name} - ${self.total_amount}"

    @property
    def balance_due(self):
        return self.total_amount - self.paid_amount

    @property
    def is_fully_paid(self):
        return self.paid_amount >= self.total_amount

    @property
    def is_overdue(self):
        from django.utils import timezone
        return timezone.now().date() > self.due_date and not self.is_fully_paid


class Payment(models.Model):
    """Model mapping to existing payments table"""
    PAYMENT_METHODS = [
        ('cash', 'Cash'),
        ('credit_card', 'Credit Card'),
        ('debit_card', 'Debit Card'),
        ('check', 'Check'),
        ('bank_transfer', 'Bank Transfer'),
        ('insurance', 'Insurance'),
        ('other', 'Other'),
    ]

    payment_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    paid_at = models.DateTimeField(default=timezone.now)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'payments'

    def __str__(self):
        return f"Payment ${self.amount} - {self.invoice.patient.full_name} - {self.method}"

    @property
    def patient(self):
        return self.invoice.patient


class Service(models.Model):
    """
    Model for available services catalog - services that the clinic offers
    This is separate from Treatment which represents actual treatments performed
    """
    service_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, unique=True)  # Service name (e.g., "Consultation", "Dental Cleaning")
    description = models.TextField(blank=True, null=True)  # Optional description
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Standard price
    is_active = models.BooleanField(default=True)  # Whether service is currently offered
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'services_available'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} - ${self.price}"