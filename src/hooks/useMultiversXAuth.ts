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
  address: string;
  balance: string;
  nonce: number;
  username: string | null;
  shard: number;
  walletAddress: string;
  role: string;
  email?: string;
  phone?: string;
  name?: string;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any; // Pour les propriétés supplémentaires
}

// Vérifier si l'utilisateur est authentifié via l'API classique
const getClassicAuthUser = (): MultiversXUser | null => {
  if (typeof window === 'undefined') return null;
  
  const userData = localStorage.getItem('user');
  if (!userData) return null;
  
  try {
    const user = JSON.parse(userData);
    return {
      id: user.id || 'unknown',
      role: user.role || 'USER',
      address: user.walletAddress || '',
      balance: '0',
      nonce: 0,
      username: user.username || null,
      shard: 0,
      walletAddress: user.walletAddress || '',
      email: user.email,
      phone: user.phone,
      name: user.name,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
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
    
    // Extraire les données utilisateur de la réponse
    // Les données sont dans data.data selon la structure de la réponse
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
      role: user?.role || data?.role || userData?.role || 'USER',
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
    
  } catch (error: any) {
    // Gestion spécifique du cas 404 (utilisateur non trouvé)
    if (error.response?.status === 404) {
      console.log(`ℹ️ Aucun utilisateur trouvé pour le wallet: ${walletAddress}`);
      return null;
    }
    
    // Gestion des autres erreurs
    console.error('❌ Erreur lors de la vérification de l\'utilisateur:', error);
    
    if (error.response) {
      console.error('📡 Détails de l\'erreur:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
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
  const [userData, setUserData] = useState<MultiversXUser | null>(() => {
    return getClassicAuthUser();
  });

  // Fonction pour charger les données utilisateur
  const loadUserData = useCallback(async (walletAddress: string) => {
    if (!walletAddress) {
      console.log('❌ Aucune adresse wallet fournie pour le chargement des données');
      return;
    }
    
    console.log('🔑 Adresse wallet à vérifier:', walletAddress);
    
    console.log(`🔄 Début du chargement des données pour le wallet: ${walletAddress}`);
    setIsLoading(true);
    
    try {
      // Essayer de récupérer l'utilisateur depuis l'API
      console.log('🔄 Tentative de récupération des données utilisateur depuis l\'API...');
      let userData = await fetchUserByWallet(walletAddress);
      console.log('📥 Données retournées par fetchUserByWallet:', userData);
      
      // Si pas d'utilisateur trouvé, créer un profil par défaut
      if (!userData) {
        console.log('ℹ️ Aucun utilisateur trouvé pour cette adresse, création d\'un profil par défaut');
        userData = {
          id: walletAddress,
          role: 'USER',
          address: walletAddress,
          balance: '0',
          nonce: 0,
          username: `user_${walletAddress.slice(0, 8)}`,
          shard: 0,
          walletAddress: walletAddress,
          email: `${walletAddress.slice(0, 8)}@wallet`,
          name: `User ${walletAddress.slice(0, 6)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        console.log('👤 Création d\'un profil par défaut pour le wallet');
      } else {
        console.log('✅ Données utilisateur récupérées avec succès');
      }
      
      console.log('📊 Données utilisateur à enregistrer:', userData);
      
      // Mettre à jour les données utilisateur
      setUserData(userData);
      
      // Sauvegarder dans le localStorage pour une utilisation ultérieure
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Si l'utilisateur n'a pas d'email, essayer de le récupérer depuis le token
      if ((!userData.email || !userData.name) && localStorage.getItem('token')) {
        console.log('🔍 Tentative de récupération des informations depuis le token...');
        try {
          console.log('🔑 Token trouvé, appel de /auth/me');
          const response = await api.get('/auth/me');
          const currentUser = response.data;
          
          console.log('👤 Données utilisateur depuis /auth/me:', currentUser);
          
          if (currentUser) {
            const updatedUser = { 
              ...userData, 
              email: currentUser.email || userData.email,
              name: currentUser.name || currentUser.username || userData.name,
              username: currentUser.username || userData.username,
              phone: currentUser.phone || userData.phone
            };
            
            console.log('🔄 Mise à jour des données utilisateur avec les infos du token');
            console.log('📝 Avant mise à jour:', userData);
            console.log('📝 Après mise à jour:', updatedUser);
            
            setUserData(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            console.log('💾 Données utilisateur mises à jour dans le state et le localStorage');
          } else {
            console.log('ℹ️ Aucune donnée utilisateur trouvée dans la réponse de /auth/me');
          }
        } catch (error: any) {
          console.error('❌ Erreur lors de la récupération des données depuis /auth/me:', error);
          if (error.response) {
            console.error('📡 Détails de l\'erreur:', {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data
            });
          }
        }
      } else if (!localStorage.getItem('token')) {
        console.log('ℹ️ Aucun token trouvé, impossible de récupérer des informations supplémentaires');
      }
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des données utilisateur:', error);
      if (error.response) {
        console.error('📡 Détails de l\'erreur:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
    } finally {
      console.log('🏁 Fin du chargement des données utilisateur');
      setIsLoading(false);
    }
  }, []);

  // Effet pour charger les données utilisateur au montage
  useEffect(() => {
    console.log('🔄 Vérification de la connexion du wallet...', { isWalletConnected, address });
    if (isWalletConnected && address) {
      console.log('🔑 Wallet connecté, chargement des données utilisateur...');
      
      // Sauvegarder l'utilisateur actuel s'il existe
      const currentUser = localStorage.getItem('user');
      const currentUserData = currentUser ? JSON.parse(currentUser) : null;
      
      // Sauvegarder les favoris actuels avant de charger de nouvelles données
      const currentFavorites = localStorage.getItem('favorites');
      if (currentFavorites) {
        console.log('💾 Favoris sauvegardés avant chargement:', JSON.parse(currentFavorites));
        localStorage.setItem('favorites_backup', currentFavorites);
      }
      
      loadUserData(address).then((userData) => {
        // Si l'utilisateur avait un rôle admin précédemment, le conserver
        if (currentUserData?.role === 'ADMIN' && userData) {
          console.log('🔑 Conservation du rôle administrateur');
          userData.role = 'ADMIN';
          setUserData(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        // Restaurer les favoris après le chargement si nécessaire
        const backupFavorites = localStorage.getItem('favorites_backup');
        if (backupFavorites) {
          console.log('🔄 Restauration des favoris après connexion...');
          localStorage.setItem('favorites', backupFavorites);
          localStorage.removeItem('favorites_backup');
        }
      });
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
      
      // Nettoyer le stockage local
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
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
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let isFirstRender = true;
    
    const syncAuthState = async () => {
      if (isWalletConnected && address) {
        try {
          // Charger les données utilisateur depuis l'API
          await loadUserData(address);
          
          // Mettre à jour le localStorage
          if (localStorage.getItem('multiversx_address') !== address) {
            localStorage.setItem('multiversx_address', address);
            localStorage.setItem('multiversx_logged_in', 'true');
          }
        } catch (error) {
          console.error('Error syncing auth state:', error);
        }
      } else if (!isWalletConnected && !isFirstRender) {
        // Si déconnecté du wallet, revenir à l'authentification classique si disponible
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
      
      isFirstRender = false;
    };
    
    const rafId = requestAnimationFrame(syncAuthState);
    
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [isWalletConnected, address, loadUserData, account?.balance, account?.nonce, account?.username, account?.shard]);

  // L'utilisateur est considéré comme connecté s'il est connecté via wallet ou via l'authentification classique
  const isLoggedIn = isWalletConnected || !!userData?.id;

  return {
    // Authentification state
    isLoggedIn,
    isLoading,
    
    // Account info
    account: userData || account,
    address: userData?.walletAddress || address,
    
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
    user: userData || (isWalletConnected && account ? {
      id: undefined,
      role: undefined,
      address,
      balance: account.balance?.toString() || '0',
      nonce: account.nonce || 0,
      username: account.username || null,
      shard: account.shard || 0,
      walletAddress: address
    } : null)
  };
};
