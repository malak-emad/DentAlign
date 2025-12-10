import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.db import connection

def inspect_database():
    """Check the actual database schema"""
    with connection.cursor() as cursor:
        # Check if patients table exists
        cursor.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'patients'
            ORDER BY ordinal_position;
        """)
        
        columns = cursor.fetchall()
        if columns:
            print("📊 Patients table schema:")
            for col in columns:
                print(f"  - {col[0]}: {col[1]} (nullable: {col[2]})")
        else:
            print("❌ Patients table not found!")
        
        # Check users table
        cursor.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'auth_user'
            ORDER BY ordinal_position;
        """)
        
        user_columns = cursor.fetchall()
        print("\n👥 Users table schema:")
        for col in user_columns:
            print(f"  - {col[0]}: {col[1]} (nullable: {col[2]})")

def create_patient_with_correct_types():
    """Create patient record with proper data types"""
    # Get the token user
    try:
        token = Token.objects.get(key='6b54ec395f3d3080077472a8b592491715a7019b')
        user = token.user
        print(f"🔍 Token user: {user.username} (ID: {user.id})")
    except Token.DoesNotExist:
        print("❌ Token not found!")
        return
    
    with connection.cursor() as cursor:
        # Check if patient already exists using correct type cast
        cursor.execute("""
            SELECT patient_id FROM patients WHERE user_id = %s::uuid
        """, [str(user.id)])
        
        existing = cursor.fetchone()
        if existing:
            print(f"✅ Patient already exists with ID: {existing[0]}")
            return existing[0]
        
        print("❌ No patient found. Creating one...")
        
        import uuid
        patient_id = uuid.uuid4()
        
        # Try to insert with UUID cast for user_id
        try:
            cursor.execute("""
                INSERT INTO patients (
                    patient_id, user_id, first_name, last_name, email, 
                    phone, dob, address, created_at, updated_at
                ) VALUES (
                    %s, %s::uuid, %s, %s, %s, %s, %s, %s, NOW(), NOW()
                )
            """, [
                str(patient_id),
                str(user.id),
                user.first_name or 'Sarah',
                user.last_name or 'Mohamed', 
                user.email or f'{user.username}@example.com',
                '123-456-7890',
                '1990-01-01',
                '123 Main St, City, Country'
            ])
            
            print(f"✅ Created patient with ID: {patient_id}")
            return patient_id
            
        except Exception as e:
            print(f"❌ Failed to create patient: {e}")
            
            # Try without UUID cast (if user_id is integer)
            try:
                cursor.execute("""
                    INSERT INTO patients (
                        patient_id, user_id, first_name, last_name, email, 
                        phone, dob, address, created_at, updated_at
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
                    )
                """, [
                    str(patient_id),
                    user.id,  # Use as integer
                    user.first_name or 'Sarah',
                    user.last_name or 'Mohamed',
                    user.email or f'{user.username}@example.com',
                    '123-456-7890',
                    '1990-01-01', 
                    '123 Main St, City, Country'
                ])
                
                print(f"✅ Created patient with ID: {patient_id} (using integer user_id)")
                return patient_id
                
            except Exception as e2:
                print(f"❌ Failed again: {e2}")
                return None

if __name__ == "__main__":
    inspect_database()
    print("\n" + "="*50 + "\n")
    create_patient_with_correct_types()