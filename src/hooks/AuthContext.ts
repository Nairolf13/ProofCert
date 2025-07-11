import { createContext, useContext } from 'react';
import type { User, RegisterRequest, LoginRequest } from '../types';
import type { MultiversXAccount } from '../config/multiversx';

export interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  register: (data: RegisterRequest) => Promise<void>;
  login: (data: LoginRequest) => Promise<void>;
  connectWallet: (walletAccount: MultiversXAccount) => Promise<User>;
  disconnect: () => void;
  refreshUser?: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within an AuthProvider');
  return context;
}
