import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import User, AuthToken
from staff.models import Staff

# Find user with the specific token
token_key = '6b54ec395f3d3080077472a8b592491715a7019b'

try:
    token = AuthToken.objects.get(key=token_key)
    user = token.user
    print(f"✅ Found user for token: {user.email}")
    
    # Check if user has staff record
    try:
        staff = Staff.objects.get(user=user)
        print(f"✅ User already has staff record: {staff.first_name} {staff.last_name}")
    except Staff.DoesNotExist:
        print(f"❌ Creating staff record for {user.email}")
        staff = Staff.objects.create(
            user=user,
            first_name="Dr",
            last_name="Verified",
            role_title="Doctor",
            specialization="General Practice",
            phone="+20123456789"
        )
        print(f"✨ Created staff record: {staff}")

except AuthToken.DoesNotExist:
    print(f"❌ Token not found: {token_key}")
except Exception as e:
    print(f"💥 Error: {e}")