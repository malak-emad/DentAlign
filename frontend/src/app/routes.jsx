import React from 'react';
import PublicLayout from '../components/common/PublicLayout';

import Login from '../features/auth/pages/Login';
import Signup from '../features/auth/pages/Signup';
import Home from '../features/home/pages/Home';     // 👈 add this

const routes = [
  {
    path: '/',
    element: <PublicLayout><Home /></PublicLayout>,   // 👈 Home is now the homepage
  },
  {
    path: '/login',
    element: <PublicLayout><Login /></PublicLayout>,
  },
  {
    path: '/signup', 
    element: <PublicLayout><Signup /></PublicLayout>,
  },
];

export default routes;
