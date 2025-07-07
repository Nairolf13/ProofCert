import { useState, useEffect, useCallback } from 'react';
import type { Proof } from '../types';
import { ProofType } from '../types';
import { proofsApi } from '../api/proofs';

interface UseProofsOptions {
  includeDeleted?: boolean;
  autoFetch?: boolean;
}

export const useProofs = (options: UseProofsOptions = {}) => {
  const { includeDeleted = false, autoFetch = true } = options;
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProofs = useCallback(async () => {
    if (!autoFetch) return;
    
    try {
      setIsLoading(true);
      let fetchedProofs = await proofsApi.getAll();
      if (!includeDeleted) {
        fetchedProofs = fetchedProofs.filter(p => !p.deletedAt);
      }
      setProofs(fetchedProofs);
      setError(null);
    } catch (err) {
      setError('Failed to fetch proofs');
      console.error('Error fetching proofs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [includeDeleted, autoFetch]);

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
