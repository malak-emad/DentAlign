import requests
import json

# Get the first patient ID and test details API
url = 'http://127.0.0.1:8000/api/staff/patients/'
headers = {'Authorization': 'Token 6b54ec395f3d3080077472a8b592491715a7019b'}

try:
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        if data.get('results') and len(data['results']) > 0:
            patient_id = data['results'][0]['patient_id']
            patient_name = data['results'][0]['full_name']
            print(f'Testing patient details for: {patient_name} ({patient_id})')
            
            # Test patient details API
            detail_url = f'http://127.0.0.1:8000/api/staff/patients/{patient_id}/'
            detail_response = requests.get(detail_url, headers=headers)
            print(f'Status: {detail_response.status_code}')
            
            if detail_response.status_code == 200:
                detail_data = detail_response.json()
                print('✅ Patient details retrieved successfully!')
                print(f"Patient: {detail_data.get('full_name')}")
                print(f"Email: {detail_data.get('email')}")
                print(f"Phone: {detail_data.get('phone')}")
                print(f"Appointments: {len(detail_data.get('appointments', []))}")
                print(f"Medical Records: {len(detail_data.get('medical_records', []))}")
                print(f"Treatments: {len(detail_data.get('treatments', []))}")
                print(f"Invoices: {len(detail_data.get('invoices', []))}")
            else:
                print(f'❌ Error: {detail_response.text[:200]}')
except Exception as e:
    print(f'❌ Error: {e}')