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
import StaffReports from "../features/staff/pages/StaffReports";
import StaffProfile from "../features/staff/pages/StaffProfile";

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



  //   // --- STAFF ROUTES ---
  {
    path: "/staff/dashboard",
    element: <StaffLayout><StaffDashboard /></StaffLayout>,
  },
  {
    path: "/staff/appointments",
    element: <StaffLayout><StaffAppointments /></StaffLayout>,
  },
  {
    path: "/staff/patients",
    element: <StaffLayout><StaffPatients /></StaffLayout>,
  },
  {
    path: "/staff/patient/:id",
    element: <StaffLayout><PatientDetails /></StaffLayout>,
  },
  {
    path: "/staff/reports",
    element: <StaffLayout><StaffReports /></StaffLayout>,
  },
  {
    path: "/staff/profile",
    element: <StaffLayout><StaffProfile /></StaffLayout>,
  }
];

export default routes;
