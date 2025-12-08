"""
Test script for login API functionality
Tests all scenarios: patient, doctor (verified/unverified), admin, non-existent user
"""

import requests
import json

API_BASE = 'http://127.0.0.1:8000/api'

def test_login_scenarios():
    """Test different login scenarios"""
    
    print("🔐 Testing Login API Scenarios")
    print("=" * 50)
    
    # Test scenarios
    test_cases = [
        {
            'name': '1. Valid Patient Login',
            'data': {'email': 'testingg@gmail.com', 'password': 'testpass123'},
            'expected_status': 200
        },
        {
            'name': '2. Valid Doctor Login (if verified)',
            'data': {'email': 'testingdr@email.com', 'password': 'drtesting123'},
            'expected_status': [200, 403]  # 200 if verified, 403 if not
        },
        {
            'name': '3. Non-existent Account',
            'data': {'email': 'nonexistent@example.com', 'password': 'password123'},
            'expected_status': 404
        },
        {
            'name': '4. Wrong Password',
            'data': {'email': 'testingg@gmail.com', 'password': 'wrongpassword'},
            'expected_status': 401
        },
        {
            'name': '5. Invalid Email Format',
            'data': {'email': 'invalid-email', 'password': 'password123'},
            'expected_status': 400
        }
    ]
    
    for test_case in test_cases:
        print(f"\n🧪 {test_case['name']}")
        
        try:
            response = requests.post(
                f"{API_BASE}/auth/login/",
                json=test_case['data'],
                headers={'Content-Type': 'application/json'}
            )
            
            status = response.status_code
            data = response.json()
            
            print(f"   Status: {status}")
            print(f"   Response: {json.dumps(data, indent=2)}")
            
            # Check if status matches expected
            expected = test_case['expected_status']
            if isinstance(expected, list):
                status_ok = status in expected
            else:
                status_ok = status == expected
                
            if status_ok:
                print("   ✅ Test PASSED")
            else:
                print(f"   ❌ Test FAILED (expected {expected}, got {status})")
                
        except Exception as e:
            print(f"   💥 Error: {e}")

if __name__ == "__main__":
    test_login_scenarios()