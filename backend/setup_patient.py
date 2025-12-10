import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from staff.models import Patient

def list_all_tokens_and_users():
    print("🔍 All tokens and users:")
    tokens = Token.objects.all()
    for token in tokens:
        print(f"Token: {token.key[:10]}... | User: {token.user.username} | Email: {token.user.email}")
    
    print("\n👥 All users:")
    users = User.objects.all()
    for user in users:
        print(f"User: {user.username} | Email: {user.email} | First: {user.first_name} | Last: {user.last_name}")
        
        # Check if they have a patient profile
        try:
            patient = Patient.objects.get(user=user)
            print(f"  ✅ Has patient profile: {patient.first_name} {patient.last_name}")
        except Patient.DoesNotExist:
            print("  ❌ No patient profile")
        
        # Check if they have a token
        try:
            token = Token.objects.get(user=user)
            print(f"  🔑 Token: {token.key}")
        except Token.DoesNotExist:
            print("  🔑 No token")
        print()

def create_patient_for_user_with_role():
    # Find a user with patient role or create test data
    users = User.objects.all()
    patient_user = None
    
    for user in users:
        print(f"Checking user: {user.username}")
        # Create patient profile if user doesn't have one
        try:
            patient = Patient.objects.get(user=user)
            print(f"  ✅ Already has patient profile: {patient}")
            patient_user = user
        except Patient.DoesNotExist:
            print(f"  ❌ Creating patient profile for {user.username}")
            patient = Patient.objects.create(
                user=user,
                first_name=user.first_name or 'Sarah',
                last_name=user.last_name or 'Mohamed', 
                email=user.email or f'{user.username}@example.com',
                phone='123-456-7890',
                dob='1990-01-01',
                address='123 Main St, City, Country'
            )
            print(f"  ✅ Created patient: {patient}")
            patient_user = user
        
        # Ensure user has token
        try:
            token = Token.objects.get(user=user)
            print(f"  🔑 Token exists: {token.key}")
        except Token.DoesNotExist:
            token = Token.objects.create(user=user)
            print(f"  🔑 Created token: {token.key}")
        
        break  # Just setup the first user
    
    return patient_user

if __name__ == "__main__":
    print("Setting up patient data...\n")
    list_all_tokens_and_users()
    print("\n" + "="*50 + "\n")
    create_patient_for_user_with_role()
    print("\n" + "="*50 + "\n")
    list_all_tokens_and_users()