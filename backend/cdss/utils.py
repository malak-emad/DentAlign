import os
import io
import warnings
import base64
import numpy as np
import torch
import torch.nn.functional as F
import torchvision.transforms as transforms
# Required for loading the model structure
import segmentation_models_pytorch as smp
from PIL import Image

# Suppress PyTorch warnings for clean output
warnings.filterwarnings(action='ignore', category=UserWarning)

# --- Configuration ---
# Set the device (uses GPU if available, otherwise CPU)
device = 'cuda' if torch.cuda.is_available() else 'cpu'

# Path to your saved model file - Using the path provided by the user
MODEL_PATH = '/Users/macbook/Documents/HIS/Project/Dental_CDSS_model_2/UNetEfficientnetB0-best_2.pth'

# The image size used during evaluation
IMAGE_SIZE = (384, 768)

# --- Define Evaluation Transforms ---
transform_test = transforms.Compose([
    transforms.Resize(IMAGE_SIZE),
    transforms.Grayscale(),
    transforms.ToTensor()
])

# Global model variable
loaded_model = None

def load_model():
    global loaded_model
    if loaded_model is not None:
        return loaded_model

    try:
        if not os.path.exists(MODEL_PATH):
            print(f"Model file not found at: {MODEL_PATH}")
            return None
            
        print(f"Loading model from {MODEL_PATH}...")
        loaded_model = torch.load(MODEL_PATH, map_location=device)
        loaded_model.eval()
        print(f"Model loaded successfully.")
        return loaded_model
    except Exception as e:
        print(f"Error loading model: {e}")
        return None

def predict_caries_mask(input_image: Image.Image):
    """
    Runs inference on a single PIL Image.
    Returns the binary mask as a numpy array.
    """
    model = load_model()
    if model is None:
        raise Exception("Model not loaded")

    # 2. Pre-process Image: Apply transforms and add batch dimension
    input_tensor = transform_test(input_image).unsqueeze(0).to(device)

    # 3. Run Inference
    with torch.no_grad():
        logits = model(input_tensor)
        
    # 4. Post-process Prediction
    probabilities = F.sigmoid(logits).squeeze(0).cpu() 
    
    # Threshold at 0.5
    binary_mask = (probabilities > 0.5).float()
    
    # Calculate confidence: mean probability of the positive class (in the mask area)
    # If mask is empty, return 0 or mean of entire image
    if binary_mask.sum() > 0:
        confidence = probabilities[binary_mask == 1].mean().item()
    else:
        confidence = 0.0

    return binary_mask, confidence

def get_overlay_base64(original_image: Image.Image, binary_mask):
    """
    Creates an overlay image and returns it as a base64 string.
    """
    # Resize mask to original image size if needed, or vice-versa
    # For simplicity, we resize original to model size for the overlay output
    original_resized = original_image.resize((IMAGE_SIZE[1], IMAGE_SIZE[0]))
    original_gray = original_resized.convert("RGBA")
    
    # Create red overlay
    # binary_mask is (1, H, W)
    mask_np = binary_mask.squeeze(0).numpy()
    
    # Create an RGBA image for the mask
    # Red color with alpha
    overlay = Image.new('RGBA', original_gray.size, (255, 0, 0, 0))
    pixels = overlay.load()
    
    for y in range(overlay.size[1]):
        for x in range(overlay.size[0]):
            if mask_np[y, x] > 0.5:
                # Semi-transparent red
                pixels[x, y] = (255, 0, 0, 100) 
    
    # Combine
    combined = Image.alpha_composite(original_gray, overlay)
    
    # Convert to base64
    buffered = io.BytesIO()
    combined.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    
    return img_str
