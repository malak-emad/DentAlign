from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db import transaction
from .models import Role, User, AuthToken
from .serializers import RoleSerializer, UserSerializer, PatientSignupSerializer, DoctorSignupSerializer, NurseSignupSerializer, LoginSerializer


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
    # acts as a DTO (Data Transfer Object) to convert and validate incoming data
    serializer = PatientSignupSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            with transaction.atomic():  # Ensure data consistency
                user = serializer.save() # Create patient user
                
                # Auto-create patient profile with "Not specified" values
                from staff.models import Patient
                Patient.objects.create(
                    user=user,
                    first_name=user.full_name.split()[0] if user.full_name else 'Patient',
                    last_name=user.full_name.split()[-1] if user.full_name and len(user.full_name.split()) > 1 else 'User',
                    email=user.email,
                    phone='',  # Empty - to be filled by user
                    dob=None,  # Will need to be set by user
                    gender='',  # Empty - to be filled by user
                    address=''  # Empty - to be filled by user
                )
                
                # Create authentication token for the new user
                token, created = AuthToken.objects.get_or_create(user=user)
                
                # Return user data (without sensitive info)
                user_data = UserSerializer(user).data
                
                return Response({
                    'message': 'Patient account created successfully',
                    'user': user_data,
                    'token': token.key,
                    'success': True
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


@api_view(['POST'])
@permission_classes([AllowAny])
def nurse_signup(request):
    """
    API endpoint for nurse registration
    POST /api/auth/signup/nurse/
    """
    serializer = NurseSignupSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            with transaction.atomic():  # Ensure data consistency
                user = serializer.save()
                
                # Return user data (without sensitive info)
                user_data = UserSerializer(user).data
                
                return Response({
                    'message': 'Nurse registration submitted successfully. Your account is pending admin verification.',
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


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    API endpoint for user login with role-based authentication
    POST /api/auth/login/
    
    Handles different user types:
    - Patient/Admin: Simple success/fail
    - Doctor: Checks verification status
    - Non-existent users: Returns "Account does not exist"
    """
    serializer = LoginSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Get or create auth token for the user
        token, created = AuthToken.objects.get_or_create(user=user)
        
        # Prepare user response data
        user_data = {
            'user_id': str(user.user_id),
            'email': user.email,
            'full_name': user.full_name,
            'role': user.role.name if user.role else None,
            'is_verified': user.is_verified
        }
        
        # Add staff_id if user is staff
        if hasattr(user, 'staff_profile') and user.staff_profile:
            user_data['staff_id'] = str(user.staff_profile.staff_id)
        
        return Response({
            'message': 'Login successful',
            'user': user_data,
            'token': token.key,  # Include the authentication token
            'success': True
        }, status=status.HTTP_200_OK)
    
    # Handle different types of validation errors
    errors = serializer.errors
    
    if 'email' in errors:
        return Response({
            'error': 'Account does not exist',
            'success': False
        }, status=status.HTTP_404_NOT_FOUND)
    
    if 'verification' in errors:
        return Response({
            'error': errors['verification'][0],
            'success': False,
            'verification_required': True
        }, status=status.HTTP_403_FORBIDDEN)
    
    if 'password' in errors:
        return Response({
            'error': 'Invalid password',
            'success': False
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    return Response({
        'error': 'Invalid credentials',
        'success': False
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
