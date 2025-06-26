import { useState, useEffect, useCallback } from 'react';
import type { Proof } from '../types';
import { ProofType } from '../types';
import { proofsApi } from '../api/proofs';

export const useProofs = () => {
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProofs = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedProofs = await proofsApi.getAll();
      setProofs(fetchedProofs);
      setError(null);
    } catch (err) {
      setError('Failed to fetch proofs');
      console.error('Error fetching proofs:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProofs();
  }, [fetchProofs]);

  const refreshProofs = useCallback(() => {
    fetchProofs();
  }, [fetchProofs]);

  const filterProofs = useCallback((type?: ProofType, searchTerm?: string) => {
    let filtered = proofs;

    if (type) {
      filtered = filtered.filter(proof => proof.contentType === type);
    }

    if (searchTerm) {
      filtered = filtered.filter(proof => 
        proof.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proof.content?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [proofs]);

  return {
    proofs,
    isLoading,
    error,
    refreshProofs,
    filterProofs,
  };
};
