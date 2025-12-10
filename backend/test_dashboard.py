import requests
import json

url = 'http://127.0.0.1:8000/api/staff/dashboard/stats/'
headers = {'Authorization': 'Token 6b54ec395f3d3080077472a8b592491715a7019b'}

try:
    print('🔍 Testing dashboard API with real data...')
    response = requests.get(url, headers=headers)
    print(f'Status: {response.status_code}')
    if response.status_code == 200:
        data = response.json()
        print('✅ Dashboard data retrieved successfully!')
        print('📊 Dashboard Stats:')
        print(f"  Patients Total: {data['patients']['total']}")
        print(f"  Patients New This Month: {data['patients']['new_this_month']}")
        print(f"  Appointments Today: {data['appointments']['today']}")
        print(f"  Appointments This Week: {data['appointments']['this_week']}")
        print(f"  Appointments Pending: {data['appointments']['pending']}")
        print(f"  Treatments This Month: {data['treatments']['this_month']}")
        print(f"  Treatment Revenue: ${data['treatments']['total_revenue']}")
        print(f"  Invoices Pending: {data['invoices']['pending']}")
        print(f"  Invoices Overdue: {data['invoices']['overdue']}")
        print(f"  Total Outstanding: ${data['invoices']['total_outstanding']}")
    else:
        print(f'❌ Error: {response.text[:200]}')
except Exception as e:
    print(f'❌ Error: {e}')