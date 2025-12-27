from django.contrib import admin
from .models import Patient, Staff, Appointment, MedicalRecord, Treatment, Diagnosis, Invoice, Payment, Service


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'phone', 'date_of_birth', 'created_at')
    list_filter = ('gender', 'created_at')
    search_fields = ('first_name', 'last_name', 'email', 'phone')
    readonly_fields = ('patient_id', 'created_at', 'updated_at')


@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ('user', 'role_title', 'specialization', 'phone')
    list_filter = ('role_title', 'specialization')
    search_fields = ('user__full_name', 'user__email', 'specialization', 'first_name', 'last_name')
    readonly_fields = ('staff_id', 'created_at', 'updated_at')


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('patient', 'staff', 'start_time', 'end_time', 'status', 'fee')
    list_filter = ('status', 'start_time', 'staff')
    search_fields = ('patient__first_name', 'patient__last_name', 'staff__user__full_name')
    readonly_fields = ('appointment_id', 'created_at', 'updated_at')
    date_hierarchy = 'start_time'


@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ('patient', 'created_by', 'created_at', 'notes')
    list_filter = ('created_at', 'created_by')
    search_fields = ('patient__first_name', 'patient__last_name', 'notes')
    readonly_fields = ('record_id', 'created_at')
    date_hierarchy = 'created_at'


@admin.register(Treatment)
class TreatmentAdmin(admin.ModelAdmin):
    list_display = ('treatment_id', 'appointment', 'service', 'actual_cost', 'created_at')
    list_filter = ('created_at', 'service')
    search_fields = ('service__name', 'appointment__patient__first_name', 'appointment__patient__last_name')
    readonly_fields = ('treatment_id',)
    date_hierarchy = 'created_at'


@admin.register(Diagnosis)
class DiagnosisAdmin(admin.ModelAdmin):
    list_display = ('diagnosis_id', 'record', 'icd10_code', 'notes', 'diagnosed_at')
    list_filter = ('diagnosed_at', 'icd10_code')
    search_fields = ('icd10_code', 'record__patient__first_name', 'record__patient__last_name', 'notes')
    readonly_fields = ('diagnosis_id',)
    date_hierarchy = 'diagnosed_at'


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_id', 'patient', 'total_amount', 'paid_amount', 'status', 'due_date')
    list_filter = ('status', 'due_date', 'issued_date')
    search_fields = ('patient__first_name', 'patient__last_name')
    readonly_fields = ('invoice_id', 'balance_due', 'is_fully_paid', 'is_overdue', 'created_at', 'updated_at')
    date_hierarchy = 'due_date'


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('payment_id', 'invoice', 'amount', 'method', 'paid_at')
    list_filter = ('method', 'paid_at')
    search_fields = ('invoice__patient__first_name', 'invoice__patient__last_name')


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('service_id', 'created_at', 'updated_at')
    date_hierarchy = 'created_at'
