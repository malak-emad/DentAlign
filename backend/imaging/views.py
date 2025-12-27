from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.conf import settings
from .models import DicomImage
from .serializers import DicomImageSerializer
import SimpleITK as sitk
import pydicom
import os
import io
import base64
import numpy as np
from functools import lru_cache
from PIL import Image

@lru_cache(maxsize=32)
def load_sitk_image(file_path):
    return sitk.ReadImage(file_path)

class UploadDicomView(APIView):
    permission_classes = [AllowAny]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file_serializer = DicomImageSerializer(data=request.data)
        if file_serializer.is_valid():
            file_serializer.save()
            return Response(file_serializer.data, status=status.HTTP_201_CREATED)
        return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProcessDicomView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        """
        Apply SimpleITK filters to a DICOM file.
        Expects: 'file_id' and 'filter_type' (sharpen, smooth, noise_reduction)
        Returns: Base64 encoded PNG of the processed slice (middle slice usually)
        """
        file_id = request.data.get('file_id')
        filter_type = request.data.get('filter_type')
        slice_index = request.data.get('slice_index') # Optional 0-based index
        plane = request.data.get('plane', 'axial').lower() # axial, coronal, sagittal
        
        try:
            print(f"DEBUG: ProcessDicomView hit. file_id={file_id}, filter={filter_type}")
            dicom_record = DicomImage.objects.get(id=file_id)
            file_path = dicom_record.file.path
            
            # Read DICOM Image using SimpleITK (Cached)
            image = load_sitk_image(file_path)
            
            # Apply Filter
            if filter_type == 'sharpen':
                image = sitk.LaplacianSharpening(image)
            elif filter_type == 'smooth':
                image = sitk.DiscreteGaussian(image, variance=1.0)
            elif filter_type == 'noise_reduction':
                image = sitk.CurvatureFlow(image, timeStep=0.125, numberOfIterations=5)
            
            # SimpleITK image to numpy
            img_array = sitk.GetArrayFromImage(image)
            
            # Handle dimensions (assuming 3D or 2D)
            total_slices = 1
            current_slice_idx = 0

            if img_array.ndim == 3:
                # Default axial (axis 0)
                primary_axis = 0
                
                if plane == 'coronal':
                    primary_axis = 1
                elif plane == 'sagittal':
                    primary_axis = 2
                
                total_slices = img_array.shape[primary_axis]
                
                # Determine which slice to show
                if slice_index is not None:
                    try:
                        slice_idx = int(slice_index)
                        # Clamp index
                        slice_idx = max(0, min(slice_idx, total_slices - 1))
                    except ValueError:
                         slice_idx = total_slices // 2
                else:
                    slice_idx = total_slices // 2
                
                current_slice_idx = slice_idx
                
                if plane == 'axial':
                    img_slice = img_array[slice_idx, :, :]
                elif plane == 'coronal':
                    img_slice = img_array[:, slice_idx, :]
                    img_slice = np.flipud(img_slice) 
                elif plane == 'sagittal':
                    img_slice = img_array[:, :, slice_idx]
                    img_slice = np.flipud(img_slice)
            else:
                img_slice = img_array
            
            # --- Apply Filters & Windowing on the 2D Slice ---
            # Convert to SimpleITK image for processing
            try:
                proc_img = sitk.GetImageFromArray(img_slice)
                
                # CRITICAL FIX: Cast to Float32 immediately. 
                # Many SimpleITK filters (like CurvatureFlow) require real/float pixel types.
                # Also ensures windowing calculations are smooth.
                proc_img = sitk.Cast(proc_img, sitk.sitkFloat32)
                
                # 1. Apply Spatial Filters
                if filter_type == 'sharpen':
                    proc_img = sitk.LaplacianSharpening(proc_img)
                elif filter_type == 'smooth':
                    proc_img = sitk.DiscreteGaussian(proc_img, variance=1.0)
                elif filter_type == 'noise_reduction':
                    # median filter is robust and preserves edges better than gaussian
                    # CurvatureFlow was causing artifacts/static on some images
                    proc_img = sitk.Median(proc_img, radius=[1, 1])
                
                # 2. Apply Window/Level (Brightness/Contrast)
                window_center = request.data.get('window_center')
                window_width = request.data.get('window_width')
                
                if window_center is not None and window_width is not None:
                    wc = float(window_center)
                    ww = float(window_width)
                    
                    # Ensure width is at least 1 to avoid division by zero in some implementations
                    ww = max(ww, 1.0)
                    
                    # Calculate window bounds
                    # Standard DICOM Windowing
                    min_val = wc - ww / 2.0
                    max_val = wc + ww / 2.0
                    
                    proc_img = sitk.IntensityWindowing(proc_img, 
                                                     windowMinimum=min_val, 
                                                     windowMaximum=max_val, 
                                                     outputMinimum=0.0, 
                                                     outputMaximum=255.0)
                    
                    # Now cast to UInt8 for display
                    proc_img = sitk.Cast(proc_img, sitk.sitkUInt8)
                    img_slice = sitk.GetArrayFromImage(proc_img)
                else:
                    # Auto-scale if no W/L provided
                    arr = sitk.GetArrayFromImage(proc_img)
                    if arr.max() > arr.min():
                        arr = (arr - arr.min()) / (arr.max() - arr.min()) * 255.0
                    img_slice = arr.astype(np.uint8)
                    
            except Exception as e:
                import traceback
                traceback.print_exc()
                print(f"Error processing slice params: {e}")
                # Fallback to basic normalization if SITK fails
                img_slice = img_slice.astype(float)
                if img_slice.max() > img_slice.min():
                    img_slice = (img_slice - img_slice.min()) / (img_slice.max() - img_slice.min()) * 255.0
                img_slice = img_slice.astype(np.uint8)

            # Convert to PIL and then Base64
            pil_img = Image.fromarray(img_slice)
            buffered = io.BytesIO()
            pil_img.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
            
            return Response({
                'success': True,
                'image': f"data:image/png;base64,{img_str}",
                'total_slices': total_slices,
                'current_slice': current_slice_idx
            })
            
        except DicomImage.DoesNotExist:
             print(f"DEBUG: ProcessDicomView - File not found for id={file_id}")
             return Response({'error': 'File not found'}, status=404)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)

