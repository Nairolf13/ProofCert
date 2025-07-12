import React, { useState, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import type { AuthContextProps } from './AuthContext';
import type { User, RegisterRequest, LoginRequest } from '../types';
import * as authApi from '../api/auth';
import userApi from '../api/user';
import type { MultiversXAccount } from '../config/multiversx';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Récupérer l'utilisateur depuis le localStorage s'il existe
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('user'));
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const login = useCallback(async (data: LoginRequest) => {
    setIsAuthLoading(true);
    try {
      const res = await authApi.login(data);
      setUser(res.user);
      setIsAuthenticated(true);
      // Sauvegarder l'utilisateur dans le localStorage
      localStorage.setItem('user', JSON.stringify(res.user));
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
      try {
        await authApi.logout();
      } catch (error) {
        console.warn('Erreur lors de l\'appel API de déconnexion:', error);
      }
      
      setUser(null);
      setIsAuthenticated(false);
      
      localStorage.clear();
      sessionStorage.clear();
      
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        if (name === 'token' || name === 'refreshToken') {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });
      
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
    // Mettre à jour l'utilisateur dans le localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  // Fonction pour connecter l'utilisateur via le wallet
  const connectWallet = useCallback(async (walletAccount: MultiversXAccount): Promise<User> => {
    try {
      setIsAuthLoading(true);
      
      // Vérifier d'abord dans le localStorage
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser.walletAddress === walletAccount.address) {
          console.log('Utilisateur trouvé dans le localStorage:', parsedUser);
          
          // Vérifier si le rôle est à jour dans le localStorage
          const response = await userApi.get(`/by-wallet/${walletAccount.address}`);
          if (response.data?.success && response.data?.exists && response.data?.data) {
            const userData = response.data.data;
            if (userData.role === 'ADMIN' && parsedUser.role !== 'ADMIN') {
              console.log('Mise à jour du rôle administrateur dans le localStorage');
              parsedUser.role = 'ADMIN';
              localStorage.setItem('user', JSON.stringify(parsedUser));
            }
          }
          
          setUser(parsedUser);
          setIsAuthenticated(true);
          return parsedUser;
        }
      }
      
      // Vérifier si l'utilisateur existe dans la base de données via l'API users/by-wallet
      console.log('Recherche de l\'utilisateur dans la base de données pour l\'adresse:', walletAccount.address);
      const response = await userApi.get(`/by-wallet/${walletAccount.address}`);
      console.log('Réponse de l\'API by-wallet:', response);
      
      if (response.data && response.data.success && response.data.exists && response.data.data) {
        // Utilisateur trouvé, mettre à jour les données locales
        const userData = response.data.data;
        console.log('Utilisateur trouvé dans la base de données:', userData);
        
        // Mettre à jour le localStorage avec les données complètes de l'utilisateur
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        
        return userData;
      } else {
        // Aucun utilisateur trouvé avec cette adresse wallet
        console.log('Aucun utilisateur trouvé avec cette adresse wallet');
        throw new Error('Aucun compte trouvé pour cette adresse wallet. Veuillez d\'abord créer un compte.');
      }
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const value: AuthContextProps = {
    user,
    isAuthenticated,
    isAuthLoading,
    login,
    register,
    connectWallet,
    disconnect,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
