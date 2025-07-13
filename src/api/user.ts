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
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000, // Augmentation du timeout à 30 secondes
  withCredentials: true, // Enable credentials (cookies) for all requests
  validateStatus: (status) => status >= 200 && status < 500 // Considérer les réponses 4xx comme valides
});

api.interceptors.request.use((config) => {
  // Vérifier d'abord 'authToken' (utilisé par la méthode login)
  // puis 'token' pour la rétrocompatibilité
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
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

// Add Axios response interceptor for automatic token refresh
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
      // Stocker le token sous la clé 'token' pour la cohérence
      localStorage.setItem('token', token);
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
      // Vérifier d'abord 'token' puis 'authToken' pour la rétrocompatibilité
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) return null;
      
      const response = await api.get('/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 200 && response.data) {
        const user = response.data.user || response.data;
        localStorage.setItem('user', JSON.stringify(user));
        return user;
      }
      
      // Si la réponse n'est pas valide, supprimer le token
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      localStorage.removeItem('token');
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
  getByWallet: async (walletAddress: string): Promise<User | null> => {
    try {
      const res = await api.get(`/users/by-wallet/${walletAddress}`, {
        timeout: 10000 // Timeout spécifique pour cette requête
      });
      
      if (res.status === 404) {
        console.log('Aucun utilisateur trouvé pour ce wallet');
        return null;
      }
      
      if (res.status !== 200) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', res.status, res.statusText);
        return null;
      }
      
      // Vérifier si la réponse contient une propriété data avec les données utilisateur
      if (res.data && typeof res.data === 'object' && 'data' in res.data) {
        return res.data.data; // Retourner directement l'objet utilisateur
      }
      
      return res.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur par wallet:', error);
      return null;
    }
  },
};

export default api;
