import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useMultiversXAuth } from '../hooks/useMultiversXAuth';

export const PrivateRoute: React.FC = () => {
  const { isLoggedIn, isLoading } = useMultiversXAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  return isLoggedIn ? <Outlet /> : <Navigate to="/" replace />;
};
