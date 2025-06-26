import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const PrivateRoute: React.FC = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};
