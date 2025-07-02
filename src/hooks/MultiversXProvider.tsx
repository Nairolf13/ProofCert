import React, { createContext, useReducer, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { MultiversXAccount, MultiversXTransaction } from '../config/multiversx';

// Types pour le wallet provider (définis localement pour éviter les conflits d'import)
interface WalletProvider {
  id: string;
  name: string;
  icon?: string;
  connect: () => Promise<MultiversXAccount>;
  disconnect: () => Promise<void>;
  isConnected: () => boolean;
  signTransaction: (transaction: MultiversXTransaction) => Promise<MultiversXTransaction>;
}

// Type pour les providers disponibles
type ProvidersMap = {
  'web-wallet': WalletProvider;
  'extension': WalletProvider;
};

// Types pour le contexte MultiversX
interface MultiversXState {
  isConnected: boolean;
  account: MultiversXAccount | null;
  provider: WalletProvider | null;
  isLoading: boolean;
  error: string | null;
}

interface MultiversXContextType extends MultiversXState {
  connect: (providerId: keyof ProvidersMap) => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (transaction: MultiversXTransaction) => Promise<MultiversXTransaction>;
}

// État initial
const initialState: MultiversXState = {
  isConnected: false,
  account: null,
  provider: null,
  isLoading: false,
  error: null,
};

// Actions pour le reducer
type MultiversXAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ACCOUNT'; payload: MultiversXAccount | null }
  | { type: 'SET_PROVIDER'; payload: WalletProvider | null }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'RESET' };

// Reducer
const multiversXReducer = (state: MultiversXState, action: MultiversXAction): MultiversXState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_ACCOUNT':
      return { ...state, account: action.payload };
    case 'SET_PROVIDER':
      return { ...state, provider: action.payload };
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
};

// Contexte
const MultiversXContext = createContext<MultiversXContextType | undefined>(undefined);

// Provider Props
interface MultiversXProviderProps {
  children: ReactNode;
}

// Mock des providers de wallet pour l'instant
const mockWebWalletProvider: WalletProvider = {
  id: 'web-wallet',
  name: 'MultiversX Web Wallet',
  connect: async () => {
    // Simulation d'une connexion
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      address: 'erd1...' + Math.random().toString(36).substring(7),
      balance: '1000000000000000000', // 1 EGLD
      nonce: 0
    };
  },
  disconnect: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
  },
  isConnected: () => false,
  signTransaction: async (transaction) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { ...transaction, signature: 'mock_signature' };
  }
};

const mockExtensionProvider: WalletProvider = {
  id: 'extension',
  name: 'MultiversX DeFi Wallet',
  connect: async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      address: 'erd1...' + Math.random().toString(36).substring(7),
      balance: '2000000000000000000', // 2 EGLD
      nonce: 0
    };
  },
  disconnect: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
  },
  isConnected: () => false,
  signTransaction: async (transaction) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { ...transaction, signature: 'mock_signature_extension' };
  }
};

// Provider Component
const MultiversXProvider: React.FC<MultiversXProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(multiversXReducer, initialState);

  // Providers disponibles (mock pour l'instant) - mémorisés pour éviter les recréations
  const providers = useMemo<ProvidersMap>(() => ({
    'web-wallet': mockWebWalletProvider,
    'extension': mockExtensionProvider,
  }), []);

  // Fonction de connexion
  const connect = async (providerId: keyof ProvidersMap) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const provider = providers[providerId];
      if (!provider) {
        throw new Error(`Provider ${providerId} not found`);
      }

      const account = await provider.connect();
      
      dispatch({ type: 'SET_PROVIDER', payload: provider });
      dispatch({ type: 'SET_ACCOUNT', payload: account });
      dispatch({ type: 'SET_CONNECTED', payload: true });

      // Sauvegarder l'état dans le localStorage
      localStorage.setItem('multiversx_provider', providerId);
      localStorage.setItem('multiversx_account', JSON.stringify(account));

    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Connection failed' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Fonction de déconnexion
  const disconnect = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (state.provider) {
        await state.provider.disconnect();
      }

      // Nettoyer le localStorage
      localStorage.removeItem('multiversx_provider');
      localStorage.removeItem('multiversx_account');

      dispatch({ type: 'RESET' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Disconnection failed' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Fonction de signature de transaction
  const signTransaction = async (transaction: MultiversXTransaction) => {
    if (!state.provider) {
      throw new Error('No provider connected');
    }
    return await state.provider.signTransaction(transaction);
  };

  // Restaurer la session au chargement
  useEffect(() => {
    const restoreSession = async () => {
      const savedProviderId = localStorage.getItem('multiversx_provider');
      const savedAccount = localStorage.getItem('multiversx_account');

      if (savedProviderId && savedAccount) {
        try {
          const provider = providers[savedProviderId as keyof ProvidersMap];
          const account = JSON.parse(savedAccount);

          if (provider && provider.isConnected()) {
            dispatch({ type: 'SET_PROVIDER', payload: provider });
            dispatch({ type: 'SET_ACCOUNT', payload: account });
            dispatch({ type: 'SET_CONNECTED', payload: true });
          }
        } catch (error) {
          console.warn('Failed to restore MultiversX session:', error);
          localStorage.removeItem('multiversx_provider');
          localStorage.removeItem('multiversx_account');
        }
      }
    };

    restoreSession();
  }, [providers]);

  const value: MultiversXContextType = {
    ...state,
    connect,
    disconnect,
    signTransaction,
  };

  return (
    <MultiversXContext.Provider value={value}>
      {children}
    </MultiversXContext.Provider>
  );
};

// Export du contexte et du provider
export { MultiversXContext };
export default MultiversXProvider;
