import os
import sys
import django

# Add the project directory to the Python path
sys.path.append('/d/Documents/GitHub/DentAlign/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from staff.models import Patient

def check_and_create_patient():
    # Get the token user
    token = Token.objects.get(key='6b54ec395f3d3080077472a8b592491715a7019b')
    user = token.user
    
    print(f'🔍 Token user: {user.username} (ID: {user.id})')
    print(f'📧 Email: {user.email}')
    print(f'👤 First name: {user.first_name}, Last name: {user.last_name}')
    
    # Check if patient profile exists
    try:
        patient = Patient.objects.get(user=user)
        print(f'✅ Patient profile already exists: {patient}')
        return patient
    except Patient.DoesNotExist:
        print('❌ No patient profile found. Creating one...')
        
        # Create patient profile
        patient = Patient.objects.create(
            user=user,
            first_name=user.first_name or 'Sarah',
            last_name=user.last_name or 'Mohamed',
            email=user.email or 'sarah.mohamed@email.com',
            phone='123-456-7890',
            date_of_birth='1990-01-01',
            address='123 Main St, City, Country'
        )
        
        print(f'✅ Created new patient profile: {patient}')
        return patient

if __name__ == "__main__":
    check_and_create_patient()