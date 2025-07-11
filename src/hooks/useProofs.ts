import { useState, useEffect, useCallback } from 'react';
import type { Proof } from '../types';
import { ProofType } from '../types';
import { proofsApi } from '../api/proofs';
import { useAuthContext } from './AuthContext';
import { useMultiversXAuth } from './useMultiversXAuth';

interface UseProofsOptions {
  includeDeleted?: boolean;
  autoFetch?: boolean;
}

export const useProofs = (options: UseProofsOptions = {}) => {
  const { includeDeleted = false, autoFetch = true } = options;
  const [allProofs, setAllProofs] = useState<Proof[]>([]);
  const [userProofs, setUserProofs] = useState<Proof[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: classicUser } = useAuthContext();
  const { user: web3User } = useMultiversXAuth();

  const fetchProofs = useCallback(async () => {
    if (!autoFetch) return;
    
    try {
      setIsLoading(true);
      console.group('🔍 [useProofs] Fetching proofs...');
      
      // Log des informations utilisateur
      console.log('🔑 User info:', {
        classicUser: classicUser ? { 
          id: classicUser.id, 
          email: classicUser.email, 
          role: classicUser.role 
        } : 'Not authenticated (classic)',
        web3User: web3User ? { 
          address: web3User.address, 
          id: web3User.id, 
          role: web3User.role,
          walletAddress: web3User.walletAddress
        } : 'Not authenticated (web3)'
      });
      
      // Récupération des preuves avec l'adresse du wallet dans les en-têtes si disponible
      console.log('📥 Fetching proofs from API...');
      const walletAddress = web3User?.walletAddress || web3User?.address;
      const headers = walletAddress ? { 'x-wallet-address': walletAddress } : undefined;
      let fetchedProofs = await proofsApi.getAll(headers);
      
      // Log des preuves brutes reçues
      console.log('📦 Raw proofs from API:', fetchedProofs);
      
      // Filtrage des preuves supprimées si nécessaire
      if (!includeDeleted) {
        const beforeFilterCount = fetchedProofs.length;
        fetchedProofs = fetchedProofs.filter(p => !p.deletedAt);
        console.log(`🗑️  Filtered out ${beforeFilterCount - fetchedProofs.length} deleted proofs`);
      }
      
      setAllProofs(fetchedProofs);
      
      // Déterminer si l'utilisateur est admin
      const isAdmin = classicUser?.role === 'ADMIN' || web3User?.role === 'ADMIN';
      
      console.log('🔍 Filtering proofs for current user...', {
        isAdmin,
        classicUserId: classicUser?.id,
        web3UserAddress: web3User?.address,
        web3WalletAddress: web3User?.walletAddress
      });
      
      // Fonction pour vérifier si une preuve appartient à l'utilisateur
      const isProofForCurrentUser = (proof: Proof) => {
        // Si l'utilisateur est connecté en classique, on vérifie l'ID
        if (classicUser?.id && proof.userId === classicUser.id) {
          console.log(`✅ Proof ${proof.id} matches classic user ID`);
          return true;
        }
        
        // Si l'utilisateur est connecté via wallet, on vérifie l'adresse
        const walletAddress = web3User?.walletAddress || web3User?.address;
        if (walletAddress && proof.userId === walletAddress) {
          console.log(`✅ Proof ${proof.id} matches wallet address`);
          return true;
        }
        
        console.log(`❌ Proof ${proof.id} doesn't belong to current user`, {
          proofUserId: proof.userId,
          classicUserId: classicUser?.id,
          web3Address: web3User?.address,
          web3WalletAddress: web3User?.walletAddress
        });
        
        return false;
      };
      
      // Filtrer les preuves
      const filteredProofs = isAdmin 
        ? fetchedProofs // Si admin, on prend tout
        : fetchedProofs.filter(isProofForCurrentUser);
      
      console.log(`✅ Found ${filteredProofs.length} proofs for current user`, {
        isAdmin,
        totalProofs: fetchedProofs.length,
        filteredCount: filteredProofs.length,
        userId: classicUser?.id || web3User?.walletAddress || web3User?.address,
        userRole: classicUser?.role || web3User?.role || 'USER'
      });
      
      console.log(`✅ Found ${filteredProofs.length} proofs for current user`, filteredProofs);
      console.groupEnd();
      
      setUserProofs(filteredProofs);
      setError(null);
    } catch (err) {
      setError('Failed to fetch proofs');
      console.error('Error fetching proofs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [includeDeleted, autoFetch, classicUser, web3User]);

  useEffect(() => {
    fetchProofs();
  }, [fetchProofs]);

  const refreshProofs = useCallback(() => {
    fetchProofs();
  }, [fetchProofs]);

  const filterProofs = useCallback((type?: ProofType, searchTerm?: string) => {
    let filtered = userProofs;

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
  }, [userProofs]);

  return {
    proofs: userProofs,
    allProofs,
    isLoading,
    error,
    refreshProofs,
    filterProofs,
  };
};
