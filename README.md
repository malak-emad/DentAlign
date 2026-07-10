# DentAlign – Dental Clinic Management System

A full-stack Dental Clinic Management System designed to streamline clinical workflows, patient management, appointment scheduling, and administrative operations. The system provides dedicated web portals for patients, healthcare staff, and administrators, enabling efficient management of both clinical and operational activities within a dental practice.

Built with a **Django REST Framework** backend and a **React + Vite** frontend, DentAlign offers a responsive user experience backed by a secure and scalable REST API.

---

## Features

### Patient Portal

- Secure user authentication
- Online appointment booking
- View upcoming and previous appointments
- Access prescriptions and treatment history
- View invoices and billing information
- Manage personal profile

### Staff Portal (Doctors & Nurses)

- Daily dashboard and appointment schedule
- Patient record management
- Clinical session management
- Diagnosis and prescription creation
- Medical history review
- Notifications and clinic reports

### Administrator Portal

- Administrative dashboard
- Doctor and staff approval workflow
- Staff and patient management
- Appointment and resource scheduling
- Billing and invoice management
- System-wide reporting and analytics

---

## Technology Stack

### Frontend

- React 19
- Vite
- React Router DOM v7
- Recharts

### Backend

- Python
- Django 5.2
- Django REST Framework
- PostgreSQL
- SQLite (development)
- Token Authentication
- django-cors-headers

---

## Project Structure

```text
DentAlign/
│
├── backend/
│   ├── accounts/
│   ├── appointments/
│   ├── backend/
│   ├── dentalign_admin/
│   ├── medical/
│   ├── patients/
│   ├── staff/
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── app/
    │   ├── components/
    │   ├── features/
    │   ├── styles/
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL (optional)

---

### Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment:

```bash
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

Linux/macOS:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run database migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

Start the backend server:

```bash
python manage.py runserver
```

The API will be available at:

```
http://127.0.0.1:8000/
```

---

### Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend application will be available at:

```
http://localhost:5173/
```

---

## Screenshots

### Administrator Dashboard

> Add screenshot here

### Patient Dashboard

> Add screenshot here

### Appointment Booking

> Add screenshot here

### Clinical Session

> Add screenshot here

---

## System Highlights

- Multi-role authentication and authorization
- RESTful API architecture
- Electronic patient records
- Appointment scheduling system
- Prescription management
- Billing and invoice management
- Responsive web interface
- Dashboard analytics and reporting


