import type { Property } from '../types/index';
import api from './user';

export const propertyApi = {
  create: async (data: { title: string; address: string; country: string; region: string; city: string; area: number; price: number; pricePeriod: 'DAY' | 'WEEK' | 'MONTH'; isAvailable: boolean; photos: string[]; description?: string }) => {
    const response = await api.post('/properties', data);
    return response.data;
  },
  getAll: async (): Promise<Property[]> => {
    const response = await api.get('/properties');
    return response.data;
  },
  getById: async (id: string): Promise<Property> => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },
  update: async (id: string, data: Partial<Omit<Property, 'id' | 'owner' | 'createdAt' | 'updatedAt'>>) => {
    const response = await api.put(`/properties/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  },
  promoteToOwner: async () => {
    const response = await api.patch('/auth/role', { role: 'OWNER' });
    // Si le backend renvoie accessToken, on le stocke dans le localStorage
    if (response.data.accessToken) {
      localStorage.setItem('authToken', response.data.accessToken);
      api.defaults.headers.common['Authorization'] = 'Bearer ' + response.data.accessToken;
    }
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  getReviews: async (propertyId: string) => {
    const response = await api.get(`/properties/${propertyId}/reviews`);
    return response.data;
  },
  addReview: async (propertyId: string, data: { rating: number; comment: string }) => {
    const response = await api.post(`/properties/${propertyId}/reviews`, data);
    return response.data;
  },
  deleteReview: async (reviewId: string) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },
};
