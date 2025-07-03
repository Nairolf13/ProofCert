// Configuration des vrais providers MultiversX avec sdk-dapp
import { MULTIVERSX_CONFIG } from './multiversx';
import type { MultiversXAccount, MultiversXTransaction } from './multiversx';

// Types pour l'extension Elrond/MultiversX
interface ElrondWalletExtension {
  requestLogin: () => Promise<{ success: boolean; address?: string }>;
  logout: () => Promise<void>;
  signTransaction: (transaction: MultiversXTransaction) => Promise<{ signature: string }>;
}

declare global {
  interface Window {
    elrondWallet?: ElrondWalletExtension;
  }
}

// Interface pour nos providers customisés
export interface RealWalletProvider {
  id: string;
  name: string;
  icon?: string;
  connect: () => Promise<MultiversXAccount>;
  disconnect: () => Promise<void>;
  isConnected: () => boolean;
  signTransaction: (transaction: MultiversXTransaction) => Promise<MultiversXTransaction>;
  getProvider: () => unknown; // Le provider MultiversX natif
}

// Fonction utilitaire pour récupérer les infos de compte
const fetchAccountInfo = async (address: string): Promise<MultiversXAccount> => {
  try {
    const response = await fetch(`${MULTIVERSX_CONFIG.apiUrl}/accounts/${address}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const accountData = await response.json();
    
    return {
      address,
      balance: accountData.balance || '0',
      nonce: accountData.nonce || 0,
    };
  } catch (error) {
    console.error('Failed to fetch account info:', error);
    // Retourner des données par défaut en cas d'erreur
    return {
      address,
      balance: '0',
      nonce: 0,
    };
  }
};

// Classe pour wrapper le Web Wallet Provider
class ProofEstateWebWalletProvider implements RealWalletProvider {
  public id = 'web-wallet';
  public name = 'MultiversX Web Wallet';
  public icon = '🌐';
  private isWalletConnected = false;

  async connect(): Promise<MultiversXAccount> {
    try {
      // Pour le web wallet, nous utilisons une approche de redirection
      const callbackUrl = `${window.location.origin}/wallet-callback`;
      const webWalletUrl = `${MULTIVERSX_CONFIG.walletProviders.webWallet}/dapp/init?callbackUrl=${encodeURIComponent(callbackUrl)}`;
      
      // Simuler la connexion pour l'instant (en développement)
      if (process.env.NODE_ENV === 'development') {
        console.log('DEV MODE: Simulating web wallet connection');
        const mockAccount = await fetchAccountInfo('erd1qqqqqqqqqqqqqpgqak8zt22wl2ph4tswtyc39namqx6ysa2sd8ss4xmlj');
        this.isWalletConnected = true;
        return mockAccount;
      }
      
      // En production, rediriger vers le web wallet
      window.location.href = webWalletUrl;
      
      // Cette ligne ne sera jamais atteinte en production
      throw new Error('Redirecting to web wallet...');
    } catch (error) {
      console.error('Web Wallet connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.isWalletConnected = false;
    localStorage.removeItem('multiversx_provider');
    localStorage.removeItem('multiversx_account');
  }

  isConnected(): boolean {
    return this.isWalletConnected;
  }

  async signTransaction(transaction: MultiversXTransaction): Promise<MultiversXTransaction> {
    if (!this.isConnected()) {
      throw new Error('Wallet not connected');
    }
    
    // En mode développement, simuler la signature
    if (process.env.NODE_ENV === 'development') {
      return {
        ...transaction,
        signature: 'dev_signature_' + Date.now(),
      };
    }
    
    throw new Error('Transaction signing not implemented for web wallet');
  }

  getProvider() {
    return null; // Web wallet n'a pas de provider direct
  }
}

// Classe pour wrapper l'Extension Provider
class ProofEstateExtensionProvider implements RealWalletProvider {
  public id = 'extension';
  public name = 'MultiversX DeFi Wallet';
  public icon = '🔗';
  private isWalletConnected = false;

  async connect(): Promise<MultiversXAccount> {
    try {
      // Vérifier si l'extension est disponible
      const erdExtension = window.elrondWallet;
      
      if (!erdExtension) {
        // En mode développement, simuler la connexion
        if (process.env.NODE_ENV === 'development') {
          console.log('DEV MODE: Simulating extension wallet connection');
          const mockAccount = await fetchAccountInfo('erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu47cp');
          this.isWalletConnected = true;
          return mockAccount;
        }
        
        throw new Error('MultiversX DeFi Wallet extension not found. Please install it from the browser store.');
      }

      // Demander la connexion via l'extension
      const response = await erdExtension.requestLogin();
      
      if (!response.success || !response.address) {
        throw new Error('User rejected connection request');
      }

      const account = await fetchAccountInfo(response.address);
      this.isWalletConnected = true;
      
      return account;
    } catch (error) {
      console.error('Extension wallet connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      const erdExtension = window.elrondWallet;
      if (erdExtension) {
        await erdExtension.logout();
      }
    } catch (error) {
      console.error('Extension disconnect error:', error);
    } finally {
      this.isWalletConnected = false;
    }
  }

  isConnected(): boolean {
    return this.isWalletConnected;
  }

  async signTransaction(transaction: MultiversXTransaction): Promise<MultiversXTransaction> {
    if (!this.isConnected()) {
      throw new Error('Extension wallet not connected');
    }

    try {
      const erdExtension = window.elrondWallet;
      if (!erdExtension) {
        throw new Error('Extension not available');
      }

      const signedTx = await erdExtension.signTransaction(transaction);
      return {
        ...transaction,
        signature: signedTx.signature,
      };
    } catch (error) {
      console.error('Extension transaction signing error:', error);
      throw error;
    }
  }

  getProvider() {
    return window.elrondWallet;
  }
}

// Classe pour wrapper WalletConnect (version simplifiée)
class ProofEstateWalletConnectProvider implements RealWalletProvider {
  public id = 'wallet-connect';
  public name = 'WalletConnect';
  public icon = '📱';
  private isWalletConnected = false;

  async connect(): Promise<MultiversXAccount> {
    try {
      // En mode développement, simuler WalletConnect
      if (process.env.NODE_ENV === 'development') {
        console.log('DEV MODE: Simulating WalletConnect');
        const mockAccount = await fetchAccountInfo('erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz');
        this.isWalletConnected = true;
        return mockAccount;
      }
      
      throw new Error('WalletConnect implementation coming soon');
    } catch (error) {
      console.error('WalletConnect connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.isWalletConnected = false;
  }

  isConnected(): boolean {
    return this.isWalletConnected;
  }

  async signTransaction(transaction: MultiversXTransaction): Promise<MultiversXTransaction> {
    if (!this.isConnected()) {
      throw new Error('WalletConnect not connected');
    }
    
    // En mode développement, simuler la signature
    if (process.env.NODE_ENV === 'development') {
      return {
        ...transaction,
        signature: 'wc_signature_' + Date.now(),
      };
    }
    
    throw new Error('WalletConnect signing not implemented yet');
  }

  getProvider() {
    return null; // WalletConnect provider à implémenter
  }
}

// Factory pour créer les providers
export const createRealWalletProviders = (): Record<string, RealWalletProvider> => {
  return {
    'web-wallet': new ProofEstateWebWalletProvider(),
    'extension': new ProofEstateExtensionProvider(),
    'wallet-connect': new ProofEstateWalletConnectProvider(),
  };
};

// Types pour TypeScript
export type RealProvidersMap = {
  'web-wallet': RealWalletProvider;
  'extension': RealWalletProvider;
  'wallet-connect': RealWalletProvider;
};
