from django.urls import path
from . import views

app_name = 'staff'

urlpatterns = [
    # Dashboard and stats
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
    
    # Staff profile
    path('profile/', views.staff_profile, name='staff_profile'),
    
    # Patient endpoints
    path('patients/', views.PatientListView.as_view(), name='patient_list'),
    path('patients/<uuid:patient_id>/', views.PatientDetailView.as_view(), name='patient_detail'),
    path('patients/search/', views.patient_search, name='patient_search'),
    
    # Nurses
    path('nurses/', views.NursesListView.as_view(), name='nurses_list'),
    
    # Appointment endpoints
    path('appointments/', views.AppointmentListView.as_view(), name='appointment_list'),
    path('appointments/<uuid:appointment_id>/', views.AppointmentDetailView.as_view(), name='appointment_detail'),
    
    # Treatment endpoints
    path('treatments/', views.TreatmentListView.as_view(), name='treatment_list'),
    
    # Medical record endpoints
    path('medical-records/', views.MedicalRecordListView.as_view(), name='medical_record_list'),
    
    # Diagnosis endpoints
    path('diagnoses/', views.DiagnosisListView.as_view(), name='diagnosis_list'),
    
    # Medical record endpoints
    path('medical-records/', views.MedicalRecordListView.as_view(), name='medical_record_list'),
    
    # Diagnosis endpoints
    path('diagnoses/', views.DiagnosisListView.as_view(), name='diagnosis_list'),
    
    # Medical record endpoints
    path('medical-records/', views.MedicalRecordListView.as_view(), name='medical_record_list'),
    
    # Diagnosis endpoints
    path('diagnoses/', views.DiagnosisListView.as_view(), name='diagnosis_list'),
    
    # Invoice endpoints
    path('invoices/', views.InvoiceListView.as_view(), name='invoice_list'),
    
    # Payment endpoints
    path('payments/', views.PaymentListView.as_view(), name='payment_list'),
    
    # Service endpoints
    path('services/', views.ServiceListView.as_view(), name='service_list'),
]