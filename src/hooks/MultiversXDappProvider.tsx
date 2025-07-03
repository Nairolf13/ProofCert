import React, { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
// Import des composants réalistes au lieu des mocks du vrai SDK
import { 
  useGetIsLoggedIn, 
  useGetAccountInfo, 
  logout as sdkLogout
} from '../lib/sdkDapp';
import { type WalletInfo, type WalletProviderId } from '../config/dappConfig';
import { MultiversXDappContext, type MultiversXDappContextType } from './MultiversXDappContext';

// Interface pour notre contexte personnalisé

// Provider principal - version simplifiée pour la démo
interface MultiversXDappProviderProps {
  children: ReactNode;
}

export const MultiversXDappProvider: React.FC<MultiversXDappProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  
  // Utiliser les hooks SDK officiels
  const isLoggedIn = useGetIsLoggedIn();
  const accountInfo = useGetAccountInfo();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convertir l'account SDK vers notre interface WalletInfo
  const walletInfo: WalletInfo | null = accountInfo.account.address ? {
    address: accountInfo.account.address,
    balance: accountInfo.account.balance || '0',
    nonce: accountInfo.account.nonce || 0,
  } : null;

  const connectWallet = async (providerId: WalletProviderId) => {
    setIsLoading(true);
    setError(null);

    try {
      // Pour l'instant, utiliser les redirections vers les pages d'unlock
      // En production, ceci utiliserait directement les méthodes SDK
      switch (providerId) {
        case 'extension':
          navigate('/unlock/extension');
          break;
        case 'walletconnect':
          navigate('/unlock/walletconnect');
          break;
        case 'webwallet':
          navigate('/unlock/web');
          break;
        default:
          throw new Error(`Provider ${providerId} non supporté`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(errorMessage);
      console.error('Wallet connection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    setIsLoading(true);
    try {
      await sdkLogout();
      setError(null);
      navigate('/');
      console.log('Déconnexion réussie');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de déconnexion';
      setError(errorMessage);
      console.error('Wallet disconnection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const contextValue: MultiversXDappContextType = {
    isConnected: isLoggedIn,
    account: walletInfo,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    clearError,
  };

  return (
    <MultiversXDappContext.Provider value={contextValue}>
      {children}
    </MultiversXDappContext.Provider>
  );
};
