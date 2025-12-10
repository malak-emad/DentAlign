import requests

def test_current_token():
    """Test with the token that's shown in browser console"""
    # From the browser console, I can see it's checking for token and finding one
    # Let's test with the token that was shown in staff login
    
    tokens_to_test = [
        '6b54ec395f3d3080077472a8b592491715a7019b',  # Original token from browser
        '9f5d909621abc2db67301099e1dc72ef404e1ddb',  # New token we created
    ]
    
    for token in tokens_to_test:
        print(f"\n🔍 Testing token: {token[:10]}...")
        
        # Test auth endpoint first
        auth_url = 'http://127.0.0.1:8000/api/auth/user/'
        headers = {'Authorization': f'Token {token}'}
        
        try:
            response = requests.get(auth_url, headers=headers)
            print(f"  Auth endpoint status: {response.status_code}")
            if response.status_code == 200:
                user_data = response.json()
                print(f"  ✅ User: {user_data.get('username')} - {user_data.get('email')}")
                
                # Now test patient endpoint
                patient_url = 'http://127.0.0.1:8000/api/patients/dashboard/stats/'
                patient_response = requests.get(patient_url, headers=headers)
                print(f"  Patient endpoint status: {patient_response.status_code}")
                
                if patient_response.status_code == 200:
                    print("  ✅ Patient dashboard works!")
                    print("  Data:", patient_response.json())
                else:
                    print(f"  ❌ Patient error: {patient_response.text}")
            else:
                print(f"  ❌ Auth failed: {response.text}")
                
        except Exception as e:
            print(f"  ❌ Error: {e}")

if __name__ == "__main__":
    test_current_token()