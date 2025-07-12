import { 
  useContext, 
  useEffect, 
  useState, 
  type ReactNode,
  useCallback 
} from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useMultiversXAuth } from '../hooks/useMultiversXAuth';
import { AuthContext } from '../hooks/AuthContext';
import { Loader } from './Loader';
import type { User } from '../types';

type UserRole = NonNullable<User['role']>;

interface PrivateRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
  requiredRole?: User['role'];
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  adminOnly = false,
  requiredRole
}) => {
  const location = useLocation();
  const {
    isLoggedIn: isWeb3LoggedIn,
    isLoading: isWeb3Loading,
    user: web3User
  } = useMultiversXAuth();
  
  const auth = useContext(AuthContext);
  const isClassicLoggedIn = auth?.isAuthenticated;
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Vérifier si l'utilisateur est admin
  const isAdmin = useCallback((): boolean => {
    // Vérifier via l'authentification classique
    const userRole = auth?.user?.role;
    if (userRole === 'ADMIN') return true;
    
    // Vérifier via Web3
    const web3Role = web3User?.role;
    if (web3Role === 'ADMIN') {
      // Mettre à jour le rôle dans le contexte d'authentification si nécessaire
      if (auth?.user && auth.user.role !== 'ADMIN' && auth.user.role !== undefined) {
        auth.updateUser({ 
          ...auth.user,
          // Champs obligatoires
          id: auth.user.id,
          email: auth.user.email,
          username: auth.user.username,
          // Champs avec des valeurs par défaut
          role: 'ADMIN' as const,
          walletAddress: auth.user.walletAddress || '',
          // Champs de date requis
          createdAt: auth.user.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      return true;
    }
    
    return false;
  }, [auth, web3User?.role]);
  
  // Vérifier si l'utilisateur a le rôle requis
  const hasRequiredRole = useCallback((): boolean => {
    if (!requiredRole) return true;
    
    // Vérifier explicitement le type du rôle
    const userRole = (auth?.user?.role || web3User?.role) as UserRole | undefined;
    
    // Vérifier si le rôle est défini avant de comparer
    if (!userRole) return false;
    
    // S'assurer que le rôle est bien un des rôles valides
    const validRoles: UserRole[] = ['OWNER', 'TENANT', 'ADMIN'];
    if (!validRoles.includes(userRole)) return false;
    
    return userRole === requiredRole;
  }, [requiredRole, auth?.user?.role, web3User?.role]);

  // Initialisation avec un timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Gestion de la redirection de connexion
  useEffect(() => {
    if (!isWeb3LoggedIn && !isClassicLoggedIn) {
      const redirectPath = location.pathname + location.search;
      if (redirectPath !== '/') {
        sessionStorage.setItem('redirectAfterLogin', redirectPath);
      }
    }
  }, [isWeb3LoggedIn, isClassicLoggedIn, location.pathname, location.search]);

  // Pendant le chargement initial, afficher un loader
  if (!isInitialized || isWeb3Loading || auth?.isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté
  if (!isWeb3LoggedIn && !isClassicLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérifier les rôles requis
  if (requiredRole && !hasRequiredRole()) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }
  
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
