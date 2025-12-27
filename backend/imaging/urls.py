from django.urls import path
from .views import UploadDicomView, ProcessDicomView, VolumeDataView

urlpatterns = [
    path('upload/', UploadDicomView.as_view(), name='dicom-upload'),
    path('process/', ProcessDicomView.as_view(), name='dicom-process'),
    path('volume-data/', VolumeDataView.as_view(), name='volume-data'),
]
