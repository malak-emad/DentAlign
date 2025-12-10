import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from staff.models import Patient, Staff, Appointment
from accounts.models import User
from datetime import datetime, time
from django.utils import timezone
import uuid

# Get some existing patients and staff
patients = list(Patient.objects.all()[:2])
print(f'Found {len(patients)} patients:')
for p in patients:
    print(f'  - {p.full_name}')

# Get staff members
staff_users = User.objects.filter(role__name='Doctor')[:2]
staff_members = []
for user in staff_users:
    staff, created = Staff.objects.get_or_create(user=user, defaults={'specialization': 'General Dentistry'})
    staff_members.append(staff)

print(f'Found/created {len(staff_members)} staff members:')
for s in staff_members:
    print(f'  - {s}')

if patients and staff_members:
    # Create some appointments for today (December 10, 2025)
    today = datetime(2025, 12, 10)
    
    appointments_to_create = [
        {
            'patient': patients[0],
            'staff': staff_members[0], 
            'start_time': timezone.make_aware(datetime.combine(today.date(), time(9, 0))),
            'end_time': timezone.make_aware(datetime.combine(today.date(), time(9, 30))),
            'status': 'completed',
            'fee': 150.00,
            'reason': 'Routine checkup'
        },
        {
            'patient': patients[1] if len(patients) > 1 else patients[0],
            'staff': staff_members[0],
            'start_time': timezone.make_aware(datetime.combine(today.date(), time(14, 0))),
            'end_time': timezone.make_aware(datetime.combine(today.date(), time(15, 0))),
            'status': 'scheduled',
            'fee': 200.00,
            'reason': 'Dental cleaning'
        },
        {
            'patient': patients[0],
            'staff': staff_members[0],
            'start_time': timezone.make_aware(datetime.combine(today.date(), time(16, 0))),
            'end_time': timezone.make_aware(datetime.combine(today.date(), time(17, 0))),
            'status': 'scheduled',
            'fee': 300.00,
            'reason': 'Root canal consultation'
        }
    ]
    
    created_count = 0
    for apt_data in appointments_to_create:
        appointment = Appointment.objects.create(**apt_data)
        created_count += 1
        print(f'Created appointment: {appointment}')
    
    print(f'\n✅ Successfully created {created_count} appointments for today!')
    
    # Show current appointment counts
    print(f'\nCurrent appointment stats:')
    print(f'Total appointments: {Appointment.objects.count()}')
    print(f'Today\'s appointments: {Appointment.objects.filter(start_time__date=today.date()).count()}')
    print(f'Scheduled appointments: {Appointment.objects.filter(status="scheduled").count()}')
    
else:
    print('❌ Not enough patients or staff to create appointments')