class VolumeDataView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        """
        Produce a subsampled 3D volume for 3D rendering.
        """
        file_id = request.data.get('file_id')
        target_size = request.data.get('target_size', 128) # Default 128px cubic
        
        try:
            print(f"DEBUG: VolumeDataView hit. file_id={file_id}, target_size={target_size}")
            dicom_record = DicomImage.objects.get(id=file_id)
            image = load_sitk_image(dicom_record.file.path)
            
            # Subsample image for web performance
            original_size = image.GetSize()
            original_spacing = image.GetSpacing()
            
            max_dim = max(original_size)
            scale = max_dim / target_size
            new_spacing = [s * scale for s in original_spacing]
            new_size = [int(sz / scale) for sz in original_size]
            
            resampler = sitk.ResampleImageFilter()
            resampler.SetOutputSpacing(new_spacing)
            resampler.SetSize(new_size)
            resampler.SetOutputDirection(image.GetDirection())
            resampler.SetOutputOrigin(image.GetOrigin())
            resampler.SetTransform(sitk.Transform())
            resampler.SetInterpolator(sitk.sitkLinear)
            
            subsampled_image = resampler.Execute(image)
            
            img_array = sitk.GetArrayFromImage(subsampled_image)
            img_array = img_array.astype(float)
            
            img_min, img_max = img_array.min(), img_array.max()
            if img_max > img_min:
                img_array = (img_array - img_min) / (img_max - img_min) * 255.0
            
            img_array = img_array.astype(np.uint8)
            
            raw_data = img_array.tobytes()
            b64_data = base64.b64encode(raw_data).decode('utf-8')
            
            return Response({
                'success': True,
                'data': b64_data,
                'dimensions': list(img_array.shape), # [z, y, x]
                'spacing': list(new_spacing)
            })
            
        except DicomImage.DoesNotExist:
             print(f"DEBUG: VolumeDataView - File not found for id={file_id}")
             return Response({'error': 'File not found'}, status=404)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)
