import React, { useMemo, useState, useEffect } from 'react';
import { userApi } from '../api/user';
import { AuthContext } from './AuthContext';
import type { User } from '../types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Récupérer le token du localStorage
        const token = localStorage.getItem('token');
        if (token) {
          // Ici, vous pourriez faire un appel API pour vérifier le token
          // Par exemple: const userData = await userApi.verifyToken(token);
          // setUser(userData);
          // setIsAdmin(userData.role === 'ADMIN');
        }
      } catch (error) {
        console.error('Erreur de vérification de l\'authentification:', error);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    try {
      setIsLoading(true);
      // Remplacez ceci par votre logique d'authentification réelle
      const response = await userApi.login({ emailOrUsername, password });
      const { user, token } = response;
      
      localStorage.setItem('token', token);
      setUser(user);
      setIsAdmin(user.role === 'ADMIN');
    } catch (error) {
      console.error('Échec de la connexion:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAdmin(false);
  };

  const value = useMemo(() => ({
    isAuthenticated: !!user,
    isAdmin,
    user,
    isLoading,
    login,
    logout,
  }), [user, isAdmin, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
