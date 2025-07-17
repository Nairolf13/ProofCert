import { 
  useContext, 
  useEffect, 
  useState, 
  type ReactNode,
  useMemo 
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
  
  // Check if user is admin
  const isAdmin = useMemo((): boolean => {
    // Check classic auth
    if (auth?.user?.role && auth.user.role === 'ADMIN') return true;
    
    // Check Web3 auth
    if (web3User?.role && web3User.role === 'ADMIN') {
      // Update auth context if needed
      if (auth?.user && auth.user.role !== 'ADMIN' && auth.user.role !== undefined) {
        auth.updateUser({ 
          ...auth.user,
          id: auth.user.id,
          email: auth.user.email || '',
          username: auth.user.username || '',
          role: 'ADMIN' as const,
          walletAddress: auth.user.walletAddress || '',
          createdAt: auth.user.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      return true;
    }
    
    return false;
  }, [auth, web3User?.role]);
  
  // Check if user has required role
  const hasRequiredRole = useMemo((): boolean => {
    if (!requiredRole) return true;
    
    const userRole = (auth?.user?.role || web3User?.role) as UserRole | undefined;
    if (!userRole) return false;
    
    // Ensure both roles are of the same type for comparison
    return userRole.toString() === requiredRole.toString();
  }, [requiredRole, auth?.user?.role, web3User?.role]);

  // Debug logging
  useEffect(() => {
    console.log('🔐 Auth check:', {
      isClassicLoggedIn,
      isWeb3LoggedIn,
      classicUserRole: auth?.user?.role,
      web3UserRole: web3User?.role,
      isAdmin,
      adminOnly,
      requiredRole,
      hasRequiredRole
    });
  }, [isClassicLoggedIn, isWeb3LoggedIn, auth?.user?.role, web3User?.role, isAdmin, adminOnly, requiredRole, hasRequiredRole]);
  
  // Initialize with timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [setIsInitialized]);
  
  // Handle login redirect
  useEffect(() => {
    if (!isWeb3LoggedIn && !isClassicLoggedIn) {
      const redirectPath = `${location.pathname}${location.search}`;
      if (redirectPath !== '/') {
        sessionStorage.setItem('redirectAfterLogin', redirectPath);
      }
    }
  }, [isWeb3LoggedIn, isClassicLoggedIn, location.pathname, location.search]);

  // Show loader while initializing
  if (!isInitialized || isWeb3Loading || auth?.isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isWeb3LoggedIn && !isClassicLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check required role
  if (requiredRole && !hasRequiredRole) {
    console.log('🚫 Access denied: missing required role', { requiredRole });
    return <Navigate to="/app/dashboard" state={{ from: location }} replace />;
  }
  
  // Check admin rights if required
  if (adminOnly && !isAdmin) {
    console.log('🚫 Access denied: admin rights required');
    return <Navigate to="/app/dashboard" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
