import requests
import json

def test_patient_api():
    url = 'http://127.0.0.1:8000/api/patients/dashboard/stats/'
    headers = {'Authorization': 'Token 6b54ec395f3d3080077472a8b592491715a7019b'}

    try:
        print('🔍 Testing patient dashboard API...')
        print(f'URL: {url}')
        print(f'Headers: {headers}')
        
        response = requests.get(url, headers=headers)
        print(f'🔥 Status: {response.status_code}')
        print(f'🔥 Response Headers: {dict(response.headers)}')
        
        if response.status_code == 200:
            data = response.json()
            print('✅ SUCCESS! Dashboard data found!')
            print('📊 Dashboard data:')
            print(json.dumps(data, indent=2))
        else:
            print('❌ Error response:')
            print(f'Status: {response.status_code}')
            print(f'Text: {response.text}')
            
    except requests.exceptions.ConnectionError:
        print('❌ Connection error: Django server might not be running')
    except Exception as e:
        print(f'❌ Error: {e}')

if __name__ == "__main__":
    test_patient_api()