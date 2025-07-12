import { useEffect, useState, useCallback, useMemo } from 'react';
import { useGetAccountInfo, useGetIsLoggedIn } from '@multiversx/sdk-dapp/hooks';
import { logout as sdkLogout } from '@multiversx/sdk-dapp/utils/logout';
import userApi from '../api/user';

import type { User } from '../types';

type UserRole = 'OWNER' | 'TENANT' | 'ADMIN' | 'USER';

interface MultiversXUser {
  // Champs de base du wallet
  address: string;
  balance: string;
  nonce: number;
  shard: number;
  walletAddress: string;
  
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
}

// Vérifier si l'utilisateur est authentifié via l'API classique
const getClassicAuthUser = (): MultiversXUser | null => {
  if (typeof window === 'undefined') return null;
  
  const userData = localStorage.getItem('user');
  if (!userData) return null;
  
  try {
    const user: User = JSON.parse(userData);
    
    // Créer un objet avec des valeurs par défaut pour les champs obligatoires
    const defaultUser: MultiversXUser = {
      // Champs de base
      address: user.walletAddress || '',
      balance: '0',
      nonce: 0,
      shard: 0,
      walletAddress: user.walletAddress || '',
      
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
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const useMultiversXAuth = () => {
  const { account, address } = useGetAccountInfo();
  const isWalletConnected = useGetIsLoggedIn();
  // Suppression de l'état isLoading inutilisé
  const [userData, setUserData] = useState<MultiversXUser | null>(() => {
    // Au chargement initial, on essaie de récupérer l'utilisateur classique
    return getClassicAuthUser();
  });
  
  // Mettre à jour l'utilisateur avec les données du wallet
  const updateUserWithWalletData = useCallback(() => {
    if (isWalletConnected && address && account) {
      setUserData(prev => ({
        ...(prev || {} as MultiversXUser),
        address: address,
        balance: account.balance?.toString() || '0',
        nonce: account.nonce || 0,
        shard: account.shard || 0,
        walletAddress: address,
        role: prev?.role || 'USER',
        id: prev?.id || '',
        email: prev?.email || '',
        username: prev?.username || null,
        createdAt: prev?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    }
  }, [isWalletConnected, address, account]);

  // Synchroniser l'état d'authentification avec le localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const syncAuthState = () => {
      // Toujours vérifier l'utilisateur classique en premier
      const classicUser = getClassicAuthUser();
      
      if (isWalletConnected && address) {
        // Créer un utilisateur avec les données du wallet
        const newUser: MultiversXUser = {
          address: address,
          balance: account?.balance?.toString() || '0',
          nonce: account?.nonce || 0,
          shard: account?.shard || 0,
          walletAddress: address,
          // Valeurs par défaut pour les champs obligatoires
          id: '',
          role: 'USER',
          email: '',
          username: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Mettre à jour l'utilisateur avec les données du wallet
        setUserData(prev => ({
          ...(prev || {} as MultiversXUser),
          ...newUser
        }));
        
        // Fusionner avec les données de l'utilisateur classique si elles existent
        
        // Mettre à jour le localStorage
        if (localStorage.getItem('multiversx_address') !== address) {
          localStorage.setItem('multiversx_address', address);
          localStorage.setItem('multiversx_logged_in', 'true');
        }
      } else {
        // Si déconnecté du wallet, revenir à l'utilisateur classique
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
    };
    
    syncAuthState();
  }, [isWalletConnected, address, account?.balance, account?.nonce, account?.username, account?.shard, updateUserWithWalletData]);

  // Suppression de la fonction handleLogout redondante
  // Utilisation de handleLogoutInternal pour la déconnexion
  
  // Suppression des déclarations redondantes de user et isLoggedIn
  
  // Vérifier périodiquement le rôle administrateur
  useEffect(() => {
    if (!isWalletConnected || !address) return;

    const checkAdminRole = async () => {
      try {
        const response = await userApi.get(`/users/by-wallet/${address}`);
        
        if (response.data?.success && response.data?.exists && response.data?.data) {
          const serverUserData = response.data.data;
          
          // Mettre à jour l'état local si nécessaire
          setUserData(prevUser => {
            if (!prevUser || prevUser.role !== serverUserData.role) {
              // Mettre à jour le localStorage
              const savedUser = localStorage.getItem('user');
              if (savedUser) {
                try {
                  const parsedUser = JSON.parse(savedUser);
                  if (parsedUser.role !== serverUserData.role) {
                    const updatedUser = { ...parsedUser, role: serverUserData.role };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                  }
                } catch (error) {
                  console.error('Error parsing saved user:', error);
                }
              }
              
              return {
                ...(prevUser || {} as MultiversXUser),
                role: serverUserData.role,
                id: serverUserData.id || prevUser?.id || '',
                email: serverUserData.email || prevUser?.email || '',
                username: serverUserData.username || prevUser?.username || null,
                firstName: serverUserData.firstName || prevUser?.firstName,
                lastName: serverUserData.lastName || prevUser?.lastName,
                phoneNumber: serverUserData.phoneNumber || prevUser?.phoneNumber,
                profileImage: serverUserData.profileImage || prevUser?.profileImage,
                isEmailVerified: serverUserData.isEmailVerified ?? prevUser?.isEmailVerified,
                isPhoneVerified: serverUserData.isPhoneVerified ?? prevUser?.isPhoneVerified,
                createdAt: serverUserData.createdAt || prevUser?.createdAt || new Date().toISOString(),
                updatedAt: serverUserData.updatedAt || new Date().toISOString(),
                // Champs obligatoires de MultiversXUser
                address: prevUser?.address || '',
                balance: prevUser?.balance || '0',
                nonce: prevUser?.nonce || 0,
                shard: prevUser?.shard || 0,
                walletAddress: prevUser?.walletAddress || ''
              };
            }
            return prevUser;
          });
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
      }
    };
    
    // Vérifier immédiatement, puis périodiquement pour s'assurer que le rôle est à jour
    checkAdminRole();
    const intervalId = setInterval(checkAdminRole, 30000); // Vérifier toutes les 30 secondes
    
    return () => {
      clearInterval(intervalId);
    };
  }, [isWalletConnected, address]);

  // Nettoyer les données utilisateur lors de la déconnexion
  const handleLogoutInternal = useCallback(async () => {
    try {
      await sdkLogout();
      setUserData(null);
      localStorage.removeItem('user');
      localStorage.removeItem('multiversx_address');
      localStorage.removeItem('multiversx_logged_in');
      localStorage.removeItem('multiversx_provider');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, []);

  // Mettre à jour le rôle dans les données utilisateur si nécessaire et retourner les valeurs du hook
  const userWithRole = useMemo(() => {
    if (!userData) return null;
    
    // Si l'utilisateur a un rôle ADMIN dans la base de données mais pas dans le state local
    if (userData.role !== 'ADMIN' && userData.email?.endsWith('@admin.proofcert.app')) {
      return {
        ...userData,
        role: 'ADMIN' as const
      };
    }
    
    return userData;
  }, [userData]);

  // Retourner les valeurs du hook
  const isUserLoggedIn = isWalletConnected || !!userData?.id;
  
  return {
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
