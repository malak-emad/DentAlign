import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from staff.views import dashboard_stats
from django.test import RequestFactory
from accounts.authentication import CustomTokenAuthentication
from accounts.models import User

try:
    # Create a test request
    factory = RequestFactory()
    request = factory.get('/api/staff/dashboard/stats/')
    request.META['HTTP_AUTHORIZATION'] = 'Token 6b54ec395f3d3080077472a8b592491715a7019b'
    
    # Authenticate the request
    auth = CustomTokenAuthentication()
    result = auth.authenticate(request)
    if result:
        user, token = result
        request.user = user
        print(f"✅ User authenticated: {user}")
        
        # Test the dashboard view
        response = dashboard_stats(request)
        print(f"✅ Dashboard response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.data
            print("✅ Dashboard data retrieved successfully!")
            print("📊 Dashboard Stats:")
            print(f"  Patients Total: {data['patients']['total']}")
            print(f"  Patients New This Month: {data['patients']['new_this_month']}")
            print(f"  Appointments Today: {data['appointments']['today']}")
            print(f"  Appointments This Week: {data['appointments']['this_week']}")
            print(f"  Appointments Pending: {data['appointments']['pending']}")
        else:
            print(f"❌ Error response: {response.data}")
    else:
        print("❌ Authentication failed")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()