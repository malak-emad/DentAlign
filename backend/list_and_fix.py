import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.db import connection

def list_tokens_and_fix():
    print("🔍 All existing tokens:")
    tokens = Token.objects.all()
    for token in tokens:
        print(f"Token: {token.key}")
        print(f"  User: {token.user.username} (ID: {token.user.id})")
        print(f"  Email: {token.user.email}")
    
    if not tokens:
        print("❌ No tokens found! Creating one...")
        user = User.objects.first()
        if user:
            token = Token.objects.create(user=user)
            print(f"✅ Created token: {token.key}")
            tokens = [token]
        else:
            print("❌ No users found!")
            return
    
    # Use the first token
    token = tokens[0]
    user = token.user
    
    print(f"\n🎯 Working with token: {token.key}")
    print(f"🎯 User: {user.username} (ID: {user.id})")
    
    # The problem is user_id is UUID but auth_user.id is integer
    # We need to either:
    # 1. Change the model to use integer user_id, OR
    # 2. Create users with UUID primary keys, OR  
    # 3. Use a different approach
    
    # Let's use approach 1: Fix the model
    print("\n🔧 The issue is that patients.user_id is UUID but auth_user.id is integer")
    print("🔧 We need to fix the Patient model to use IntegerField for user_id")
    
    # For now, let's create a patient record with a null user_id and we'll connect it later
    with connection.cursor() as cursor:
        print("\n📝 Creating a patient record for testing...")
        
        import uuid
        patient_id = uuid.uuid4()
        
        cursor.execute("""
            INSERT INTO patients (
                patient_id, user_id, first_name, last_name, email, 
                phone, dob, address, created_at, updated_at
            ) VALUES (
                %s, NULL, %s, %s, %s, %s, %s, %s, NOW(), NOW()
            )
        """, [
            str(patient_id),
            user.first_name or 'Sarah',
            user.last_name or 'Mohamed',
            f'patient_{user.id}@example.com',  # Use unique email
            '123-456-7890',
            '1990-01-01',
            '123 Main St, City, Country'
        ])
        
        print(f"✅ Created patient with ID: {patient_id}")
        print(f"🔑 Use this token in frontend: {token.key}")
        
        return token.key

if __name__ == "__main__":
    list_tokens_and_fix()