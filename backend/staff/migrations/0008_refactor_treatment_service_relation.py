# Generated manually
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('staff', '0007_add_services_available'),
    ]

    operations = [
        # Add actual_cost field first (nullable)
        migrations.AddField(
            model_name='treatment',
            name='actual_cost',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
        # Remove description field first (data comes from service.description)
        migrations.RemoveField(
            model_name='treatment',
            name='description',
        ),
        # Remove cost field (data comes from service.price or actual_cost)
        migrations.RemoveField(
            model_name='treatment',
            name='cost',
        ),
        # Rename treatment_code to treatment_code_old temporarily
        migrations.RenameField(
            model_name='treatment',
            old_name='treatment_code',
            new_name='treatment_code_old',
        ),
        # Add service ForeignKey (nullable, will use treatment_code as db_column)
        migrations.AddField(
            model_name='treatment',
            name='service',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='treatments',
                to='staff.service',
                db_column='treatment_code'
            ),
        ),
        # Remove the old treatment_code_old field
        migrations.RemoveField(
            model_name='treatment',
            name='treatment_code_old',
        ),
    ]

