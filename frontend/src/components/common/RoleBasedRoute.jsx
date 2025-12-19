import React from 'react';
import { Navigate } from 'react-router-dom';

// Get user data from localStorage
const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  if (!user || !token) {
    return null;
  }
  
  try {
    return JSON.parse(user);
  } catch (e) {
    return null;
  }
};

export default function RoleBasedRoute({ children, allowedRoles = [] }) {
  const user = getCurrentUser();
  
  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If user doesn't have required role, redirect to unauthorized page
  // Handle both user.role (string) and user.role.name (object) formats
  const userRole = typeof user.role === 'object' ? user.role.name : user.role;
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // User is authenticated and has correct role
  return children;
}
