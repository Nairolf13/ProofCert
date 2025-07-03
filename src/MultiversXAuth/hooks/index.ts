import { useState, useEffect } from 'react';
import {
  useGetAccountInfo as useSDKGetAccountInfo,
  useGetIsLoggedIn as useSDKGetIsLoggedIn,
  useGetLoginInfo as useSDKGetLoginInfo
} from '@multiversx/sdk-dapp/hooks';
import { logout as sdkLogout } from '@multiversx/sdk-dapp/utils';
import type { MultiversXAccount, MultiversXLoginInfo } from '../types';

export const useGetAccountInfo = () => {
  const sdkAccount = useSDKGetAccountInfo();
  
  const account: MultiversXAccount | null = sdkAccount.account ? {
    address: sdkAccount.address,
    balance: sdkAccount.account.balance || '0',
    nonce: sdkAccount.account.nonce || 0,
    username: sdkAccount.account.username,
    shard: sdkAccount.account.shard
  } : null;

  return {
    account,
    address: sdkAccount.address
  };
};

export const useGetIsLoggedIn = (): boolean => {
  return useSDKGetIsLoggedIn();
};

export const useGetLoginInfo = (): { tokenLogin: MultiversXLoginInfo | null } => {
  const sdkLoginInfo = useSDKGetLoginInfo();
  
  const tokenLogin: MultiversXLoginInfo | null = sdkLoginInfo.tokenLogin ? {
    nativeAuthToken: sdkLoginInfo.tokenLogin.nativeAuthToken,
    signature: sdkLoginInfo.tokenLogin.signature,
    loginToken: sdkLoginInfo.tokenLogin.loginToken
  } : null;

  return { tokenLogin };
};

export const useMultiversXAuth = () => {
  const { account, address } = useGetAccountInfo();
  const isLoggedIn = useGetIsLoggedIn();
  const { tokenLogin } = useGetLoginInfo();
  const [isLoading, setIsLoading] = useState(false);

  // Synchroniser l'état d'authentification avec le localStorage
  useEffect(() => {
    if (isLoggedIn && address) {
      localStorage.setItem('multiversx_address', address);
      localStorage.setItem('multiversx_logged_in', 'true');
    } else if (!isLoggedIn) {
      localStorage.removeItem('multiversx_address');
      localStorage.removeItem('multiversx_logged_in');
      localStorage.removeItem('multiversx_provider');
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
      await sdkLogout('/');
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
