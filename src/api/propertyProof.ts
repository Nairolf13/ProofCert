import type { Proof } from '../types/index';
import api from './user';

export const propertyProofApi = {
  create: async (data: {
    title?: string;
    description?: string;
    contentType: string;
    hash: string;
    ipfsHash?: string;
    propertyId?: string;
    rentalId?: string;
    isPublic?: boolean;
  }) => {
    const response = await api.post('/proofs', data);
    return response.data;
  },
  getByProperty: async (propertyId: string): Promise<Proof[]> => {
    const response = await api.get(`/proofs?propertyId=${propertyId}`);
    return response.data;
  },
  getByRental: async (rentalId: string): Promise<Proof[]> => {
    const response = await api.get(`/proofs?rentalId=${rentalId}`);
    return response.data;
  },
};
