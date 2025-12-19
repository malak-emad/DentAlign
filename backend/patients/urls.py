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
    path('test/', views.test_endpoint, name='test_endpoint'),
]