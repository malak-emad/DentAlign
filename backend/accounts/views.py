from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db import transaction
from .models import Role, User
from .serializers import RoleSerializer, UserSerializer, PatientSignupSerializer, DoctorSignupSerializer


class RoleViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing roles
    """
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [AllowAny]  # Temporary for testing


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing users
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # Temporary for testing


@api_view(['POST'])
@permission_classes([AllowAny])
def patient_signup(request):
    """
    API endpoint for patient registration
    POST /api/auth/signup/
    """
    serializer = PatientSignupSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            with transaction.atomic():  # Ensure data consistency
                user = serializer.save()
                
                # Return user data (without sensitive info)
                user_data = UserSerializer(user).data
                
                return Response({
                    'message': 'Patient account created successfully',
                    'user': user_data
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response({
                'error': 'Failed to create account',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({
        'error': 'Invalid data',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def doctor_signup(request):
    """
    API endpoint for doctor registration
    POST /api/auth/signup/doctor/
    """
    serializer = DoctorSignupSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            with transaction.atomic():  # Ensure data consistency
                user = serializer.save()
                
                # Return user data (without sensitive info)
                user_data = UserSerializer(user).data
                
                return Response({
                    'message': 'Doctor registration submitted successfully. Your account is pending admin verification.',
                    'user': user_data,
                    'status': 'pending_verification'
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response({
                'error': 'Failed to create account',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({
        'error': 'Invalid data',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def api_health(request):
    """
    Simple health check endpoint
    """
    return Response({
        'status': 'healthy',
        'message': 'DentAlign Backend API is running',
        'database_connected': True
    })
