import requests

url = 'http://127.0.0.1:8000/api/staff/appointments/'
headers = {'Authorization': 'Token 6b54ec395f3d3080077472a8b592491715a7019b'}

try:
    print('🔍 Testing appointments API...')
    
    # Test without date filter
    print('\n1. All appointments:')
    response = requests.get(url, headers=headers)
    print(f'Status: {response.status_code}')
    if response.status_code == 200:
        data = response.json()
        print(f'Response type: {type(data)}')
        print(f'Response content: {data}')
    
    # Test with date filter for today
    print('\n2. Appointments for today (2025-12-10):')
    params = {'date': '2025-12-10'}
    response = requests.get(url, headers=headers, params=params)
    print(f'Status: {response.status_code}')
    if response.status_code == 200:
        data = response.json()
        print(f'Response type: {type(data)}')
        print(f'Response content: {data}')
    else:
        print(f'Error: {response.text[:200]}')

except Exception as e:
    print(f'❌ Error: {e}')