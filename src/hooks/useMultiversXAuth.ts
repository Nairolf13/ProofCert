import { useEffect, useState } from 'react';
import {
  useGetAccountInfo,
  useGetIsLoggedIn,
  useGetLoginInfo,
  logout
} from '../lib/multiversx';

interface MultiversXUser {
  address: string;
  balance: string;
  nonce: number;
  username: string | null;
  shard: number;
  walletAddress: string;
  id?: string; // Ajout de l'ID pour l'authentification classique
  role?: string; // Ajout du rôle pour l'authentification classique
}

// Vérifier si l'utilisateur est authentifié via l'API classique
const getClassicAuthUser = (): MultiversXUser | null => {
  if (typeof window === 'undefined') return null;
  
  const userData = localStorage.getItem('user');
  if (!userData) return null;
  
  try {
    const user = JSON.parse(userData);
    return {
      id: user.id,
      role: user.role,
      address: user.walletAddress || '',
      balance: '0',
      nonce: 0,
      username: user.username || null,
      shard: 0,
      walletAddress: user.walletAddress || ''
    } as MultiversXUser;
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
    return getClassicAuthUser();
  });

  // Synchroniser l'état d'authentification avec le localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let isFirstRender = true;
    
    const syncAuthState = () => {
      if (isWalletConnected && address) {
        // Mettre à jour les données utilisateur pour le wallet connecté
        setUserData(prevUser => ({
          address,
          balance: account?.balance?.toString() || '0',
          nonce: account?.nonce || 0,
          username: account?.username || null,
          shard: account?.shard || 0,
          walletAddress: address,
          // Conserver l'ID et le rôle de l'authentification classique si disponible
          id: prevUser?.id,
          role: prevUser?.role
        }));
        
        // Mettre à jour le localStorage
        if (localStorage.getItem('multiversx_address') !== address) {
          localStorage.setItem('multiversx_address', address);
          localStorage.setItem('multiversx_logged_in', 'true');
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
  }, [isWalletConnected, address, account?.balance, account?.nonce, account?.username, account?.shard]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Clear localStorage
      localStorage.removeItem('multiversx_address');
      localStorage.removeItem('multiversx_logged_in');
      localStorage.removeItem('multiversx_provider');
      
      // Use SDK logout function
      await logout('/', undefined, false);
      
      // Réinitialiser les données utilisateur
      setUserData(getClassicAuthUser());
    } catch (error) {
      console.error('Logout error:', error);
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
