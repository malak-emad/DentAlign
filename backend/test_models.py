import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from staff.models import Patient, Staff, Appointment
from datetime import datetime
from django.utils import timezone

try:
    # Test basic model access
    print("Testing Patient model...")
    patients = Patient.objects.all()
    print(f"Found {patients.count()} patients")
    for p in patients[:3]:
        print(f"  - {p.full_name}")
    
    print("\nTesting Staff model...")
    staff = Staff.objects.all()
    print(f"Found {staff.count()} staff members")
    for s in staff[:3]:
        print(f"  - {s}")
    
    print("\nTesting Appointment model...")
    appointments = Appointment.objects.all()
    print(f"Found {appointments.count()} appointments")
    for a in appointments[:3]:
        print(f"  - {a}")
    
    # Test today's filter
    today = datetime(2025, 12, 10).date()
    today_appointments = Appointment.objects.filter(start_time__date=today)
    print(f"\nToday's appointments: {today_appointments.count()}")
    for a in today_appointments:
        print(f"  - {a.patient.full_name} at {a.start_time}")
    
    print("\n✅ Model access test successful!")
    
except Exception as e:
    print(f"❌ Error in model access: {e}")
    import traceback
    traceback.print_exc()