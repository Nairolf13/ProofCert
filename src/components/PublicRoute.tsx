import { useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useMultiversXAuth } from '../hooks/useMultiversXAuth';
import { AuthContext } from '../hooks/AuthContext';

interface PublicRouteProps {
  children: ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isLoggedIn: isWeb3LoggedIn, isLoading: isWeb3Loading } = useMultiversXAuth();
  const auth = useContext(AuthContext);
  const isClassicLoggedIn = auth?.isAuthenticated;
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Pendant le chargement initial, ne rien afficher
  if (!isInitialized || isWeb3Loading) {
    return null;
  }

  // Si l'utilisateur est connecté, rediriger vers le dashboard
  if (isWeb3LoggedIn || isClassicLoggedIn) {
    const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/app/dashboard';
    // Nettoyer la redirection après l'avoir utilisée
    if (sessionStorage.getItem('redirectAfterLogin')) {
      sessionStorage.removeItem('redirectAfterLogin');
    }
    return <Navigate to={redirectTo} replace />;
  }

  // Sinon, afficher la page (sans navbar)
  return <>{children}</>;
};
