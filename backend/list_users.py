
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()
users = User.objects.all()
if not users.exists():
    print("No users found in the database.")
else:
    print(f"Found {users.count()} users:")
    print("-" * 60)
    print(f"{'Email':<30} | {'Role':<15} | {'Active'}")
    print("-" * 60)
    for user in users:
        print(f"{user.email:<30} | {user.role:<15} | {user.is_active}")
    print("-" * 60)
