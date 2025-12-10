import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from staff.models import Patient

def main():
    print("🔍 Checking users and creating patient profiles...\n")
    
    users = User.objects.all()
    for user in users:
        print(f"User: {user.username}")
        print(f"  Email: {user.email}")
        print(f"  Name: {user.first_name} {user.last_name}")
        
        # Check/create patient profile
        try:
            patient = Patient.objects.get(user=user)
            print(f"  ✅ Patient profile exists: {patient.first_name} {patient.last_name}")
        except Patient.DoesNotExist:
            print("  ❌ No patient profile found. Creating...")
            try:
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
            except Exception as e:
                print(f"  ❌ Error creating patient: {e}")
        
        # Check/create token
        try:
            token = Token.objects.get(user=user)
            print(f"  🔑 Token: {token.key}")
        except Token.DoesNotExist:
            token = Token.objects.create(user=user)
            print(f"  🔑 Created token: {token.key}")
        
        print()

if __name__ == "__main__":
    main()