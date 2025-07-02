import type { Rental } from '../types/index';
import api from './user';

export const rentalApi = {
  create: async (data: { propertyId: string; tenantId: string; startDate: string; endDate?: string }) => {
    const response = await api.post('/rentals', data);
    return response.data;
  },
  getAll: async (): Promise<Rental[]> => {
    const response = await api.get('/rentals');
    return response.data;
  },
  getUserReservations: async (): Promise<Rental[]> => {
    const response = await api.get('/rentals');
    return response.data;
  },
};
