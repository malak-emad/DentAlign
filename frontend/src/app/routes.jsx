import React from 'react';
import PublicLayout from '../components/common/PublicLayout';

import Login from '../features/auth/pages/Login';
import Signup from '../features/auth/pages/Signup';
import DoctorSignup from '../features/auth/pages/DoctorSignup';
import NurseSignup from '../features/auth/pages/NurseSignup';
import Home from '../features/home/pages/Home';     
import Contact from "../features/contact/pages/Contact";
import StaffLayout from "../components/common/StaffLayout";
import StaffDashboard from "../features/staff/pages/StaffDashboard";
import StaffAppointments from "../features/staff/pages/StaffAppointments";
import StaffPatients from "../features/staff/pages/StaffPatients";
import PatientDetails from "../features/staff/pages/PatientDetails";
// import StaffReports from "../features/staff/pages/StaffReports";
import StaffProfile from "../features/staff/pages/StaffProfile";

import PatientLayout from "../features/patient/components/PatientLayout";
// frontend\src\features\patient\components\PatientLayout.jsx
import PatientDashboard from "../features/patient/pages/PatientDashboard";
import PatientProfile from '../features/patient/pages/PatientProfile';
import Booking from '../features/patient/pages/Booking';

import PatientPrescriptions from '../features/patient/pages/PatientPrescription';
import PatientHistory from '../features/patient/pages/History';
import Bills from '../features/patient/pages/Bills';
import RoleBasedRoute from '../components/common/RoleBasedRoute';



const routes = [
  {
    path: '/',
    element: <PublicLayout><Home /></PublicLayout>,   
  },
  {
    path: '/login',
    element: <PublicLayout><Login /></PublicLayout>,
  },
  {
    path: '/signup', 
    element: <PublicLayout><Signup /></PublicLayout>,
  },
  {
    path: '/signup/doctor', 
    element: <PublicLayout><DoctorSignup /></PublicLayout>,
  },
  {
    path: '/signup/nurse', 
    element: <PublicLayout><NurseSignup /></PublicLayout>,
  },
  {
  path: "/contact",
  element: <PublicLayout><Contact /></PublicLayout>,
  },



  //   // --- STAFF ROUTES (DOCTOR ONLY) ---
    {
    path: "/staff",
    element: (
      <RoleBasedRoute allowedRoles={['Doctor']}>
        <StaffLayout><StaffDashboard /></StaffLayout>
      </RoleBasedRoute>
    ),
  },
  {
    path: "/staff/dashboard",
    element: (
      <RoleBasedRoute allowedRoles={['Doctor']}>
        <StaffLayout><StaffDashboard /></StaffLayout>
      </RoleBasedRoute>
    ),
  },
  {
    path: "/staff/appointments",
    element: (
      <RoleBasedRoute allowedRoles={['Doctor']}>
        <StaffLayout><StaffAppointments /></StaffLayout>
      </RoleBasedRoute>
    ),
  },
  {
    path: "/staff/patients",
    element: (
      <RoleBasedRoute allowedRoles={['Doctor']}>
        <StaffLayout><StaffPatients /></StaffLayout>
      </RoleBasedRoute>
    ),
  },
  {
    path: "/staff/patient/:id",
    element: (
      <RoleBasedRoute allowedRoles={['Doctor']}>
        <StaffLayout><PatientDetails /></StaffLayout>
      </RoleBasedRoute>
    ),
  },
  // {
  //   path: "/staff/reports",
  //   element: <StaffLayout><StaffReports /></StaffLayout>,
  // },
  {
    path: "/staff/profile",
    element: (
      <RoleBasedRoute allowedRoles={['Doctor']}>
        <StaffLayout><StaffProfile /></StaffLayout>
      </RoleBasedRoute>
    ),
  },
  {
  path: "/patient/dashboard",
  element: <PatientLayout><PatientDashboard /></PatientLayout>
  },
  {
    path: "/patient/profile",
    element: <PatientLayout><PatientProfile /></PatientLayout>
  },
  {
    path: "/patient/booking",
    element: <PatientLayout><Booking /></PatientLayout>
  },
  {
    path: "/patient/prescriptions",
    element: <PatientLayout><PatientPrescriptions /></PatientLayout>
  },
  {
    path: "/patient/history",
    element: <PatientLayout><PatientHistory /></PatientLayout>
  },
  {
    path: "/patient/bills",
    element: <PatientLayout><Bills /></PatientLayout>
  },
];

export default routes;
