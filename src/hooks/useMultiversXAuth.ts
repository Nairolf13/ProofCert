<<<<<<< HEAD
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useGetAccountInfo, useGetIsLoggedIn } from '@multiversx/sdk-dapp/hooks';
import { logout as sdkLogout } from '@multiversx/sdk-dapp/utils/logout';
import userApi from '../api/user';

import type { User } from '../types';

type UserRole = 'OWNER' | 'TENANT' | 'ADMIN' | 'USER';

interface MultiversXUser {
  // Champs de base du wallet
=======
import { useEffect, useState, useCallback } from 'react';
import {
  useGetAccountInfo,
  useGetIsLoggedIn,
  useGetLoginInfo,
  logout as logoutMultiversX
} from '../lib/multiversx';
import api from '../api/user';

interface MultiversXUser {
  id: string;
>>>>>>> BranchClean
  address: string;
  balance: string;
  nonce: number;
  shard: number;
  walletAddress: string;
<<<<<<< HEAD
  
  // Champs de l'utilisateur classique
  id: string;
  role: UserRole;
  email: string;
  username: string | null;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImage?: string | null;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  createdAt: string;
  updatedAt: string;
=======
  role: string;
  email?: string;
  phone?: string;
  name?: string;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown; // Pour les propriétés supplémentaires
}

// Vérifier si l'utilisateur est authentifié via l'API classique
const getClassicAuthUser = (): MultiversXUser | null => {
  if (typeof window === 'undefined') return null;
  
  const userData = localStorage.getItem('user');
  if (!userData) return null;
  
  try {
<<<<<<< HEAD
    const user: User = JSON.parse(userData);
    
    // Créer un objet avec des valeurs par défaut pour les champs obligatoires
    const defaultUser: MultiversXUser = {
      // Champs de base
=======
    const user = JSON.parse(userData);
    return {
      id: user.id || 'unknown',
      role: user.role || 'USER',
>>>>>>> BranchClean
      address: user.walletAddress || '',
      balance: '0',
      nonce: 0,
      shard: 0,
      walletAddress: user.walletAddress || '',
<<<<<<< HEAD
      
      // Champs obligatoires avec valeurs par défaut
      id: user.id || '',
      role: user.role || 'USER',
      email: user.email || '',
      username: user.username || null,
      
      // Champs optionnels
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      profileImage: user.profileImage,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      
      // S'assurer que les champs de date sont toujours définis
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: user.updatedAt || new Date().toISOString()
    };
    
    return defaultUser;
=======
      email: user.email,
      phone: user.phone,
      name: user.name,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
>>>>>>> BranchClean
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Récupère les informations d'un utilisateur à partir de son adresse wallet
 * @param walletAddress L'adresse wallet de l'utilisateur
 * @returns Les données de l'utilisateur ou null si non trouvé
 */
const fetchUserByWallet = async (walletAddress: string): Promise<MultiversXUser | null> => {
  if (!walletAddress) {
    console.error('❌ Aucune adresse wallet fournie');
    return null;
  }

  console.log(`🔍 Vérification de l'existence de l'utilisateur pour le wallet: ${walletAddress}`);
  
  try {
    // 1. Vérifier d'abord si l'utilisateur existe dans la base de données
    const apiUrl = `/users/by-wallet/${walletAddress}`;
    console.log(`🌐 Appel API: GET ${apiUrl}`);
    console.log('🔍 En-têtes de la requête:', {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // Ajoutez d'autres en-têtes si nécessaire
    });
    
    const response = await api.get(apiUrl);
    console.log('📡 Réponse brute de l\'API:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });
    
    const { data } = response;
    
    // Vérifier si l'utilisateur existe dans la réponse
    if (!data || !data.exists) {
      console.log(`ℹ️ Aucun utilisateur trouvé pour le wallet: ${walletAddress}`);
      return null;
    }
    
    const user = data.data || data; // Prendre data.data si disponible, sinon data
    console.log('✅ Utilisateur trouvé dans la base de données:', user);
    
    // S'assurer que l'ID est présent
    if (!user?.id) {
      console.warn('⚠️ L\'utilisateur n\'a pas d\'ID, utilisation de l\'ID du wallet');
      user.id = data.id || `wallet_${walletAddress}`;
    }
    
    // 3. Formater et retourner les données utilisateur
    const userData: MultiversXUser = {
      // Champs de base - priorité à user.*, puis data.*, puis valeurs par défaut
      id: user?.id || data?.id || `wallet_${walletAddress}`,
      // Préserver le rôle existant s'il est déjà défini (important pour les admins)
      role: user?.role || data?.role || 'USER',
      address: walletAddress,
      walletAddress: walletAddress,
      
      // Informations de l'utilisateur
      email: user?.email || data?.email || `${walletAddress.slice(0, 8)}@wallet`,
      name: user?.name || user?.username || data?.name || `User ${walletAddress.slice(0, 6)}`,
      username: user?.username || data?.username || `user_${walletAddress.slice(0, 8)}`,
      phone: user?.phone || data?.phone || '',
      profileImage: user?.profileImage || data?.profileImage,
      
      // Champs techniques
      balance: (user?.balance || data?.balance || '0').toString(),
      nonce: user?.nonce || data?.nonce || 0,
      shard: user?.shard || data?.shard || 0,
      createdAt: user?.createdAt || data?.createdAt || new Date().toISOString(),
      updatedAt: user?.updatedAt || data?.updatedAt || new Date().toISOString(),
      
      // Copier toutes les autres propriétés non typées de l'utilisateur
      ...(user && typeof user === 'object' ? user : {}),
      // Ne pas écraser avec data qui contient des métadonnées de réponse
    };
    
    // Nettoyer les champs vides ou undefined
    Object.keys(userData).forEach(key => {
      if (userData[key] === undefined) {
        delete userData[key];
      }
    });
    
    console.log('📋 Données utilisateur récupérées:', {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role
    });
    
    return userData;
    
  } catch (error: unknown) {
    // Gestion spécifique du cas 404 (utilisateur non trouvé)
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as { response?: { status?: number } }).response?.status === 'number' &&
      (error as { response: { status: number } }).response.status === 404
    ) {
      console.log(`ℹ️ Aucun utilisateur trouvé pour le wallet: ${walletAddress}`);
      return null;
    }
    
    // Gestion des autres erreurs
    console.error('❌ Erreur lors de la vérification de l\'utilisateur:', error);
    
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as { response?: unknown }).response === 'object' &&
      (error as { response?: unknown }).response !== null
    ) {
      const response = (error as { response: { status?: number; statusText?: string; data?: unknown } }).response;
      console.error('📡 Détails de l\'erreur:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
    }
    
    // En cas d'erreur, on retourne null pour indiquer qu'aucun utilisateur n'a pu être récupéré
    return null;
  }
};

export const useMultiversXAuth = () => {
  const { account, address } = useGetAccountInfo();
  const isWalletConnected = useGetIsLoggedIn();
  const { tokenLogin } = useGetLoginInfo();
  const [isLoading, setIsLoading] = useState(false);
  // Initialisation de l'utilisateur depuis le localStorage (toujours à jour)
  const [userData, setUserData] = useState<MultiversXUser | null>(() => getClassicAuthUser());

  // Fonction pour forcer la récupération de l'utilisateur classique depuis l'API (après login classique)
  const fetchAndPersistClassicUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!token) return null;
      const response = await api.get('/auth/me');
      const user = response.data;
      if (user && user.id) {
        localStorage.setItem('user', JSON.stringify(user));
        setUserData(user);
        return user;
      }
      return null;
    } catch (err) {
      console.error('[useMultiversXAuth] Erreur lors de la récupération de l’utilisateur classique:', err);
      return null;
    }
  }, []);

  // Fonction pour charger les données utilisateur
  // Fonction pour charger les données utilisateur (wallet OU classique)
  const loadUserData = useCallback(async (walletAddress?: string) => {
    setIsLoading(true);
    try {
      // Si wallet connecté, on tente d'abord par le wallet
      if (walletAddress) {
        const userData = await fetchUserByWallet(walletAddress);
        if (userData) {
          setUserData(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          return userData;
        } else {
          // Si pas d'utilisateur wallet, on tente de lier au classique
          const userStr = localStorage.getItem('user');
          const token = localStorage.getItem('authToken') || localStorage.getItem('token') || undefined;
          if (userStr && token) {
            const user = JSON.parse(userStr);
            try {
              const { user: updatedUser } = await (await import('../api/user')).userApi.connectWallet(walletAddress, token);
              setUserData({ ...user, ...updatedUser });
              localStorage.setItem('user', JSON.stringify({ ...user, ...updatedUser }));
              return { ...user, ...updatedUser };
            } catch (err) {
              console.error('[useMultiversXAuth] Erreur lors de la liaison du wallet:', err);
              return null;
            }
          }
          return null;
        }
      } else {
        // Sinon, on force la récupération de l'utilisateur classique
        return await fetchAndPersistClassicUser();
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchAndPersistClassicUser]);

  // Effet pour charger les données utilisateur au montage
  // Effet pour charger les données utilisateur au montage ou après login classique
  useEffect(() => {
    if (isWalletConnected && address) {
      // Wallet connecté : charger l'utilisateur wallet ou lier au classique
      loadUserData(address);
    } else if (localStorage.getItem('token')) {
      // Pas de wallet mais token classique : charger l'utilisateur classique
      loadUserData();
    }
  }, [isWalletConnected, address, loadUserData]);

  // Fonction de déconnexion
  const logout = useCallback(async () => {
    try {
      console.log('🔒 Début de la déconnexion...');
      console.log('📝 État avant déconnexion:', { 
        userData, 
        hasToken: !!localStorage.getItem('token'),
        hasUser: !!localStorage.getItem('user')
      });
      
      await logoutMultiversX();
      
      // Sauvegarder les favoris avant de déconnecter
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      console.log('💾 Favoris actuels:', favorites);
      
      // Nettoyer le stockage local (classique + wallet)
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('multiversx_address');
      localStorage.removeItem('multiversx_logged_in');
      localStorage.removeItem('multiversx_provider');
      // Restaurer les favoris
      if (favorites.length > 0) {
        localStorage.setItem('favorites', JSON.stringify(favorites));
      }
      setUserData(null);
      console.log('👋 Utilisateur déconnecté avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
    }
  }, []);

  // Synchroniser l'état d'authentification avec le localStorage
  // Synchronisation de l'état d'authentification avec le localStorage (déconnexion wallet)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isWalletConnected) {
      // Si déconnecté du wallet, revenir à l'utilisateur classique si dispo
      const classicUser = getClassicAuthUser();
      if (classicUser) {
        setUserData(classicUser);
      } else {
        setUserData(null);
      }
      // Nettoyer le localStorage du wallet
      localStorage.removeItem('multiversx_address');
      localStorage.removeItem('multiversx_logged_in');
      localStorage.removeItem('multiversx_provider');
    }
  }, [isWalletConnected]);

  // L'utilisateur est considéré comme connecté s'il est connecté via wallet avec un ID valide
  const isLoggedIn = (isWalletConnected && !!userData?.id) || 
                   (!isWalletConnected && !!userData?.id && !!localStorage.getItem('token'));
>>>>>>> BranchClean

  // Retourner les valeurs du hook
  const isUserLoggedIn = isWalletConnected || !!userData?.id;
  
  return {
<<<<<<< HEAD
    isLoggedIn: isUserLoggedIn,
    isLoading: false, // Ajout d'une valeur par défaut pour isLoading
    user: userWithRole, // Utilisation de userWithRole au lieu de user
    address: userData?.address || '',
    balance: userData?.balance || '0',
    nonce: userData?.nonce || 0,
    shard: userData?.shard || 0,
    walletAddress: userData?.walletAddress || '',
    logout: handleLogoutInternal,
    updateUser: setUserData,
    account: userData // Ajout de la propriété account pour la rétrocompatibilité
  } as const;
};
=======
    // Authentification state
    isLoggedIn,
    isLoading,
    isWalletConnected,

    // Account info
    account: userData || account,
    address: address, // toujours l'adresse du SDK

    // Login info (includes native auth token)
    tokenLogin,
    nativeAuthToken: tokenLogin?.nativeAuthToken,

    // Actions
    logout,
    loadUserData: useCallback(async () => {
      if (address) {
        await loadUserData(address);
      }
    }, [address, loadUserData]),

    // Computed values
    walletAddress: userData?.walletAddress || address,
    user: userData || null
  };
};
>>>>>>> BranchClean
