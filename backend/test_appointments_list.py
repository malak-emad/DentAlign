import requests

url = 'http://127.0.0.1:8000/api/staff/appointments/'
headers = {'Authorization': 'Token 6b54ec395f3d3080077472a8b592491715a7019b'}

try:
    print('🔍 Testing appointments API...')
    response = requests.get(url, headers=headers)
    print(f'Status: {response.status_code}')
    if response.status_code == 200:
        import json
        data = response.json()
        print('✅ Appointments data retrieved!')
        print(f'Total appointments: {data.get("count", len(data))}')
        if 'results' in data:
            print('First few appointments:')
            for apt in data['results'][:3]:
                print(f'  - {apt["patient_name"]} at {apt["appointment_time"]} ({apt["status"]})')
        else:
            print('First few appointments:')
            for apt in data[:3]:
                print(f'  - {apt["patient_name"]} at {apt["appointment_time"]} ({apt["status"]})')
    else:
        print(f'❌ Error: {response.text[:300]}')
except Exception as e:
    print(f'❌ Error: {e}')