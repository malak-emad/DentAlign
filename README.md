# 🦷 DentAlign - Dental Clinic Management System

![DentAlign Banner](https://via.placeholder.com/1200x400?text=DentAlign+-+Dental+Clinic+Management+System)

DentAlign is a comprehensive, modern, and full-stack Dental Clinic Management System. It streamlines the day-to-day operations of a dental clinic by providing dedicated portals for Patients, Staff (Doctors & Nurses), and Administrators.

With a powerful Django backend and a responsive, dynamic React frontend, DentAlign handles everything from appointment scheduling and electronic medical records to billing, user approvals, and real-time dashboard analytics.

---

## ✨ Key Features

### 🧑‍⚕️ For Staff (Doctors & Nurses)
- **Clinic Dashboard:** Overview of daily operations, upcoming appointments, and patient statistics.
- **Appointment Management:** View and manage daily schedules and incoming patient appointments.
- **Patient Records:** Access and update detailed patient profiles, medical histories, and previous clinical sessions.
- **Clinic Sessions:** Live management of ongoing clinical sessions, including adding diagnoses and writing prescriptions.
- **Reports & Notifications:** Real-time updates and exportable clinic reports.

### 👤 For Patients
- **Patient Dashboard:** Easy-to-read overview of upcoming appointments and recent medical history.
- **Online Booking:** Intuitive appointment scheduling system with available time slots.
- **Prescriptions & Bills:** Access past prescriptions and manage invoices/bills securely.
- **Medical History:** Complete view of previous dental procedures and records.

### 🛠️ For Administrators
- **Admin Dashboard:** High-level metrics, system health, and overall clinic performance.
- **User Approvals:** Approve or decline new staff/doctor registrations to maintain system security.
- **Resource Scheduling:** Manage overall clinic schedules, doctor availability, and service catalogs.
- **Billing & Invoices:** Global overview of the clinic's financial status and individual patient invoices.
- **Comprehensive Reporting:** Generate system-wide reports on patients, staff, and financials.

---

## 🏗️ Technology Stack

**Frontend:**
- ⚛️ **React 19** - UI Library
- ⚡ **Vite** - Build tool and development server
- 🗺️ **React Router DOM v7** - Declarative routing
- 📊 **Recharts** - Composable charting library

**Backend:**
- 🐍 **Python / Django 5.2** - High-level Python web framework
- 🔌 **Django REST Framework** - Powerful and flexible toolkit for building Web APIs
- 🗄️ **PostgreSQL** - Relational database (with SQLite fallback for local development)
- 🔑 **Token Authentication** - Secure REST API authentication
- 🌐 **Corsheaders** - Handling Cross-Origin Resource Sharing

---

## 📸 Screenshots

*(Replace these placeholder images with actual screenshots of your running application)*

### Admin Dashboard
![Admin Dashboard](https://via.placeholder.com/800x450?text=Admin+Dashboard+Screenshot)

### Patient Portal & Booking
![Patient Booking](https://via.placeholder.com/800x450?text=Patient+Booking+Screenshot)

### Doctor Clinic Session
![Clinic Session](https://via.placeholder.com/800x450?text=Doctor+Clinic+Session+Screenshot)

---

## 🚀 Getting Started

Follow these instructions to get a local copy of DentAlign up and running.

### Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)
- **PostgreSQL** (Optional, falls back to SQLite)

### 1. Backend Setup

Open a terminal and navigate to the `backend` directory:

```bash
cd backend
```

Create a virtual environment and activate it:
```bash
python3 -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
```

Install the dependencies:
```bash
pip install -r requirements.txt
```

Run database migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

Start the development server:
```bash
python manage.py runserver
```
The backend API will be available at `http://127.0.0.1:8000/`.

### 2. Frontend Setup

Open a new terminal and navigate to the `frontend` directory:

```bash
cd frontend
```

Install the required packages:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```
The frontend application will be available at `http://localhost:5173/`.

---

## 📂 Project Structure

```text
DentAlign/
├── backend/                  # Django REST API
│   ├── accounts/             # User authentication and custom user models
│   ├── appointments/         # Appointment scheduling logic
│   ├── backend/              # Core Django settings and URL configurations
│   ├── dentalign_admin/      # Admin portal APIs
│   ├── medical/              # Medical records and prescriptions
│   ├── patients/             # Patient profiles and history APIs
│   ├── staff/                # Staff management and session APIs
│   ├── manage.py             # Django execution script
│   └── requirements.txt      # Python dependencies
│
└── frontend/                 # React UI
    ├── public/               # Static assets
    ├── src/
    │   ├── app/              # Main app configuration and routing (routes.jsx)
    │   ├── components/       # Reusable UI components and layouts
    │   ├── features/         # Feature-based modules (admin, auth, patient, staff, etc.)
    │   ├── styles/           # Global CSS stylesheets
    │   ├── App.jsx           # Root React component
    │   └── main.jsx          # React entry point
    ├── package.json          # Node dependencies and scripts
    └── vite.config.js        # Vite build configuration
```

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.
