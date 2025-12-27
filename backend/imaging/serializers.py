from rest_framework import serializers
from .models import DicomImage

class DicomImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = DicomImage
        fields = '__all__'
