from django.urls import path
from . import views

app_name = 'dentalign_admin'

urlpatterns = [
    # Dashboard stats - following staff pattern
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
    # Services list 
    path('services/', views.services_list, name='services_list'),
    # Add new service
    path('services/add/', views.add_service, name='add_service'),
    # Schedules list
    path('schedules/', views.schedules_list, name='schedules_list'),
    # Staff list
    path('staff/', views.staff_list, name='staff_list'),
    # User approvals list
    path('user-approvals/', views.user_approvals_list, name='user_approvals_list'),
    # Approve user
    path('user-approvals/<str:user_id>/approve/', views.approve_user, name='approve_user'),
    # Reject user
    path('user-approvals/<str:user_id>/reject/', views.reject_user, name='reject_user'),
    # Patients list
    path('patients/', views.patients_list, name='patients_list'),
    # Patient details
    path('patients/<str:patient_id>/', views.patient_details, name='patient_details'),
    
    # Invoice/Billing management
    path('invoices/', views.invoices_list, name='invoices_list'),
    path('billing/', views.billing_list, name='billing_list'),
    path('invoices/<str:invoice_id>/approve/', views.approve_invoice, name='approve_invoice'),
    path('invoices/<str:invoice_id>/reject/', views.reject_invoice, name='reject_invoice'),
    path('invoices/<str:invoice_id>/payment/', views.update_payment_status, name='update_payment_status'),
]