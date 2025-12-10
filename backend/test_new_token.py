import requests
import json

def test_with_new_token():
    url = 'http://127.0.0.1:8000/api/patients/dashboard/stats/'
    headers = {'Authorization': 'Token 9f5d909621abc2db67301099e1dc72ef404e1ddb'}

    try:
        print('🔍 Testing patient dashboard API with token...')
        print(f'URL: {url}')
        print(f'Headers: {headers}')
        
        response = requests.get(url, headers=headers)
        print(f'🔥 Status: {response.status_code}')
        
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
    test_with_new_token()