from django.urls import path
from . import views

app_name = 'staff'

urlpatterns = [
    # Dashboard and stats
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
    
    # Patient endpoints
    path('patients/', views.PatientListView.as_view(), name='patient_list'),
    path('patients/<uuid:patient_id>/', views.PatientDetailView.as_view(), name='patient_detail'),
    path('patients/search/', views.patient_search, name='patient_search'),
    
    # Appointment endpoints
    path('appointments/', views.AppointmentListView.as_view(), name='appointment_list'),
    
    # Treatment endpoints
    path('treatments/', views.TreatmentListView.as_view(), name='treatment_list'),
    
    # Invoice endpoints
    path('invoices/', views.InvoiceListView.as_view(), name='invoice_list'),
    
    # Payment endpoints
    path('payments/', views.PaymentListView.as_view(), name='payment_list'),
]