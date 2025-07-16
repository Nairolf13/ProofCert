import React, { createContext, useReducer, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { MultiversXAccount, MultiversXTransaction } from '../config/multiversx';
import { createRealWalletProviders, type RealWalletProvider, type RealProvidersMap } from '../config/realWalletProviders';

// Types pour le contexte MultiversX
interface MultiversXState {
  isConnected: boolean;
  account: MultiversXAccount | null;
  provider: RealWalletProvider | null;
  isLoading: boolean;
  error: string | null;
}

interface MultiversXContextType extends MultiversXState {
  connect: (providerId: keyof RealProvidersMap) => Promise<void>;
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
  | { type: 'SET_PROVIDER'; payload: RealWalletProvider | null }
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

// Provider Component
const MultiversXProvider: React.FC<MultiversXProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(multiversXReducer, initialState);

  // Effet pour lier le wallet à l'utilisateur classique dès qu'un compte wallet est détecté
  React.useEffect(() => {
    const tryLinkWalletToClassicUser = async () => {
      const userStr = localStorage.getItem('user');
      const multiversxAccountStr = localStorage.getItem('multiversx_account');
      const token = localStorage.getItem('authToken') || localStorage.getItem('token') || undefined;
      if (!userStr || !multiversxAccountStr || !token) return;
      const user = JSON.parse(userStr);
      const multiversxAccount = JSON.parse(multiversxAccountStr);
      const walletAddress = multiversxAccount.address;
      if (!walletAddress) return;
      if (!user.walletAddress) {
        try {
          const { user: updatedUser } = await (await import('../api/user')).userApi.connectWallet(walletAddress, token);
          // Merge les champs manquants pour compatibilité MultiversXUser
          const mergedUser = {
            ...user,
            ...updatedUser,
            balance: user.balance ?? '0',
            nonce: user.nonce ?? 0,
            shard: user.shard ?? 0,
          };
          localStorage.setItem('user', JSON.stringify(mergedUser));
          console.log('[MultiversXProvider] Wallet lié à l’utilisateur classique:', mergedUser);
        } catch (err) {
          console.error('[MultiversXProvider] Erreur lors de la liaison du wallet:', err);
        }
      }
    };
    tryLinkWalletToClassicUser();
  }, [state.account]);

  // Vrais providers MultiversX - mémorisés pour éviter les recréations
  const providers = useMemo<RealProvidersMap>(() => {
    return createRealWalletProviders() as RealProvidersMap;
  }, []);

  // Fonction de connexion
  const connect = async (providerId: keyof RealProvidersMap) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const provider = providers[providerId];
      if (!provider) {
        throw new Error(`Provider ${providerId} not found`);
      }

      console.log(`Attempting to connect with ${provider.name}...`);
      const account = await provider.connect();
      console.log('Connected successfully:', account);
      
      dispatch({ type: 'SET_PROVIDER', payload: provider });
      dispatch({ type: 'SET_ACCOUNT', payload: account });
      dispatch({ type: 'SET_CONNECTED', payload: true });

      // Sauvegarder l'état dans le localStorage
      localStorage.setItem('multiversx_provider', providerId);
      localStorage.setItem('multiversx_account', JSON.stringify(account));

    } catch (error) {
      console.error('Connection error:', error);
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
          const provider = providers[savedProviderId as keyof RealProvidersMap];
          const account = JSON.parse(savedAccount);

          if (provider && provider.isConnected()) {
            console.log('Restoring session for:', provider.name);
            dispatch({ type: 'SET_PROVIDER', payload: provider });
            dispatch({ type: 'SET_ACCOUNT', payload: account });
            dispatch({ type: 'SET_CONNECTED', payload: true });
          } else {
            // Si le provider n'est plus connecté, nettoyer le cache
            console.log('Provider no longer connected, clearing cache');
            localStorage.removeItem('multiversx_provider');
            localStorage.removeItem('multiversx_account');
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
