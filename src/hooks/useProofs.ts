import { useState, useEffect, useCallback, useRef } from 'react';
import type { Proof } from '../types';
import { ProofType } from '../types';
import { proofsApi } from '../api/proofs';
import { useAuthContext } from './AuthContext';
import { useMultiversXAuth } from './useMultiversXAuth';

// Utilitaire de log qui ne s'exécute qu'en développement
const devLog = (...args: Parameters<typeof console.log>): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};

const devGroup = (label: string, ...args: Parameters<typeof console.group>): void => {
  if (process.env.NODE_ENV === 'development') {
    console.group(label, ...args);
  }
};

const devGroupEnd = (): void => {
  if (process.env.NODE_ENV === 'development') {
    console.groupEnd();
  }
};

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

  // Référence pour éviter les appels API en double
  const isFetchingRef = useRef(false);
  
  const fetchProofs = useCallback(async () => {
    if (!autoFetch || isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      devGroup('🔍 [useProofs] Fetching proofs...');
      
      // Log des informations utilisateur
      devLog('🔑 User info:', {
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
      devLog('📥 Fetching proofs from API...');
      const walletAddress = web3User?.walletAddress || web3User?.address;
      const headers = walletAddress ? { 'x-wallet-address': walletAddress } : undefined;
      
      // Vérifier si l'utilisateur est admin pour inclure les preuves supprimées si nécessaire
      const isAdmin = classicUser?.role === 'ADMIN' || web3User?.role === 'ADMIN';
      const shouldIncludeDeleted = includeDeleted && isAdmin;
      
      devLog('🔍 Fetching proofs with options:', {
        includeDeleted: shouldIncludeDeleted,
        isAdmin,
        walletAddress: walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` : undefined
      });
      
      let fetchedProofs = await proofsApi.getAll(headers, shouldIncludeDeleted);
      
      // Log des preuves brutes reçues
      devLog('📦 Raw proofs from API:', fetchedProofs);
      
      // Filtrage des preuves supprimées si nécessaire (côté client comme solution de secours)
      if (!shouldIncludeDeleted) {
        const beforeFilterCount = fetchedProofs.length;
        fetchedProofs = fetchedProofs.filter(p => !p.deletedAt);
        if (beforeFilterCount > fetchedProofs.length) {
          devLog(`🗑️  Filtered out ${beforeFilterCount - fetchedProofs.length} deleted proofs on client side`);
        }
      }
      
      setAllProofs(fetchedProofs);
      
      devLog('🔍 Filtering proofs for current user...', {
        isAdmin,
        classicUserId: classicUser?.id,
        web3UserAddress: web3User?.address ? `${web3User.address.substring(0, 6)}...${web3User.address.substring(web3User.address.length - 4)}` : undefined,
        web3WalletAddress: web3User?.walletAddress ? `${web3User.walletAddress.substring(0, 6)}...${web3User.walletAddress.substring(web3User.walletAddress.length - 4)}` : undefined
      });
      
      // Fonction pour vérifier si une preuve appartient à l'utilisateur
      const isProofForCurrentUser = (proof: Proof) => {
        // Si l'utilisateur est admin, il peut voir toutes les preuves
        if (isAdmin) return true;

        // Si l'utilisateur est connecté en classique, on vérifie l'ID
        if (classicUser?.id && proof.userId === classicUser.id) {
          devLog(`✅ Proof ${proof.id} matches classic user ID`);
          return true;
        }
        
        // Si l'utilisateur est connecté via wallet, on vérifie l'adresse
        const walletAddress = web3User?.walletAddress || web3User?.address;
        if (walletAddress && (proof.userId === walletAddress || proof.walletAddress === walletAddress)) {
          devLog(`✅ Proof ${proof.id} matches wallet address`);
          return true;
        }
        
        // Vérification supplémentaire pour la rétrocompatibilité
        if (proof.user && (proof.user.walletAddress === walletAddress || proof.user.id === classicUser?.id)) {
          devLog(`✅ Proof ${proof.id} matches user object`);
          return true;
        }
        
        if (process.env.NODE_ENV === 'development') {
          devLog(`❌ Proof ${proof.id} doesn't belong to current user`, {
            proofUserId: proof.userId,
            proofWalletAddress: proof.walletAddress,
            proofUser: proof.user ? {
              ...proof.user,
              walletAddress: proof.user.walletAddress ? `${proof.user.walletAddress.substring(0, 6)}...${proof.user.walletAddress.substring(proof.user.walletAddress.length - 4)}` : undefined
            } : undefined,
            classicUserId: classicUser?.id,
            web3Address: web3User?.address ? `${web3User.address.substring(0, 6)}...${web3User.address.substring(web3User.address.length - 4)}` : undefined,
            web3WalletAddress: web3User?.walletAddress ? `${web3User.walletAddress.substring(0, 6)}...${web3User.walletAddress.substring(web3User.walletAddress.length - 4)}` : undefined
          });
        }
        
        return false;
      };
      
      // Filtrer les preuves
      const filteredProofs = fetchedProofs.filter(isProofForCurrentUser);
      
      const userId = classicUser?.id || web3User?.walletAddress || web3User?.address;
      const userRole = classicUser?.role || web3User?.role || 'USER';
      
      devLog(`✅ Found ${filteredProofs.length} proofs for current user`, {
        isAdmin,
        totalProofs: fetchedProofs.length,
        filteredCount: filteredProofs.length,
        userId: userId ? `${userId.substring(0, 6)}...${userId.substring(userId.length - 4)}` : undefined,
        userRole
      });
      
      devLog(`✅ Found ${filteredProofs.length} proofs for current user`, filteredProofs);
      devGroupEnd();
      
      setUserProofs(filteredProofs);
      setError(null);
    } catch (err) {
      setError('Failed to fetch proofs');
      console.error('Error fetching proofs:', err);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [includeDeleted, autoFetch, classicUser, web3User]);

  // Utiliser un effet avec une dépendance sur autoFetch
  useEffect(() => {
    // Utiliser un délai pour éviter les appels multiples
    const timer = setTimeout(() => {
      fetchProofs();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [fetchProofs, autoFetch]);

  const refreshProofs = useCallback(() => {
    fetchProofs();
  }, [fetchProofs]);

  const filterProofs = useCallback((type?: ProofType, searchTerm?: string, showDeleted = false) => {
    let filtered = [...userProofs];

    // Filtrer par type si spécifié
    if (type) {
      filtered = filtered.filter(proof => proof.contentType === type);
    }

    // Filtrer par terme de recherche si spécifié
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(proof => 
        (proof.title?.toLowerCase().includes(search) ||
        proof.content?.toLowerCase().includes(search))
      );
    }

    // Filtrer les preuves supprimées si nécessaire
    if (!showDeleted) {
      filtered = filtered.filter(proof => !proof.deletedAt);
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
