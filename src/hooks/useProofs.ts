import { useState, useEffect, useCallback } from 'react';
import type { Proof } from '../types';
import { ProofType } from '../types';
import { proofsApi } from '../api/proofs';
import { useAuthContext } from './AuthContext';
import { useMultiversXAuth } from './useMultiversXAuth';

interface UseProofsOptions {
  includeDeleted?: boolean;
  autoFetch?: boolean;
  filterByUser?: boolean;
}

export const useProofs = (options: UseProofsOptions = {}) => {
  const { includeDeleted = false, autoFetch = true, filterByUser = true } = options;
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [filteredProofs, setFilteredProofs] = useState<Proof[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Récupérer les informations d'authentification
  const { user: classicUser } = useAuthContext();
  const { user: web3User, isLoggedIn: isWeb3LoggedIn } = useMultiversXAuth();

  const fetchProofs = useCallback(async () => {
    if (!autoFetch) return;
    
    try {
      setIsLoading(true);
      let fetchedProofs = await proofsApi.getAll();
      
      // Filtrer les preuves supprimées si nécessaire
      if (!includeDeleted) {
        fetchedProofs = fetchedProofs.filter(p => !p.deletedAt);
      }
      
      setProofs(fetchedProofs);
      setError(null);
      
      // Filtrer les preuves par utilisateur si demandé
      if (filterByUser) {
        const userFiltered = fetchedProofs.filter(proof => {
          // Si l'utilisateur est connecté via l'authentification classique
          if (classicUser && proof.userId === classicUser.id) return true;
          
          // Si l'utilisateur est connecté via wallet
          if (isWeb3LoggedIn && web3User?.id && 
              proof.userId === web3User.id) return true;
              
          return false;
        });
        
        setFilteredProofs(userFiltered);
      } else {
        setFilteredProofs(fetchedProofs);
      }
    } catch (err) {
      setError('Failed to fetch proofs');
      console.error('Error fetching proofs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [includeDeleted, autoFetch, filterByUser, classicUser, isWeb3LoggedIn, web3User]);

  useEffect(() => {
    fetchProofs();
  }, [fetchProofs]);

  const refreshProofs = useCallback(() => {
    fetchProofs();
  }, [fetchProofs]);

  const filterProofs = useCallback((type?: ProofType, searchTerm?: string) => {
    let filtered = filterByUser ? [...filteredProofs] : [...proofs];

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
  }, [proofs, filteredProofs, filterByUser]);

  // Retourner les preuves filtrées par défaut si filterByUser est true
  const proofsToReturn = filterByUser ? filteredProofs : proofs;
  
  return {
    proofs: proofsToReturn,
    allProofs: proofs, // Ajout de toutes les preuves (utile pour l'admin)
    isLoading,
    error,
    refreshProofs,
    filterProofs,
  };
};
