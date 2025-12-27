import os
import django
import json

# Set up Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.conf import settings
settings.ALLOWED_HOSTS += ['testserver']

from rest_framework.test import APIClient
from imaging.models import DicomImage

def run_test():
    client = APIClient()
    
    # Get the first available DICOM image
    dicom = DicomImage.objects.first()
    if not dicom:
        print("No DICOM files found in database. Run reproduce_upload.py first.")
        return

    print(f"Testing processing for DICOM ID: {dicom.id}")
    
    try:
        response = client.post(
            '/api/imaging/process/', 
            {'file_id': dicom.id, 'filter_type': 'original'}, 
            format='json'
        )
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Success key present: {'success' in data}")
            print(f"Image key present: {'image' in data}")
            if 'image' in data:
                print(f"Image data length: {len(data['image'])}")
        else:
            print(f"Error Response: {response.data}")

    except Exception as e:
        print(f"Exception during processing: {e}")

if __name__ == "__main__":
    run_test()
