import { logout as sdkLogout } from '@multiversx/sdk-dapp/utils';
import { MULTIVERSX_ENDPOINTS, MULTIVERSX_ENVIRONMENT } from '../config';

export const logout = async (callbackUrl: string = '/') => {
  return sdkLogout(callbackUrl);
};

export const clearWalletConnectSessions = () => {
  // Nettoyer les sessions WalletConnect corrompues
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('walletconnect') || key.includes('wc@2')) {
        localStorage.removeItem(key);
      }
    });
    
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      if (key.includes('walletconnect') || key.includes('wc@2')) {
        sessionStorage.removeItem(key);
      }
    });
    
    console.log('WalletConnect sessions cleared');
  } catch (error) {
    console.error('Error clearing WalletConnect sessions:', error);
  }
};

// Reset complet WalletConnect + reload (utile pour corriger les sessions bloquées)
export const forceResetWalletConnection = () => {
  try {
    clearWalletConnectSessions();
    window.location.reload();
  } catch (error) {
    console.error('Error during force reset:', error);
  }
};

export const getApiEndpoint = () => {
  return MULTIVERSX_ENDPOINTS[MULTIVERSX_ENVIRONMENT];
};

export const formatAddress = (address: string, length: number = 6): string => {
  if (!address) return '';
  if (address.length <= length * 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

export const formatBalance = (balance: string, decimals: number = 18): string => {
  const balanceNumber = parseFloat(balance) / Math.pow(10, decimals);
  return balanceNumber.toFixed(4);
};

export const isValidAddress = (address: string): boolean => {
  return /^erd1[a-z0-9]{58}$/.test(address);
};
