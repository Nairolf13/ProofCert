import { createContext } from 'react';
import type { User, RegisterRequest, LoginRequest } from '../types';

export interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  register: (data: RegisterRequest) => Promise<void>;
  login: (data: LoginRequest) => Promise<void>;
  connectWallet: () => Promise<void>;
  disconnect: () => void;
  refreshUser?: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);
