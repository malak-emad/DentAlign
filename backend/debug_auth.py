import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import User, AuthToken
from accounts.authentication import CustomTokenAuthentication
from django.http import HttpRequest

# Test the authentication system
auth = CustomTokenAuthentication()
request = HttpRequest()
request.META['HTTP_AUTHORIZATION'] = 'Token 6b54ec395f3d3080077472a8b592491715a7019b'

try:
    result = auth.authenticate(request)
    if result:
        user, token = result
        print('✅ Authentication successful!')
        print(f'User: {user}')
        print(f'User type: {type(user)}')
        print(f'User authenticated: {user.is_authenticated}')
        print(f'User has role: {hasattr(user, "role")}')
        if hasattr(user, 'role'):
            print(f'User role: {user.role}')
    else:
        print('❌ Authentication failed - no result')
except Exception as e:
    print(f'❌ Authentication error: {e}')
    import traceback
    traceback.print_exc()

# Also test the dashboard view directly
print("\n" + "="*50)
print("Testing dashboard view...")

try:
    from staff.views import dashboard_stats
    from django.test import RequestFactory
    
    factory = RequestFactory()
    request = factory.get('/api/staff/dashboard/stats/')
    request.META['HTTP_AUTHORIZATION'] = 'Token 6b54ec395f3d3080077472a8b592491715a7019b'
    
    # Manually authenticate
    result = auth.authenticate(request)
    if result:
        user, token = result
        request.user = user
        print(f'✅ Request user set: {request.user}')
        
        # Now try the dashboard view
        response = dashboard_stats(request)
        print(f'✅ Dashboard response status: {response.status_code}')
        if response.status_code == 200:
            print('✅ Dashboard data retrieved successfully!')
        else:
            print(f'❌ Dashboard error: {response.data}')
    else:
        print('❌ Could not authenticate request')
        
except Exception as e:
    print(f'❌ Dashboard test error: {e}')
    import traceback
    traceback.print_exc()