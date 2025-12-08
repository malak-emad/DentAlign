import React from 'react';
import PublicLayout from '../components/common/PublicLayout';

import Login from '../features/auth/pages/Login';
import Signup from '../features/auth/pages/Signup';
import DoctorSignup from '../features/auth/pages/DoctorSignup';
import NurseSignup from '../features/auth/pages/NurseSignup';
import Home from '../features/home/pages/Home';     
import Contact from "../features/contact/pages/Contact";

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
];

export default routes;
