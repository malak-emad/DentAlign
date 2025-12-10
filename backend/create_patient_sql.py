import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

def create_patient_directly():
    """Create patient using raw SQL to avoid model issues"""
    from django.db import connection
    
    # First let's see what users exist
    print("🔍 Checking existing users...")
    users = User.objects.all()
    for user in users:
        print(f"User ID: {user.id}, Username: {user.username}, Email: {user.email}")
    
    if not users:
        print("❌ No users found!")
        return
    
    user = users[0]  # Use the first user
    print(f"\n🎯 Using user: {user.username} (ID: {user.id})")
    
    # Check/create token
    token, created = Token.objects.get_or_create(user=user)
    print(f"🔑 Token: {token.key} ({'created' if created else 'existing'})")
    
    # Create patient record using raw SQL to avoid model issues
    with connection.cursor() as cursor:
        # Check if patient already exists
        cursor.execute("""
            SELECT patient_id FROM patients WHERE user_id = %s
        """, [user.id])
        
        existing = cursor.fetchone()
        if existing:
            print(f"✅ Patient already exists with ID: {existing[0]}")
        else:
            print("❌ No patient found. Creating one...")
            
            import uuid
            patient_id = uuid.uuid4()
            
            cursor.execute("""
                INSERT INTO patients (
                    patient_id, user_id, first_name, last_name, email, 
                    phone, dob, address, created_at, updated_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
                )
            """, [
                str(patient_id),
                user.id, 
                user.first_name or 'Sarah',
                user.last_name or 'Mohamed',
                user.email or f'{user.username}@example.com',
                '123-456-7890',
                '1990-01-01',
                '123 Main St, City, Country'
            ])
            
            print(f"✅ Created patient with ID: {patient_id}")
    
    return token.key

if __name__ == "__main__":
    token_key = create_patient_directly()
    print(f"\n🎉 Setup complete! Use this token: {token_key}")