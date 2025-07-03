import React, { useState, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import type { AuthContextProps } from './AuthContext';
import type { User, RegisterRequest, LoginRequest } from '../types';
import * as authApi from '../api/auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const login = useCallback(async (data: LoginRequest) => {
    setIsAuthLoading(true);
    try {
      const res = await authApi.login(data);
      setUser(res.user);
      setIsAuthenticated(true);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    setIsAuthLoading(true);
    try {
      const res = await authApi.register(data);
      setUser(res.user);
      setIsAuthenticated(true);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    // TODO: appeler l'API de logout si besoin
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  const value: AuthContextProps = {
    user,
    isAuthenticated,
    isAuthLoading,
    login,
    register,
    connectWallet: async () => {},
    disconnect,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
