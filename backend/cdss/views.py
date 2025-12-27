from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from PIL import Image
import io
import json
from .utils import predict_caries_mask, get_overlay_base64

@csrf_exempt
def predict_view(request):
    if request.method == 'POST':
        try:
            # Check if file is in request.FILES
            if 'image' not in request.FILES:
                return JsonResponse({'error': 'No image provided'}, status=400)
            
            image_file = request.FILES['image']
            
            # Open image
            try:
                img = Image.open(image_file).convert('L') # Convert to grayscale
            except Exception as e:
                 return JsonResponse({'error': 'Invalid image format'}, status=400)

            # Run prediction
            try:
                mask, confidence = predict_caries_mask(img)
            except Exception as e:
                return JsonResponse({'error': f'Model inference failed: {str(e)}'}, status=500)
            
            # Generate visualization
            overlay_b64 = get_overlay_base64(img, mask)
            
            return JsonResponse({
                'success': True,
                'image': f"data:image/png;base64,{overlay_b64}",
                'confidence': float(confidence)
            })

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)
