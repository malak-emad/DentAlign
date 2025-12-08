from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'roles', views.RoleViewSet)
router.register(r'users', views.UserViewSet)

urlpatterns = [
    # API Routes for data
    path('api/', include(router.urls)),
    
    # Authentication endpoints
    path('api/auth/signup/', views.patient_signup, name='patient-signup'),
    path('api/auth/signup/doctor/', views.doctor_signup, name='doctor-signup'),
    
    # Health check
    path('api/health/', views.api_health, name='api-health'),
]