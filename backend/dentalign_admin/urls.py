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
]