from django.db import models

class DicomImage(models.Model):
    file = models.FileField(upload_to='dicom_files/')
    upload_date = models.DateTimeField(auto_now_add=True)
    patient_id = models.CharField(max_length=100, blank=True, null=True)
    patient_name = models.CharField(max_length=255, blank=True, null=True)
    study_id = models.CharField(max_length=100, blank=True, null=True)
    
    def __str__(self):
        return f"DICOM {self.id} - {self.upload_date}"
