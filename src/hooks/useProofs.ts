import { useState, useEffect, useCallback, useRef } from 'react';
import type { Proof } from '../types';
import { ProofType } from '../types';
import { proofsApi } from '../api/proofs';
import { useAuthContext } from './AuthContext';
import { useMultiversXAuth } from './useMultiversXAuth';
<<<<<<< HEAD

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
=======
>>>>>>> BranchClean

interface UseProofsOptions {
  includeDeleted?: boolean;
  autoFetch?: boolean;
  filterByUser?: boolean;
}

export const useProofs = (options: UseProofsOptions = {}) => {
<<<<<<< HEAD
  const { includeDeleted = false, autoFetch = true } = options;
  const [allProofs, setAllProofs] = useState<Proof[]>([]);
  const [userProofs, setUserProofs] = useState<Proof[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: classicUser } = useAuthContext();
  const { user: web3User } = useMultiversXAuth();
=======
  const { includeDeleted = false, autoFetch = true, filterByUser = true } = options;
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [filteredProofs, setFilteredProofs] = useState<Proof[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Récupérer les informations d'authentification
  const { user: classicUser } = useAuthContext();
  const { user: web3User, isLoggedIn: isWeb3LoggedIn } = useMultiversXAuth();
>>>>>>> BranchClean

  // Référence pour éviter les appels API en double
  const isFetchingRef = useRef(false);
  
  const fetchProofs = useCallback(async () => {
    if (!autoFetch || isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      setIsLoading(true);
<<<<<<< HEAD
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
=======
      let fetchedProofs = await proofsApi.getAll();
      
      // Filtrer les preuves supprimées si nécessaire
      if (!includeDeleted) {
>>>>>>> BranchClean
        fetchedProofs = fetchedProofs.filter(p => !p.deletedAt);
        if (beforeFilterCount > fetchedProofs.length) {
          devLog(`🗑️  Filtered out ${beforeFilterCount - fetchedProofs.length} deleted proofs on client side`);
        }
      }
      
<<<<<<< HEAD
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
=======
      setProofs(fetchedProofs);
>>>>>>> BranchClean
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
      isFetchingRef.current = false;
      setIsLoading(false);
    }
<<<<<<< HEAD
  }, [includeDeleted, autoFetch, classicUser, web3User]);
=======
  }, [includeDeleted, autoFetch, filterByUser, classicUser, isWeb3LoggedIn, web3User]);
>>>>>>> BranchClean

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

<<<<<<< HEAD
  const filterProofs = useCallback((type?: ProofType, searchTerm?: string, showDeleted = false) => {
    let filtered = [...userProofs];
=======
  const filterProofs = useCallback((type?: ProofType, searchTerm?: string) => {
    let filtered = filterByUser ? [...filteredProofs] : [...proofs];
>>>>>>> BranchClean

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
<<<<<<< HEAD
  }, [userProofs]);
=======
  }, [proofs, filteredProofs, filterByUser]);
>>>>>>> BranchClean

  // Retourner les preuves filtrées par défaut si filterByUser est true
  const proofsToReturn = filterByUser ? filteredProofs : proofs;
  
  return {
<<<<<<< HEAD
    proofs: userProofs,
    allProofs,
=======
    proofs: proofsToReturn,
    allProofs: proofs, // Ajout de toutes les preuves (utile pour l'admin)
>>>>>>> BranchClean
    isLoading,
    error,
    refreshProofs,
    filterProofs,
  };
};
