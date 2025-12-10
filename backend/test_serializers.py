import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from staff.models import Appointment, Treatment, Invoice
from staff.serializers import AppointmentListSerializer, TreatmentSummarySerializer, InvoiceSummarySerializer
from datetime import datetime
from django.utils import timezone

try:
    today = datetime(2025, 12, 10).date()
    
    # Test appointment serializer
    print("Testing AppointmentListSerializer...")
    today_appointments = Appointment.objects.filter(start_time__date=today).order_by('start_time')[:5]
    print(f"Found {today_appointments.count()} appointments for today")
    
    for apt in today_appointments:
        print(f"  Appointment: {apt.patient.full_name} with {apt.staff}")
        print(f"    Start time: {apt.start_time}")
        print(f"    Status: {apt.status}")
        print(f"    Reason: {apt.reason}")
    
    # Try serializing
    serializer = AppointmentListSerializer(today_appointments, many=True)
    data = serializer.data
    print("✅ AppointmentListSerializer succeeded!")
    print(f"Serialized {len(data)} appointments")
    
except Exception as e:
    print(f"❌ Error with AppointmentListSerializer: {e}")
    import traceback
    traceback.print_exc()

try:
    # Test treatment serializer
    print("\nTesting TreatmentSummarySerializer...")
    today_treatments = Treatment.objects.filter(created_at__date=today).order_by('-created_at')[:5]
    print(f"Found {today_treatments.count()} treatments for today")
    
    serializer = TreatmentSummarySerializer(today_treatments, many=True)
    data = serializer.data
    print("✅ TreatmentSummarySerializer succeeded!")
    print(f"Serialized {len(data)} treatments")
    
except Exception as e:
    print(f"❌ Error with TreatmentSummarySerializer: {e}")
    import traceback
    traceback.print_exc()

try:
    # Test invoice serializer
    print("\nTesting InvoiceSummarySerializer...")
    overdue_invoices = Invoice.objects.filter(
        due_date__lt=today,
        status__in=['pending', 'partially_paid']
    ).order_by('due_date')[:5]
    print(f"Found {overdue_invoices.count()} overdue invoices")
    
    serializer = InvoiceSummarySerializer(overdue_invoices, many=True)
    data = serializer.data
    print("✅ InvoiceSummarySerializer succeeded!")
    print(f"Serialized {len(data)} invoices")
    
except Exception as e:
    print(f"❌ Error with InvoiceSummarySerializer: {e}")
    import traceback
    traceback.print_exc()