import requests
import json

def test_login_and_patient_endpoint():
    """Test the full login flow and then patient endpoint"""
    
    # First, let's login as the user you're using
    login_url = 'http://127.0.0.1:8000/api/auth/login/'
    login_data = {
        'username': 'patientNari',  # You mentioned your name is patientNari
        'password': 'yourpassword'   # You'll need to tell me the password
    }
    
    print("🔑 Testing login...")
    print("We need to test with your actual credentials.")
    print("But first, let's test patient endpoint directly with a token...")
    
    # Test patient endpoint directly with tokens we know exist
    tokens_to_test = [
        '6b54ec395f3d3080077472a8b592491715a7019b',
        '9f5d909621abc2db67301099e1dc72ef404e1ddb'
    ]
    
    for token in tokens_to_test:
        print(f"\n🔍 Testing patient endpoint with token: {token[:10]}...")
        
        patient_url = 'http://127.0.0.1:8000/api/patients/dashboard/stats/'
        headers = {'Authorization': f'Token {token}'}
        
        try:
            response = requests.get(patient_url, headers=headers)
            print(f"  Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("  ✅ SUCCESS! Patient dashboard works!")
                print("  Data preview:", json.dumps(data, indent=2)[:200] + "...")
                return token  # Return working token
            elif response.status_code == 403:
                print(f"  ❌ Forbidden (403): {response.text}")
            elif response.status_code == 404:
                print(f"  ❌ Not Found (404): {response.text}")
            else:
                print(f"  ❌ Error {response.status_code}: {response.text}")
                
        except Exception as e:
            print(f"  ❌ Exception: {e}")
    
    return None

if __name__ == "__main__":
    test_login_and_patient_endpoint()