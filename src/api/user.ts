import axios, { AxiosError } from 'axios';
import type { User, LoginRequest, RegisterRequest } from '../types';

const getApiBaseUrl = () => {
  if (import.meta.env.DEV) {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:3001/api`;
    }
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  withCredentials: false
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper function to extract error message from API response
const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as { error: string; message?: string };
    return apiError?.error || apiError?.message || error.message || defaultMessage;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
};

export const userApi = {
  register: async (registerData: RegisterRequest): Promise<{ user: User; token: string }> => {
    try {
      const response = await api.post('/auth/register', {
        email: registerData.email.toLowerCase().trim(),
        username: registerData.username,
        password: registerData.password,
      });
      const { user, token } = response.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { user, token };
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Registration failed'));
    }
  },
  login: async (loginData: LoginRequest): Promise<{ user: User; token: string }> => {
    try {
      const normalizedEmailOrUsername = loginData.emailOrUsername.includes('@')
        ? loginData.emailOrUsername.toLowerCase().trim()
        : loginData.emailOrUsername;
      const response = await api.post('/auth/login', {
        emailOrUsername: normalizedEmailOrUsername,
        password: loginData.password,
      });
      const { user, token } = response.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { user, token };
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Login failed'));
    }
  },
  connectWallet: async (walletAddress: string): Promise<{ user: User }> => {
    try {
      const response = await api.post('/auth/connect-wallet', { walletAddress });
      const { user } = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      return { user };
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Wallet connection failed'));
    }
  },
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;
      const response = await api.get('/auth/me');
      const { user } = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return null;
    }
  },
  getCurrentUserLocal: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  disconnect: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
  updateProfileImage: async (profileImageUrl: string): Promise<User> => {
    try {
      const response = await api.patch('/auth/profile-image', { profileImage: profileImageUrl });
      const { user } = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Profile image update failed'));
    }
  },
};

export default api;
