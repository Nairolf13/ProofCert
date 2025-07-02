import React, { useState, useEffect } from 'react';
import type { User, RegisterRequest, LoginRequest } from '../types';
import { userApi } from '../api/user';
import { AuthContext } from './AuthContext';

interface AuthProviderProps {
  children: React.ReactNode;
}

const USER_KEY = 'proofcert_user';
const TOKEN_KEY = 'authToken';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setIsAuthLoading(false);
  }, []);

  const register = async (registerData: RegisterRequest) => {
    setIsAuthLoading(true);
    try {
      const { user: newUser, token } = await userApi.register(registerData);
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      localStorage.setItem(TOKEN_KEY, token);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const login = async (loginData: LoginRequest) => {
    setIsAuthLoading(true);
    try {
      const { user: loggedUser, token } = await userApi.login(loginData);
      setUser(loggedUser);
      setIsAuthenticated(true);
      localStorage.setItem(USER_KEY, JSON.stringify(loggedUser));
      localStorage.setItem(TOKEN_KEY, token);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const connectWallet = async () => {
    setIsAuthLoading(true);
    try {
      const mockWalletAddress = `erd1${Math.random().toString(36).substring(2, 15)}`;
      const { user: updatedUser } = await userApi.connectWallet(mockWalletAddress);
      setUser(updatedUser);
      setIsAuthenticated(true);
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    } finally {
      setIsAuthLoading(false);
    }
  };

  const disconnect = () => {
    userApi.disconnect();
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  const refreshUser = async () => {
    const freshUser = await userApi.getCurrentUser();
    if (freshUser) {
      setUser(freshUser);
      setIsAuthenticated(true);
      localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAuthLoading, register, login, connectWallet, disconnect, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

