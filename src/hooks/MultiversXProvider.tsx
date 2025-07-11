import React, { createContext, useReducer, useEffect, useMemo, useContext } from 'react';
import { AuthContext } from './AuthContext';
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

  // Vrais providers MultiversX - mémorisés pour éviter les recréations
  const providers = useMemo<RealProvidersMap>(() => {
    return createRealWalletProviders() as RealProvidersMap;
  }, []);

  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('MultiversXProvider must be used within an AuthProvider');
  }
  const { connectWallet, disconnect: disconnectAuth } = authContext;

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
      
      // Connecter l'utilisateur via AuthContext
      await connectWallet(account);
      
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
      localStorage.removeItem('user'); // Supprimer les informations utilisateur

      // Réinitialiser l'état
      dispatch({ type: 'RESET' });
      
      // Déconnecter l'utilisateur via AuthContext
      if (disconnectAuth) {
        await disconnectAuth();
      }
    } catch (error) {
      console.error('Error during disconnection:', error);
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
      try {
        const savedProviderId = localStorage.getItem('multiversx_provider');
        const savedAccount = localStorage.getItem('multiversx_account');
        const savedUser = localStorage.getItem('user');

        if (!savedProviderId || !savedAccount || !savedUser) {
          // Si des données manquent, nettoyer tout pour éviter des états incohérents
          if (savedProviderId || savedAccount) {
            console.log('Cleaning up incomplete connection data');
            localStorage.removeItem('multiversx_provider');
            localStorage.removeItem('multiversx_account');
          }
          return;
        }

        try {
          // Vérifier que le provider existe
          const provider = providers[savedProviderId as keyof RealProvidersMap];
          if (!provider) {
            throw new Error(`Provider ${savedProviderId} not found`);
          }

          // Parser l'account
          let account: MultiversXAccount;
          try {
            account = JSON.parse(savedAccount);
            if (!account || typeof account !== 'object' || !account.address) {
              throw new Error('Invalid account data');
            }
          } catch {
            throw new Error('Failed to parse account data');
          }

          // Vérifier si le provider est toujours connecté
          const isConnected = await Promise.resolve(provider.isConnected?.() ?? false);
          
          if (isConnected) {
            console.log('Restoring session for provider:', provider.name);
            
            try {
              // Restaurer l'utilisateur via AuthContext
              if (connectWallet) {
                await connectWallet(account);
              }
              
              dispatch({ type: 'SET_PROVIDER', payload: provider });
              dispatch({ type: 'SET_ACCOUNT', payload: account });
              dispatch({ type: 'SET_CONNECTED', payload: true });
              return; // Succès
            } catch (walletError) {
              console.error('Failed to restore wallet connection:', walletError);
              // Continuer pour nettoyer les données invalides
            }
          }
          
          // Si on arrive ici, soit le provider n'est pas connecté, soit la connexion a échoué
          console.log('Provider connection lost or invalid, clearing cache');
          
        } catch (error) {
          console.warn('Error during session restoration:', error);
        }
        
        // Nettoyer les données en cas d'erreur ou de déconnexion
        localStorage.removeItem('multiversx_provider');
        localStorage.removeItem('multiversx_account');
        localStorage.removeItem('user');
        dispatch({ type: 'RESET' });
        
      } catch (error) {
        console.error('Unexpected error in restoreSession:', error);
        // En cas d'erreur inattendue, nettoyer tout pour éviter des états corrompus
        localStorage.removeItem('multiversx_provider');
        localStorage.removeItem('multiversx_account');
        localStorage.removeItem('user');
        dispatch({ type: 'RESET' });
      }
    };

    // Gérer les erreurs non capturées dans la promesse
    restoreSession().catch(error => {
      console.error('Unhandled error in restoreSession:', error);
    });
  }, [providers, connectWallet]);

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
