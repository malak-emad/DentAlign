from django.urls import path
from . import views

app_name = 'patients'

urlpatterns = [
    # Patient dashboard
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
    # Patient profile
    path('profile/', views.patient_profile, name='patient_profile'),
    # Appointment booking
    path('services/', views.available_services, name='available_services'),
    path('doctors/', views.available_doctors, name='available_doctors'),
    path('slots/', views.available_slots, name='available_slots'),
    path('appointments/', views.patient_appointments, name='patient_appointments'),
    path('appointments/book/', views.book_appointment, name='book_appointment'),
    # Patient bills/invoices
    path('invoices/', views.patient_bills, name='patient_bills'),
    # Patient prescriptions/medical history
    path('prescriptions/', views.patient_prescriptions, name='patient_prescriptions'),
    path('medical-history/', views.patient_medical_history, name='patient_medical_history'),
    # Patient medical history management
    path('chronic-conditions/', views.ChronicConditionListView.as_view(), name='chronic_condition_list'),
    path('chronic-conditions/<uuid:condition_id>/', views.ChronicConditionDetailView.as_view(), name='chronic_condition_detail'),
    path('allergies/', views.AllergyListView.as_view(), name='allergy_list'),
    path('allergies/<uuid:allergy_id>/', views.AllergyDetailView.as_view(), name='allergy_detail'),
    path('past-surgeries/', views.PastSurgeryListView.as_view(), name='past_surgery_list'),
    path('past-surgeries/<uuid:surgery_id>/', views.PastSurgeryDetailView.as_view(), name='past_surgery_detail'),
    path('test/', views.test_endpoint, name='test_endpoint'),
]