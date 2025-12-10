import requests

def test_patient_profile():
    """Test the patient profile API endpoint"""
    
    token = '6b54ec395f3d3080077472a8b592491715a7019b'
    base_url = 'http://127.0.0.1:8000/api/patients'
    
    headers = {'Authorization': f'Token {token}'}
    
    print("🔍 Testing patient profile API...")
    
    # Test GET profile
    profile_url = f'{base_url}/profile/'
    try:
        response = requests.get(profile_url, headers=headers)
        print(f"GET Profile - Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Profile data retrieved successfully!")
            print("📋 Profile data:")
            for key, value in data.items():
                print(f"  {key}: {value}")
            
            # Test PUT profile update
            print("\n🔄 Testing profile update...")
            update_data = {
                'phone': '+123-456-7890',
                'gender': 'Male',
                'address': 'Updated address for testing'
            }
            
            update_response = requests.put(profile_url, json=update_data, headers=headers)
            print(f"PUT Profile - Status: {update_response.status_code}")
            
            if update_response.status_code == 200:
                updated_data = update_response.json()
                print("✅ Profile updated successfully!")
                print("📋 Updated data:")
                for key, value in updated_data.items():
                    print(f"  {key}: {value}")
            else:
                print(f"❌ Update failed: {update_response.text}")
                
        else:
            print(f"❌ Failed to get profile: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection error: Django server might not be running")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_patient_profile()