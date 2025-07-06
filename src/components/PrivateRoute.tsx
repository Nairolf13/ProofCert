import { useContext, useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useMultiversXAuth } from '../hooks/useMultiversXAuth';
import { AuthContext } from '../hooks/AuthContext';

interface PrivateRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  adminOnly = false 
}) => {
  const location = useLocation();
  const { isLoggedIn: isWeb3LoggedIn, isLoading: isWeb3Loading } = useMultiversXAuth();
  const auth = useContext(AuthContext);
  const isClassicLoggedIn = auth?.isAuthenticated;
  const isAdmin = auth?.user?.role === 'ADMIN';
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Marquer comme initialisé après le premier rendu
    setIsInitialized(true);
  }, []);

  // Pendant le chargement initial, ne rien afficher
  if (!isInitialized || isWeb3Loading) {
    return null;
  }

  // Si l'utilisateur n'est connecté ni via Web3 ni via l'authentification classique
  if (!isWeb3LoggedIn && !isClassicLoggedIn) {
    // Stocker la tentative d'accès pour redirection après connexion
    if (location.pathname !== '/') {
      sessionStorage.setItem('redirectAfterLogin', location.pathname);
    }
    return <Navigate to="/" replace />;
  }

  // Vérifier les droits admin si nécessaire
  if (adminOnly && !isAdmin) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
};
