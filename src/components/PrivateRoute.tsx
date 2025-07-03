import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useMultiversXAuth } from '../hooks/useMultiversXAuth';
import { AuthContext } from '../hooks/AuthContext';

export const PrivateRoute: React.FC = () => {
  const { isLoggedIn: isWeb3LoggedIn, isLoading } = useMultiversXAuth();
  const auth = useContext(AuthContext);
  const isClassicLoggedIn = auth?.isAuthenticated;

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  return (isWeb3LoggedIn || isClassicLoggedIn) ? <Outlet /> : <Navigate to="/" replace />;
};
