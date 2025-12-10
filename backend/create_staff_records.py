import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import User
from staff.models import Staff
import uuid

print("🔍 Checking staff records...")

# Get all users
users = User.objects.all()
print(f"Total users: {users.count()}")

for user in users[:5]:
    try:
        staff = Staff.objects.get(user=user)
        print(f"✅ User: {user.email} -> Staff: {staff.first_name} {staff.last_name} ({staff.role_title})")
    except Staff.DoesNotExist:
        print(f"❌ User: {user.email} -> No staff record")
        
        # Create a staff record for this user
        staff = Staff.objects.create(
            user=user,
            first_name=user.email.split('@')[0].title(),
            last_name="Doctor",
            role_title="Doctor",
            specialization="General Practice",
            phone="+20123456789"
        )
        print(f"✨ Created staff record for {user.email}")

print("Done!")