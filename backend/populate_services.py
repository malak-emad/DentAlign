#!/usr/bin/env python
"""
Script to populate initial services in the services_available table
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from staff.models import Service

def populate_services():
    """Add initial services to the catalog"""
    
    initial_services = [
        {
            'name': 'Consultation',
            'description': 'Initial patient consultation and examination',
            'price': 400.00,
            'is_active': True
        },
        {
            'name': 'Dental Cleaning',
            'description': 'Professional dental cleaning and scaling',
            'price': 2500.00,
            'is_active': True
        },
        {
            'name': 'Cavity Filling',
            'description': 'Tooth cavity filling procedure',
            'price': 800.00,
            'is_active': True
        },
        {
            'name': 'Root Canal',
            'description': 'Root canal treatment procedure',
            'price': 5000.00,
            'is_active': True
        },
        {
            'name': 'Teeth Whitening',
            'description': 'Professional teeth whitening treatment',
            'price': 3000.00,
            'is_active': True
        },
        {
            'name': 'Dental Extraction',
            'description': 'Tooth extraction procedure',
            'price': 1200.00,
            'is_active': True
        },
        {
            'name': 'Dental Crown',
            'description': 'Dental crown installation',
            'price': 4000.00,
            'is_active': True
        },
        {
            'name': 'Orthodontic Consultation',
            'description': 'Consultation for orthodontic treatment',
            'price': 500.00,
            'is_active': True
        }
    ]
    
    print("Populating services catalog...")
    print("=" * 60)
    
    created_count = 0
    skipped_count = 0
    
    for service_data in initial_services:
        # Check if service already exists
        if Service.objects.filter(name=service_data['name']).exists():
            print(f"[SKIP] '{service_data['name']}' - already exists")
            skipped_count += 1
            continue
        
        # Create the service
        service = Service.objects.create(**service_data)
        print(f"[OK] Created: {service.name} - {service.price} EGP")
        created_count += 1
    
    print("=" * 60)
    print(f"\nSummary:")
    print(f"  Created: {created_count} services")
    print(f"  Skipped: {skipped_count} services (already exist)")
    print(f"  Total services in catalog: {Service.objects.count()}")
    
    if created_count > 0:
        print("\n[SUCCESS] Services catalog populated successfully!")
    else:
        print("\n[INFO] All services already exist in the catalog.")

if __name__ == "__main__":
    populate_services()

