import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
  const { session } = useAuth();

  if (!session) {
    // Si NO hay sesión, nos vamos al login
    return <Navigate to="/login" replace />;
  }
  // Si HAY sesión, muestra el contenido del Admin 
  return <Outlet />;
};