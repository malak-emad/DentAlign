import requests
import json

# Test the login endpoint directly
url = 'http://127.0.0.1:8000/api/auth/login/'
data = {
    'email': 'drverified@mail.com',
    'password': 'drverified123'  # Use the correct password
}

try:
    print('🔍 Testing login endpoint...')
    print(f'URL: {url}')
    print(f'Data: {data}')
    
    response = requests.post(url, json=data)
    
    print(f'Status Code: {response.status_code}')
    print(f'Headers: {dict(response.headers)}')
    print(f'Response Text: {response.text[:500]}')  # First 500 chars
    
    if response.status_code == 200:
        response_data = response.json()
        print('✅ Login successful!')
        print(f'Response Data: {json.dumps(response_data, indent=2)}')
    else:
        print('❌ Login failed!')
        
except Exception as e:
    print(f'🔥 Error: {e}')