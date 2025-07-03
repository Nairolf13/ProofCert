import { useEffect, useState } from 'react';
import {
  useGetAccountInfo,
  useGetIsLoggedIn,
  useGetLoginInfo,
  logout
} from '../lib/multiversx';

export const useMultiversXAuth = () => {
  const { account, address } = useGetAccountInfo();
  const isLoggedIn = useGetIsLoggedIn();
  const { tokenLogin } = useGetLoginInfo();
  const [isLoading, setIsLoading] = useState(false);

  // Synchroniser l'état d'authentification avec le localStorage
  useEffect(() => {
    // Éviter les conflits d'état en vérifiant la cohérence
    const storedLoggedIn = localStorage.getItem('multiversx_logged_in') === 'true';
    
    if (isLoggedIn && address) {
      // Utilisateur connecté - mettre à jour le localStorage
      localStorage.setItem('multiversx_address', address);
      localStorage.setItem('multiversx_logged_in', 'true');
    } else if (!isLoggedIn && storedLoggedIn) {
      // Incohérence détectée - nettoyer le localStorage
      console.log('Cleaning inconsistent localStorage state');
      localStorage.removeItem('multiversx_address');
      localStorage.removeItem('multiversx_logged_in');
      localStorage.removeItem('multiversx_provider');
    } else if (!isLoggedIn) {
      // Utilisateur déconnecté - s'assurer que le localStorage est propre
      localStorage.removeItem('multiversx_address');
      localStorage.removeItem('multiversx_logged_in');
    }
  }, [isLoggedIn, address]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Clear localStorage
      localStorage.removeItem('multiversx_address');
      localStorage.removeItem('multiversx_logged_in');
      localStorage.removeItem('multiversx_provider');
      
      // Use SDK logout function
      await logout('/', undefined, false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Authentification state
    isLoggedIn,
    isLoading,
    
    // Account info
    account,
    address,
    
    // Login info (includes native auth token)
    tokenLogin,
    nativeAuthToken: tokenLogin?.nativeAuthToken,
    
    // Actions
    logout: handleLogout,
    
    // Computed values
    walletAddress: address,
    user: isLoggedIn && account ? {
      address,
      balance: account.balance || '0',
      nonce: account.nonce || 0,
      username: account.username || null,
      shard: account.shard || 0,
      walletAddress: address
    } : null
  };
};
