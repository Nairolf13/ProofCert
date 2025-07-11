import { useEffect, useState } from 'react';
import {
  useGetAccountInfo,
  useGetIsLoggedIn,
  useGetLoginInfo,
  logout
} from '../lib/multiversx';

interface MultiversXUser {
  // Champs de base du wallet
  address: string;
  balance: string;
  nonce: number;
  shard: number;
  walletAddress: string;
  
  // Champs optionnels
  username?: string | null;
  
  // Champs de l'utilisateur classique
  id?: string;
  role?: string;
  email?: string;
  
  // Autres champs potentiels
  [key: string]: string | number | boolean | null | undefined;
}

// Vérifier si l'utilisateur est authentifié via l'API classique
const getClassicAuthUser = (): MultiversXUser | null => {
  if (typeof window === 'undefined') return null;
  
  const userData = localStorage.getItem('user');
  if (!userData) return null;
  
  try {
    const user = JSON.parse(userData);
    return {
      // Champs de base
      address: user.walletAddress || '',
      balance: '0',
      nonce: 0,
      shard: 0,
      walletAddress: user.walletAddress || '',
      
      // Champs de l'utilisateur classique
      id: user.id,
      role: user.role,
      email: user.email,
      username: user.username || null
    };
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const useMultiversXAuth = () => {
  const { account, address } = useGetAccountInfo();
  const isWalletConnected = useGetIsLoggedIn();
  const { tokenLogin } = useGetLoginInfo();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<MultiversXUser | null>(() => {
    // Au chargement initial, on essaie de récupérer l'utilisateur classique
    const classicUser = getClassicAuthUser();
    console.log('Initial user data from localStorage:', classicUser);
    return classicUser;
  });

  // Synchroniser l'état d'authentification avec le localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let isFirstRender = true;
    
    const syncAuthState = () => {
      // Toujours vérifier l'utilisateur classique en premier
      const classicUser = getClassicAuthUser();
      
      console.group('🔍 [useMultiversXAuth] Sync auth state');
      console.log('Classic user:', classicUser);
      console.log('Wallet connected:', isWalletConnected);
      console.log('Wallet address:', address);
      
      if (isWalletConnected && address) {
        console.log('Wallet connected, syncing with classic user:', {
          hasClassicUser: !!classicUser,
          classicUserId: classicUser?.id,
          classicUserRole: classicUser?.role,
          classicUserEmail: classicUser?.email,
          walletAddress: address
        });

        // Mettre à jour les données utilisateur pour le wallet connecté
        setUserData(prevUser => {
          // On fusionne toujours avec les données existantes pour préserver l'état
          const updatedUser: MultiversXUser = {
            // D'abord les données du wallet
            address,
            balance: account?.balance?.toString() || '0',
            nonce: account?.nonce || 0,
            shard: account?.shard || 0,
            walletAddress: address,
            
            // Puis les données existantes (si elles existent)
            ...(prevUser || {}),
            
            // On conserve toujours les informations de l'utilisateur classique si elles existent
            ...(classicUser ? {
              id: classicUser.id,
              role: classicUser.role,
              email: classicUser.email,
              username: classicUser.username || null // S'assurer que username est soit string soit null
            } : {})
          };
          
          console.log('Updated user data:', updatedUser);
          return updatedUser;
        });
        
        // Mettre à jour le localStorage
        if (localStorage.getItem('multiversx_address') !== address) {
          console.log('Updating wallet address in localStorage');
          localStorage.setItem('multiversx_address', address);
          localStorage.setItem('multiversx_logged_in', 'true');
        }
      } else if (!isWalletConnected && !isFirstRender) {
        // Si déconnecté du wallet, revenir à l'utilisateur classique
        if (classicUser) {
          console.log('Retour à l\'utilisateur classique:', { 
            id: classicUser.id, 
            role: classicUser.role,
            email: classicUser.email
          });
          setUserData(classicUser);
        } else {
          console.log('Aucun utilisateur classique trouvé, déconnexion complète');
          setUserData(null);
        }
        
        // Nettoyer le localStorage du wallet
        console.log('Cleaning up wallet data from localStorage');
        localStorage.removeItem('multiversx_address');
        localStorage.removeItem('multiversx_logged_in');
        localStorage.removeItem('multiversx_provider');
      }
      
      console.groupEnd();
      isFirstRender = false;
    };
    
    const rafId = requestAnimationFrame(syncAuthState);
    
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [isWalletConnected, address, account?.balance, account?.nonce, account?.username, account?.shard]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      console.log('Début de la déconnexion...');
      
      // Sauvegarder l'utilisateur classique avant la déconnexion
      const classicUser = getClassicAuthUser();
      
      // Nettoyer le localStorage du wallet
      console.log('Nettoyage du localStorage du wallet...');
      localStorage.removeItem('multiversx_address');
      localStorage.removeItem('multiversx_logged_in');
      localStorage.removeItem('multiversx_provider');
      
      // Utiliser la fonction de déconnexion du SDK
      console.log('Appel de la fonction de déconnexion du SDK...');
      await logout('/', undefined, false);
      
      // Réinitialiser les données utilisateur avec l'utilisateur classique
      console.log('Réinitialisation des données utilisateur...');
      setUserData(classicUser);
      
      console.log('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // En cas d'erreur, essayer de restaurer l'utilisateur classique
      const classicUser = getClassicAuthUser();
      if (classicUser) {
        console.log('Restauration de l\'utilisateur classique après erreur');
        setUserData(classicUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

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
    logout: handleLogout,
    
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
