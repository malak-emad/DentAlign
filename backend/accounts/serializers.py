from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Role, User


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['role_id', 'name', 'description']


class UserSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['user_id', 'username', 'full_name', 'email', 'role', 'is_verified', 'created_at', 'updated_at']
        # Exclude password_hash from serialization for security


class PatientSignupSerializer(serializers.Serializer):
    """Serializer for patient registration"""
    name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        """Validate password confirmation"""
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return data
    
    def validate_email(self, value):
        """Check if email already exists"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists")
        return value
    
    def create(self, validated_data):
        """Create a new patient user"""
        # Get or create Patient role
        patient_role, created = Role.objects.get_or_create(
            name='Patient',
            defaults={'description': 'Hospital patient with limited access'}
        )
        
        # Create user
        user = User.objects.create(
            full_name=validated_data['name'],
            email=validated_data['email'],
            username=validated_data['email'],  # Use email as username for now
            password_hash=make_password(validated_data['password']),
            role=patient_role,
            is_verified=True  # Patients are auto-verified
        )
        return user


class DoctorSignupSerializer(serializers.Serializer):
    """Serializer for doctor registration"""
    name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    medical_license_number = serializers.CharField(max_length=50)
    
    def validate(self, data):
        """Validate password confirmation"""
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return data
    
    def validate_email(self, value):
        """Check if email already exists"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists")
        return value
    
    def validate_medical_license_number(self, value):
        """Check if license number already exists"""
        if User.objects.filter(medical_license_number=value).exists():
            raise serializers.ValidationError("Doctor with this license number already exists")
        return value
    
    def create(self, validated_data):
        """Create a new doctor user (pending verification)"""
        # Get or create Doctor role
        doctor_role, created = Role.objects.get_or_create(
            name='Doctor',
            defaults={'description': 'Licensed medical practitioner'}
        )
        
        # Create user
        user = User.objects.create(
            full_name=validated_data['name'],
            email=validated_data['email'],
            username=validated_data['email'],  # Use email as username for now
            password_hash=make_password(validated_data['password']),
            medical_license_number=validated_data['medical_license_number'],
            role=doctor_role,
            is_verified=False  # Doctors need admin verification
        )
        return user