import { createContext } from 'react';
import type { WalletInfo, WalletProviderId } from '../config/dappConfig';

// Interface pour notre contexte personnalisé
export interface MultiversXDappContextType {
  isConnected: boolean;
  account: WalletInfo | null;
  isLoading: boolean;
  error: string | null;
  connectWallet: (providerId: WalletProviderId) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  clearError: () => void;
}

// Contexte
export const MultiversXDappContext = createContext<MultiversXDappContextType | undefined>(undefined);
