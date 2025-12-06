import React from 'react';
import Login from '../features/auth/pages/Login';
import PublicLayout from '../components/common/PublicLayout'; // 👈 Import Layout
import Signup from '../features/auth/pages/Signup';

const routes = [
  {
    path: '/',
    element: <PublicLayout><Login /></PublicLayout>, // Wrapped in Layout
  },
  {
    path: '/login',
    element: <PublicLayout><Login /></PublicLayout>, // Wrapped in Layout
  },
  // Add other routes as you create pages
  // {
  //   path: '/dashboard',
  //   element: <Dashboard />,
  // },
  {
    path: '/signup', 
    element: <PublicLayout><Signup /></PublicLayout>,
  },
];

export default routes;