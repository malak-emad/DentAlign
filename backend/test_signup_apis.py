"""
Test script to verify our signup APIs work correctly
Run this with: python test_signup_apis.py
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_health_check():
    """Test the health check endpoint"""
    print("🏥 Testing Health Check...")
    response = requests.get(f"{BASE_URL}/api/health/")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")

def test_patient_signup():
    """Test patient signup"""
    print("👤 Testing Patient Signup...")
    
    patient_data = {
        "name": "John Patient",
        "email": "john.patient@test.com", 
        "password": "testpass123",
        "confirm_password": "testpass123"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/auth/signup/",
        json=patient_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")

def test_doctor_signup():
    """Test doctor signup"""
    print("👩‍⚕️ Testing Doctor Signup...")
    
    doctor_data = {
        "name": "Dr. Sarah Doctor",
        "email": "sarah.doctor@test.com",
        "password": "testpass123", 
        "confirm_password": "testpass123",
        "medical_license_number": "MD123456789"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/auth/signup/doctor/",
        json=doctor_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")

if __name__ == "__main__":
    print("🧪 Testing DentAlign Signup APIs\n")
    print("Make sure Django server is running at http://127.0.0.1:8000\n")
    
    try:
        test_health_check()
        test_patient_signup() 
        test_doctor_signup()
        print("✅ All tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: Cannot connect to Django server.")
        print("Make sure the server is running: python manage.py runserver")
        
    except Exception as e:
        print(f"❌ Error: {e}")