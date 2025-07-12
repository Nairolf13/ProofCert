import React, { createContext, useContext, useMemo } from 'react';
import { useCurrentUser } from '../hooks/api/use-user-queries';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: any | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isAdmin: false,
  user: null,
  isLoading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const { user, isAdmin, isLoading } = useCurrentUser();
  
  const value = useMemo(() => ({
    isAuthenticated: !!user,
    isAdmin,
    user,
    isLoading,
  }), [user, isAdmin, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
