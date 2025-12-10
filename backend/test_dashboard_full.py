import requests
import json

url = 'http://127.0.0.1:8000/api/staff/dashboard/stats/'
headers = {'Authorization': 'Token 6b54ec395f3d3080077472a8b592491715a7019b'}

try:
    print('🔍 Testing dashboard API with full data output...')
    response = requests.get(url, headers=headers)
    print(f'Status: {response.status_code}')
    if response.status_code == 200:
        data = response.json()
        print('✅ Dashboard data retrieved successfully!')
        print('📊 Complete Dashboard Data:')
        print(json.dumps(data, indent=2))
    else:
        print(f'❌ Error: {response.text[:200]}')
except Exception as e:
    print(f'❌ Error: {e}')