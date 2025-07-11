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
          setUser(parsedUser);
          setIsAuthenticated(true);
          return parsedUser;
        }
      }
      
      // Vérifier d'abord si l'utilisateur existe dans la base de données via l'API users/by-wallet
      try {
        console.log('Recherche de l\'utilisateur dans la base de données pour l\'adresse:', walletAccount.address);
        const response = await userApi.get(`/by-wallet/${walletAccount.address}`);
        console.log('Réponse de l\'API by-wallet:', response);
        
        if (response.data && response.data.success && response.data.exists && response.data.data) {
          // Utilisateur existant, mettre à jour les données locales
          const userData = response.data.data;
          console.log('Utilisateur trouvé dans la base de données:', userData);
          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(userData));
          return userData;
        }
      } catch (error) {
        console.warn('Erreur lors de la récupération de l\'utilisateur depuis le backend:', error);
        // Continuer avec la création d'un nouvel utilisateur si l'utilisateur n'existe pas
      }
      
      // Créer un nouvel utilisateur avec les infos du wallet
      const userData: User = {
        id: walletAccount.address,
        email: `${walletAccount.address}@wallet`,
        username: walletAccount.address.slice(0, 8) + '...' + walletAccount.address.slice(-4),
        walletAddress: walletAccount.address,
        role: 'TENANT' as const, // Rôle par défaut, peut être mis à jour plus tard
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Ajouter des champs supplémentaires pour correspondre au type User attendu
        firstName: '',
        lastName: '',
        phoneNumber: '',
        profileImage: null,
        isEmailVerified: false,
        isPhoneVerified: false
      };
      
      // Enregistrer l'utilisateur dans la base de données
      try {
        console.log('Création d\'un nouvel utilisateur avec les données:', userData);
        const password = Math.random().toString(36).slice(-12); // Mot de passe aléatoire pour la sécurité
        const response = await authApi.register({
          email: userData.email,
          username: userData.username,
          password,
          walletAddress: userData.walletAddress,
          role: userData.role,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber
        });
        
        console.log('Réponse de l\'enregistrement:', response);
        
        // Mettre à jour avec les données renvoyées par le serveur
        if (response && response.user) {
          console.log('Utilisateur créé avec succès:', response.user);
          setUser(response.user);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(response.user));
          return response.user;
        }
      } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur:', error);
        // Continuer avec les données locales même en cas d'échec de l'enregistrement
      }
      
      // Si l'enregistrement a échoué, utiliser les données locales
      console.log('Utilisation des données utilisateur locales');
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return userData;
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
