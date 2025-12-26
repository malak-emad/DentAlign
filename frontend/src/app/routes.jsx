import React from 'react';
import PublicLayout from '../components/common/PublicLayout';
import DoctorOverview from '../features/home/pages/DoctorOverview';
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
import StaffNotifications from "../features/staff/pages/StaffNotifications";
import ClinicSession from "../features/staff/pages/ClinicSession";

import PatientLayout from "../features/patient/components/PatientLayout";
import PatientDashboard from "../features/patient/pages/PatientDashboard";
import PatientProfile from '../features/patient/pages/PatientProfile';
import Booking from '../features/patient/pages/Booking';

import PatientPrescriptions from '../features/patient/pages/PatientPrescription';
import PatientHistory from '../features/patient/pages/History';
import Bills from '../features/patient/pages/Bills';
import RoleBasedRoute from '../components/common/RoleBasedRoute';

// Admin Imports
import AdminLayout from '../features/admin/components/AdminLayout';
import Scheduling from '../features/admin/pages/Scheduling';
import AdminDashboard from '../features/admin/pages/AdminDashboard';
import AdminPatients from '../features/admin/pages/AdminPatients';
import AdminPatientDetails from "../features/admin/pages/AdminPatientDetails";
import AdminDoctors from '../features/admin/pages/AdminDoctors';
import AdminStaffDetails from "../features/admin/pages/AdminStaffDetails";
import Services from "../features/admin/pages/Services";
import AdminInvoices from '../features/admin/pages/Billing';
import AdminReports from '../features/admin/pages/Reporting';
import AdminUserApprovals from '../features/admin/pages/UserApprovals';



const routes = [
  {
    path: '/',
    element: <PublicLayout><Home /></PublicLayout>,   
  },
    {
    path: '/doctorOverview',
    element: <PublicLayout><DoctorOverview /></PublicLayout>,   
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
      <RoleBasedRoute allowedRoles={['Doctor', 'Nurse', 'Staff']}>
        <StaffLayout><StaffDashboard /></StaffLayout>
      </RoleBasedRoute>
    ),
  },
  {
    path: "/staff/appointments",
    element: (
      <RoleBasedRoute allowedRoles={['Doctor', 'Nurse', 'Staff']}>
        <StaffLayout><StaffAppointments /></StaffLayout>
      </RoleBasedRoute>
    ),
  },
  {
    path: "/staff/patients",
    element: (
      <RoleBasedRoute allowedRoles={['Doctor', 'Nurse', 'Staff']}>
        <StaffLayout><StaffPatients /></StaffLayout>
      </RoleBasedRoute>
    ),
  },
  {
    path: "/staff/patient/:id",
    element: (
      <RoleBasedRoute allowedRoles={['Doctor', 'Nurse', 'Staff']}>
        <StaffLayout><PatientDetails /></StaffLayout>
      </RoleBasedRoute>
    ),
  },
    {
    path: "/staff/clinic-session",
    element: (
      <RoleBasedRoute allowedRoles={['Doctor', 'Nurse', 'Staff']}>
        <StaffLayout><ClinicSession /></StaffLayout>
      </RoleBasedRoute>
    ),
  },
  {
    path: "/staff/reports",
    element: <StaffLayout><StaffReports /></StaffLayout>,
  },
  {
    path: "/staff/notifications",
    element: <StaffLayout><StaffNotifications /></StaffLayout>,
  },
  {
    path: "/staff/profile",
    element: (
      <RoleBasedRoute allowedRoles={['Doctor', 'Nurse', 'Staff']}>
        <StaffLayout><StaffProfile /></StaffLayout>
      </RoleBasedRoute>
    ),
  },
  {
    path: "/patient/dashboard",
    element: (
      <RoleBasedRoute allowedRoles={['Patient']}>
        <PatientLayout><PatientDashboard /></PatientLayout>
      </RoleBasedRoute>
    ),
  },
  {
    path: "/patient/profile",
    element: (
      <RoleBasedRoute allowedRoles={['Patient']}>
        <PatientLayout><PatientProfile /></PatientLayout>
      </RoleBasedRoute>
    ),
  },
  {
    path: "/patient/booking",
    element: (
      <RoleBasedRoute allowedRoles={['Patient']}>
        <PatientLayout><Booking /></PatientLayout>
      </RoleBasedRoute>
    ),
  },
  {
    path: "/patient/prescriptions",
    element: (
      <RoleBasedRoute allowedRoles={['Patient']}>
        <PatientLayout><PatientPrescriptions /></PatientLayout>
      </RoleBasedRoute>
    ),
  },
  {
    path: "/patient/history",
    element: (
      <RoleBasedRoute allowedRoles={['Patient']}>
        <PatientLayout><PatientHistory /></PatientLayout>
      </RoleBasedRoute>
    ),
  },
  {
    path: "/patient/bills",
    element: (
      <RoleBasedRoute allowedRoles={['Patient']}>
        <PatientLayout><Bills /></PatientLayout>
      </RoleBasedRoute>
    ),
  },
// --- ADMIN ROUTES ---
  {
    path: "/admin/dashboard",
    element: (
      <RoleBasedRoute allowedRoles={['Admin']}>
        <AdminLayout><AdminDashboard /></AdminLayout>
      </RoleBasedRoute>
    ),
  },
  {
    path: "/admin/scheduling",
    element: (
      <RoleBasedRoute allowedRoles={['Admin']}>
        <AdminLayout><Scheduling /></AdminLayout>
      </RoleBasedRoute>
    ),
  },
  {
    path: "/admin/patients",
    element: (
      <RoleBasedRoute allowedRoles={['Admin']}>
        <AdminLayout><AdminPatients /></AdminLayout>
      </RoleBasedRoute>
    ),
  },

  {
    path: "/admin/patients/:id",
    element: (
      <RoleBasedRoute allowedRoles={['Admin']}>
        <AdminLayout><AdminPatientDetails /></AdminLayout>
      </RoleBasedRoute>
    ),
  },
  {
    path: "/admin/staff",
    element: (
      <RoleBasedRoute allowedRoles={['Admin']}>
        <AdminLayout><AdminDoctors /></AdminLayout>
      </RoleBasedRoute>
    ),
  },
  {
    path: "/admin/staff/:role/:id",
    element: (
      <RoleBasedRoute allowedRoles={['Admin']}>
        <AdminLayout><AdminStaffDetails /></AdminLayout>
      </RoleBasedRoute>
    ),
  },
  {
    path: "/admin/services",
    element: (
      <RoleBasedRoute allowedRoles={['Admin']}>
        <AdminLayout><Services /></AdminLayout>
      </RoleBasedRoute>
    ),
  },
  {
    path: "/admin/invoices",
    element: (
      <RoleBasedRoute allowedRoles={['Admin']}>
        <AdminLayout><AdminInvoices /></AdminLayout>
      </RoleBasedRoute>
    ),
  },
  {
    path: "/admin/reports",
    element: (
      <RoleBasedRoute allowedRoles={['Admin']}>
        <AdminLayout><AdminReports /></AdminLayout>
      </RoleBasedRoute>
    ),
  },
  {
    path: "/admin/user-approvals",
    element: (
      <RoleBasedRoute allowedRoles={['Admin']}>
        <AdminLayout><AdminUserApprovals /></AdminLayout>
      </RoleBasedRoute>
    ),
  },
];

export default routes;
