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
  withCredentials: true 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

let isRefreshing = false;
type FailedQueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        // Call refresh endpoint (must send cookies)
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        const { accessToken: newToken } = refreshResponse.data;
        localStorage.setItem('token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return api({ 
          ...originalRequest, 
          headers: { 
            ...originalRequest.headers, 
            Authorization: `Bearer ${newToken}` 
          } 
        });
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Logout user if refresh fails
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

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
  getByWallet: async (walletAddress: string): Promise<{ user: User | null; role?: string }> => {
    try {
      const res = await api.get(`/users/by-wallet/${walletAddress}`);
      
      if (res.data?.success) {
        if (res.data.exists && res.data.data) {
          return { 
            user: res.data.data, 
            role: res.data.data.role 
          };
        }
      } else {
        console.log('Invalid response format from API');
      }
      return { user: null };
    } catch (error) {
      // Ne pas logger les erreurs 404 car c'est un cas attendu
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status !== 404) {
        console.error('Error fetching user by wallet:', error);
      }
      return { user: null };
    }
  },
};

export default api;
