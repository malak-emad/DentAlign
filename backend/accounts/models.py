from django.db import models
import uuid
from django.utils import timezone


class Role(models.Model):
    """User roles for the dental practice management system"""
    role_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'roles'

    def __str__(self):
        return self.name
    
    @property
    def short_id(self):
        """Return first 8 characters of UUID for display"""
        return str(self.role_id)[:8]


class User(models.Model):
    """Custom user model for the dental practice"""
    user_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=50, unique=True, blank=True, null=True)
    full_name = models.CharField(max_length=100)  # For signup name field
    email = models.EmailField(max_length=255, unique=True)
    password_hash = models.CharField(max_length=255)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, blank=True, null=True)
    
    # Approval status
    is_approved = models.BooleanField(default=False)
    
    # Doctor-specific fields
    medical_license_number = models.CharField(max_length=50, blank=True, null=True)
    is_verified = models.BooleanField(default=False)  # For doctor approval workflow
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.username or self.email or f"User {self.short_id}"
    
    @property
    def short_id(self):
        """Return first 8 characters of UUID for display"""
        return str(self.user_id)[:8]
    
    def check_password(self, raw_password):
        """Check if the provided raw password matches the stored hash"""
        from django.contrib.auth.hashers import check_password
        return check_password(raw_password, self.password_hash)
    
    # Django authentication interface methods
    @property 
    def is_authenticated(self):
        """Always return True for authenticated users"""
        return True
    
    @property
    def is_active(self):
        """Check if user account is active"""
        # For now, all users are active. You could add an active field if needed
        return True
    
    @property
    def is_anonymous(self):
        """Always return False for real users"""
        return False
    
    def get_username(self):
        """Return the email as the username"""
        return self.email


class AuthToken(models.Model):
    """Custom authentication token model for our User model"""
    key = models.CharField(max_length=40, primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='auth_token')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'auth_tokens'

    def save(self, *args, **kwargs):
        if not self.key:
            self.key = self.generate_key()
        return super().save(*args, **kwargs)

    def generate_key(self):
        """Generate a random token key"""
        import binascii
        import os
        return binascii.hexlify(os.urandom(20)).decode()

    def __str__(self):
        return self.key
