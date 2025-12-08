# Generated manually to add new columns to existing tables

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True
    
    dependencies = [
    ]

    operations = [
        # Add new columns to existing users table
        migrations.RunSQL(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(100) DEFAULT '';",
            reverse_sql="ALTER TABLE users DROP COLUMN IF EXISTS full_name;"
        ),
        migrations.RunSQL(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS medical_license_number VARCHAR(50);",
            reverse_sql="ALTER TABLE users DROP COLUMN IF EXISTS medical_license_number;"
        ),
        migrations.RunSQL(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;",
            reverse_sql="ALTER TABLE users DROP COLUMN IF EXISTS is_verified;"
        ),
        # Update email to be NOT NULL (if needed)
        migrations.RunSQL(
            "ALTER TABLE users ALTER COLUMN email SET NOT NULL;",
            reverse_sql="ALTER TABLE users ALTER COLUMN email DROP NOT NULL;"
        ),
    ]