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
    
    # Test with start_time__gte and staff filter 'null' (should not 500)
    print('\n4. Appointments with start_time >= now and staff=null (should not 500):')
    from datetime import datetime
    now = datetime.now().isoformat()
    params = {'start_time__gte': now, 'staff': 'null'}
    response = requests.get(url, headers=headers, params=params)
    print(f'Status: {response.status_code}')
    if response.status_code == 200:
        data = response.json()
        print(f'Count: {data.get("count", 0)} (OK)')
    else:
        print(f'Error: {response.text[:200]}')

    # Test with start_time__gte and staff set to the doctor's UUID
    print('\n5. Appointments with start_time >= now and staff=<doctor_uuid>:')
    doctor_uuid = 'eaf0fd37-bfdb-49e1-ae6e-6222a47bfcc4'  # doctor UUID for drverified
    params = {'start_time__gte': now, 'staff': doctor_uuid}
    response = requests.get(url, headers=headers, params=params)
    print(f'Status: {response.status_code}')
    if response.status_code == 200:
        data = response.json()
        print(f'Count: {data.get("count", 0)}')
        for appt in data.get('results', []):
            print(f"  - {appt['patient_name']}: {appt.get('appointment_date')} status: {appt['status']}")
    else:
        print(f'Error: {response.text[:200]}')

except Exception as e:
    print(f'❌ Error: {e}')