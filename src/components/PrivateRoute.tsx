import { useContext, useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useMultiversXAuth } from '../hooks/useMultiversXAuth';
import { AuthContext } from '../hooks/AuthContext';
import { Loader } from './Loader';

interface PrivateRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  adminOnly = false 
}) => {
  const location = useLocation();
  const { isLoggedIn: isWeb3LoggedIn, isLoading: isWeb3Loading, user: web3User } = useMultiversXAuth();
  const auth = useContext(AuthContext);
  const isClassicLoggedIn = auth?.isAuthenticated;
  const isAdmin = auth?.user?.role === 'ADMIN' || web3User?.role === 'ADMIN';
  
  console.log('🔐 Vérification des droits administrateur:', {
    isClassicLoggedIn,
    isWeb3LoggedIn,
    classicUserRole: auth?.user?.role,
    web3UserRole: web3User?.role,
    isAdmin,
    adminOnly
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Marquer comme initialisé après le premier rendu
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Pendant le chargement initial, afficher un loader
  if (!isInitialized || isWeb3Loading || auth?.isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  // Si l'utilisateur n'est connecté ni via Web3 ni via l'authentification classique
  if (!isWeb3LoggedIn && !isClassicLoggedIn) {
    // Stocker la tentative d'accès pour redirection après connexion
    const redirectPath = location.pathname + location.search;
    if (redirectPath !== '/') {
      sessionStorage.setItem('redirectAfterLogin', redirectPath);
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérifier les droits admin si nécessaire
  if (adminOnly && !isAdmin) {
    console.log('🚫 Accès refusé: droits administrateur requis');
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
};
