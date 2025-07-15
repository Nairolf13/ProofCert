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

<<<<<<< HEAD
// Classe pour wrapper WalletConnect avec le SDK MultiversX
class ProofEstateWalletConnectProvider implements RealWalletProvider {
  public id = 'wallet-connect';
  public name = 'xPortal';
=======
// Classe pour wrapper WalletConnect
class ProofEstateWalletConnectProvider implements RealWalletProvider {
  public id = 'wallet-connect';
  public name = 'xPortal (WalletConnect)';
>>>>>>> BranchClean
  public icon = '📱';
  private isWalletConnected = false;
  private walletConnectProvider: any = null;
  private account: MultiversXAccount | null = null;

  private async initWalletConnect() {
    if (typeof window === 'undefined') return;
    
    // Importer dynamiquement le SDK WalletConnect
    const { WalletConnectV2Provider } = await import('@multiversx/sdk-wallet-connect-provider/out/walletConnectV2Provider');
    
    // Créer une nouvelle instance du provider
    this.walletConnectProvider = new WalletConnectV2Provider(
      dAppConfig.walletConnectV2ProjectId,
      dAppConfig.walletConnect.getMetadata()
    );
    
    // Configurer les écouteurs d'événements
    this.walletConnectProvider.on('loginRejected', () => {
      console.log('WalletConnect login rejected');
      this.isWalletConnected = false;
      this.account = null;
    });
    
    this.walletConnectProvider.on('logout', () => {
      console.log('WalletConnect logout');
      this.isWalletConnected = false;
      this.account = null;
    });
    
    return this.walletConnectProvider;
  }

  private async initializeWalletConnect(): Promise<boolean> {
    // Le SDK MultiversX gère déjà l'initialisation de WalletConnect
    // Cette méthode est juste un placeholder pour la compatibilité
    return true;
  }

  async connect(): Promise<MultiversXAccount> {
    try {
      if (!this.walletConnectProvider) {
        await this.initWalletConnect();
      }

      // Initialiser WalletConnect
      await this.initializeWalletConnect();
      
<<<<<<< HEAD
      // Le SDK MultiversX gère déjà la connexion via WalletConnectLoginButton
      // Ici on attend juste que l'utilisateur se connecte via le QR code
      // La connexion réelle est gérée par le SDK via le composant WalletConnectLoginButton
      
      // Simuler un délai pour la connexion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Vérifier si l'utilisateur s'est connecté
      const address = localStorage.getItem('walletconnect');
      if (!address) {
        throw new Error('Connection cancelled or failed');
      }
      
      const account = await fetchAccountInfo(address);
      this.isWalletConnected = true;
      return account;
=======
      // Vérifier si une session existe déjà
      if (this.walletConnectProvider && await this.walletConnectProvider.isInitialized()) {
        const address = await this.walletConnectProvider.getAddress();
        if (address) {
          this.account = await fetchAccountInfo(address);
          this.isWalletConnected = true;
          return this.account;
        }
      }
      
      // Si pas de session, en démarrer une nouvelle
      if (this.walletConnectProvider) {
        const callbackUrl = typeof window !== 'undefined' ? window.location.href : '';
        const { uri, approval } = await this.walletConnectProvider.connect({
          callbackUrl,
          chainId: 'D' // Devnet
        });
        
        // Afficher le QR code si sur mobile
        if (uri) {
          const qrCodeModal = (await import('@walletconnect/qrcode-modal')).default;
          qrCodeModal.open(uri, () => {
            console.log('QR Code Modal closed');
          });
        }
        
        // Attendre que l'utilisateur approuve la connexion
        await approval();
        
        // Fermer le modal QR code
        const qrCodeModal = (await import('@walletconnect/qrcode-modal')).default;
        qrCodeModal.close();
        
        // Récupérer l'adresse et les infos du compte
        const address = await this.walletConnectProvider.getAddress();
        this.account = await fetchAccountInfo(address);
        this.isWalletConnected = true;
        
        return this.account;
      }
      
      throw new Error('Failed to initialize WalletConnect');
>>>>>>> BranchClean
    } catch (error) {
      console.error('WalletConnect connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
<<<<<<< HEAD
    try {
      // Nettoyer la session WalletConnect
      const walletConnectConnector = localStorage.getItem('walletconnect');
      if (walletConnectConnector) {
        localStorage.removeItem('walletconnect');
      }
      
      // Nettoyer les sessions du SDK MultiversX
      const sessionKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('@elrond-multiversx-sdk-dapp:') ||
        key.startsWith('@multiversx/sdk-dapp:') ||
        key.startsWith('@walletconnect/')
      );
      
      sessionKeys.forEach(key => localStorage.removeItem(key));
      
      this.isWalletConnected = false;
    } catch (error) {
      console.error('Error disconnecting WalletConnect:', error);
      throw error;
    }
  }

  isConnected(): boolean {
    // Vérifier si une session WalletConnect est active
    const walletConnectSession = localStorage.getItem('walletconnect');
    return this.isWalletConnected || !!walletConnectSession;
=======
    if (this.walletConnectProvider) {
      try {
        await this.walletConnectProvider.logout();
      } catch (error) {
        console.error('Error disconnecting WalletConnect:', error);
      }
    }
    this.isWalletConnected = false;
    this.account = null;
  }

  isConnected(): boolean {
    return this.isWalletConnected && this.account !== null;
>>>>>>> BranchClean
  }

  async signTransaction(transaction: MultiversXTransaction): Promise<MultiversXTransaction> {
    if (!this.isConnected() || !this.walletConnectProvider) {
      throw new Error('WalletConnect not connected');
    }
    
    try {
      const signedTx = await this.walletConnectProvider.signTransaction(transaction);
      return signedTx;
    } catch (error) {
      console.error('Error signing transaction with WalletConnect:', error);
      throw error;
    }
<<<<<<< HEAD
    
    // En production, la signature est gérée par le SDK MultiversX
    return transaction;
  }

  getProvider() {
    // Le SDK MultiversX gère déjà le fournisseur
    return null;
=======
  }

  getProvider() {
    return this.walletConnectProvider;
>>>>>>> BranchClean
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
