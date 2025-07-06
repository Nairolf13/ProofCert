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

  const disconnect = useCallback(async () => {
    try {
      // Tenter d'appeler l'API de déconnexion
      try {
        await authApi.logout();
      } catch (error) {
        console.warn('Erreur lors de l\'appel API de déconnexion:', error);
        // On continue même en cas d'erreur
      }
      
      // Nettoyer l'état local
      setUser(null);
      setIsAuthenticated(false);
      
      // Nettoyer le stockage local et la session
      localStorage.clear();
      sessionStorage.clear();
      
      // Supprimer les cookies liés à l'authentification
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        if (name === 'token' || name === 'refreshToken') {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });
      
      // Forcer un rechargement si on est toujours sur une page protégée
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Erreur critique lors de la déconnexion:', error);
      // En cas d'erreur critique, forcer un nettoyage complet
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
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
    connectWallet: async () => {
      // Ne rien faire ici : la connexion wallet ne doit pas toucher l'état du user classique
    },
    disconnect,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
