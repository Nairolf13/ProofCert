import { AxiosError } from 'axios';
import type { Proof, CreateProofRequest, ShareableProof } from '../types';
import api from './user';

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

export const proofsApi = {
  create: async (proofData: CreateProofRequest): Promise<Proof> => {
    try {
      const response = await api.post('/proofs', proofData);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to create proof'));
    }
  },
  getAll: async (): Promise<Proof[]> => {
    try {
      const response = await api.get('/proofs');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch proofs'));
    }
  },
  getById: async (id: string): Promise<Proof | null> => {
    try {
      const response = await api.get(`/proofs/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return null;
      }
      throw new Error(getErrorMessage(error, 'Failed to fetch proof'));
    }
  },
  getByShareToken: async (shareToken: string): Promise<ShareableProof | null> => {
    try {
      const response = await api.get(`/share/${shareToken}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return null;
      }
      throw new Error(getErrorMessage(error, 'Failed to fetch shared proof'));
    }
  },
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/proofs/${id}`);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to delete proof'));
    }
  },
  updateTransactionHash: async (id: string, transactionHash: string): Promise<Proof> => {
    try {
      const response = await api.patch(`/proofs/${id}`, { transactionHash });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to update transaction hash'));
    }
  },
  updateIpfsHash: async (id: string, ipfsHash: string): Promise<Proof> => {
    try {
      const response = await api.patch(`/proofs/${id}`, { ipfsHash });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to update IPFS hash'));
    }
  },
  getByPropertyId: async (propertyId: string): Promise<Proof[]> => {
    try {
      const response = await api.get(`/proofs/by-property/${propertyId}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch proofs for property'));
    }
  },
};
