# DentAlign - Advanced Hospital Information System (HIS)

DentAlign is a state-of-the-art Hospital Information System designed to revolutionize dental and medical practice management. It seamlessly integrates robust administrative tools with cutting-edge medical imaging and AI-driven diagnostics.

## 🌟 Key Features

### 🏥 Core Hospital Management
Comprehensive tools for managing the daily operations of a medical facility.
- **Role-Based Access Control**:
  - **Doctor**: Manage appointments, view patient records, write prescriptions, and access imaging/CDSS tools.
  - **Nurse**: Assist in patient management, triage, and vital recording.
  - **Admin**: Oversee staff accounts and system settings.
  - **Patient**: Personal dashboard to view history, bills, and book appointments.
- **Patient Management (`/patient`)**:
  - **Dashboard**: Quick overview of upcoming appointments and recent activity.
  - **Profile**: Detailed demographics and contact information.
  - **Medical History**: Chronological timeline of diagnoses and treatments.
  - **Booking System**: Interactive calendar for scheduling appointments.
  - **Billing**: View invoices and payment history.
  - **Prescriptions**: Digital access to medication records.
  
### 📷 Advanced Medical Imaging (`/dicom`)
A powerful, web-based DICOM viewer built with **CornerstoneJS** and **SimpleITK**, enabling doctors to analyze medical images directly in the browser.
- **2D Slice Navigation**: distinct Axial, Coronal, and Sagittal views.
- **Toolbox**:
  - **Window/Level**: Adjust brightness and contrast for optimal tissue visualization.
  - **Zoom & Pan**: Inspect fine details.
  - **Length Measurement**: Calibrate and measure anatomical structures.
- **Image Enhancement (Server-Side Processing)**:
  - **Sharpening**: Laplacian sharpening to enhance edges.
  - **Smoothing**: Gaussian smoothing to reduce noise.
  - **Noise Reduction**: Curvature flow filtering for high-fidelity denoising.
- **3D Volume Support**:
  - Server-side subsampling and rendering for 3D visualization.

### 🧠 Clinical Decision Support System (CDSS) (`/cdss`)
An AI-powered module designed to assist dentists in identifying pathologies like caries from X-rays.
- **AI Model**: **U-Net with EfficientNet-B0 Encoder**
  - Architecture: `segmentation_models_pytorch` (SMP).
  - Pre-trained on ImageNet, fine-tuned for dental radiography.
  - **Input**: Grayscale X-ray images (resized to 384x768).
  - **Output**: Binary segmentation mask indicating potential caries.
- **Workflow**:
  1.  **Upload**: Doctor uploads a dental X-ray.
  2.  **Inference (PyTorch)**: The backend processes the image using the loaded model.
  3.  **Visualization**: A semi-transparent **Red Overlay** maps the detected caries directly onto the original X-ray.
  4.  **Confidence Score**: The system provides a probability score to help the doctor gauge the prediction's reliability.

---

## 🏗 System Architecture

### Frontend (User Interface)
Built for speed and interactivity using modern React ecosystem.
- **Framework**: **React 19** + **Vite** (Fast HMR and building).
- **Routing**: **React Router Dom** with protected, role-based routes.
- **3D graphics**: **Three.js** via `@react-three/fiber` for advanced visualizations.
- **DICOM Rendering**: **CornerstoneJS** (Core, Tools) and `dicom-parser`.
- **State Management**: React Context & Hooks.

### Backend (API & Processing)
A secure and scalable Django foundation.
- **Framework**: **Django 5.x** + **Django REST Framework (DRF)**.
- **Authentication**: JWT (JSON Web Tokens) via `djangorestframework-simplejwt`.
- **Image Processing**:
  - **SimpleITK**: Industry-standard library for multidimensional image analysis.
  - **Pillow (PIL)**: Basic image manipulation.
  - **Pydicom**: Reading and modifying DICOM metadata.
- **Artificial Intelligence**:
  - **PyTorch**: Deep learning tensor computation.
  - **Segmentation Models PyTorch**: High-level API for semantic segmentation architectures.

---

## 📂 Project Structure

### Frontend (`/frontend`)
- `src/features`: Modular feature-based architecture.
  - `auth`: Login, Signup (Doctor/Nurse).
  - `patient`: Patient dashboard, booking, history, bills.
  - `staff`: Staff dashboards, patient management tools.
  - `imaging`: DICOM viewer and CornerstoneJS integration.
  - `cdss`: UI for AI analysis and result conceptualization.
  - `home`: Landing page.
- `src/app/routes.jsx`: Centralized routing configuration with `RoleBasedRoute` guards.

### Backend (`/backend`)
- `accounts`: User authentication and role management.
- `appointments`: Scheduling logic and time slot management.
- `patients`: Patient demographics and records API.
- `medical`: Medical history and prescriptions.
- `imaging`: DICOM upload, storage, and processing views (`ProcessDicomView`, `VolumeDataView`).
- `cdss`: Model loading (`utils.py`), inference logic, and prediction API.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Access
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://127.0.0.1:8000`

