import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

def check_table_schema():
    cursor = connection.cursor()
    
    # Check patients table
    print("Patients table columns:")
    cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'patients'")
    patients_columns = [row[0] for row in cursor.fetchall()]
    print(patients_columns)
    
    # Check appointments table
    print("\nAppointments table columns:")
    cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'appointments'")
    appointments_columns = [row[0] for row in cursor.fetchall()]
    print(appointments_columns)
    
    # Check staff table  
    print("\nStaff table columns:")
    cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'staff'")
    staff_columns = [row[0] for row in cursor.fetchall()]
    print(staff_columns)
    
    # Check treatments table
    print("\nTreatments table columns:")
    cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'treatments'")
    treatments_columns = [row[0] for row in cursor.fetchall()]
    print(treatments_columns)
    
    cursor.close()

if __name__ == "__main__":
    check_table_schema()