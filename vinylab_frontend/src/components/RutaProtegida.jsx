import React from 'react';
import { Navigate } from 'react-router-dom';

const RutaProtegida = ({ children, requiereAdmin = true }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (requiereAdmin && payload.rolName !== 'Admin') {
      return <Navigate to="/" replace />;
    }
  } catch (e) {
    localStorage.removeItem('token');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RutaProtegida;
