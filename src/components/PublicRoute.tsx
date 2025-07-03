import React from 'react';
import { Navigate } from 'react-router-dom';
import { useMultiversXAuth } from '../hooks/useMultiversXAuth';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isLoggedIn } = useMultiversXAuth();

  // Si l'utilisateur est connecté, rediriger vers le dashboard
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  // Sinon, afficher la page (sans navbar)
  return <>{children}</>;
};
