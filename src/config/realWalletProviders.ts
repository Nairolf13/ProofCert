// Configuration des vrais providers MultiversX avec sdk-dapp
import { MULTIVERSX_CONFIG } from './multiversx';
import type { MultiversXAccount, MultiversXTransaction } from './multiversx';
import { dAppConfig } from './dappConfig';
import { Transaction } from '@multiversx/sdk-core';

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

// Classe pour wrapper WalletConnect avec le SDK MultiversX
class ProofEstateWalletConnectProvider implements RealWalletProvider {
  public id = 'wallet-connect';
  public name = 'xPortal (WalletConnect)';
  public icon = '📱';
  private isWalletConnected = false;
  private walletConnectProvider: InstanceType<typeof import('@multiversx/sdk-wallet-connect-provider/out/walletConnectV2Provider').WalletConnectV2Provider> | null = null;
  private account: MultiversXAccount | null = null;

  private async initWalletConnect() {
    if (typeof window === 'undefined') return;

    const { WalletConnectV2Provider } = await import('@multiversx/sdk-wallet-connect-provider/out/walletConnectV2Provider');

    // Préparer les callbacks d'événements
    const eventHandlers = {
      onClientLogin: () => {
        console.log('WalletConnect login');
        this.isWalletConnected = true;
      },
      onClientLogout: () => {
        console.log('WalletConnect logout');
        this.isWalletConnected = false;
        this.account = null;
      },
      onClientEvent: (event: { name: string; data: unknown }) => {
        if (event?.name === 'loginRejected') {
          console.log('WalletConnect login rejected');
          this.isWalletConnected = false;
          this.account = null;
        }
      }
    };

    this.walletConnectProvider = new WalletConnectV2Provider(
      eventHandlers,
      dAppConfig.chainId,
      dAppConfig.walletConnect.bridge,
      dAppConfig.walletConnectV2ProjectId,
      { metadata: dAppConfig.walletConnect.getMetadata() }
    );
    return this.walletConnectProvider;
  }

  async connect(): Promise<MultiversXAccount> {
    try {
      if (!this.walletConnectProvider) {
        await this.initWalletConnect();
      }
      
      if (!this.walletConnectProvider) {
        throw new Error('Failed to initialize WalletConnect');
      }

      // Vérifier si une session existe déjà
      if (await this.walletConnectProvider.isInitialized()) {
        const address = await this.walletConnectProvider.getAddress();
        if (address) {
          this.account = await fetchAccountInfo(address);
          this.isWalletConnected = true;
          return this.account;
        }
      }

      // Si pas de session, en démarrer une nouvelle
      const { uri, approval } = await this.walletConnectProvider.connect();
      
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
      if (!address) {
        throw new Error('No address returned from WalletConnect');
      }
      
      this.account = await fetchAccountInfo(address);
      this.isWalletConnected = true;
      return this.account;
      
    } catch (error) {
      console.error('WalletConnect connection error:', error);
      this.isWalletConnected = false;
      this.account = null;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      // Nettoyer la session WalletConnect
      if (this.walletConnectProvider) {
        try {
          await this.walletConnectProvider.logout();
        } catch (error) {
          console.error('Error during WalletConnect logout:', error);
        }
      }
      
      // Nettoyer les sessions du SDK MultiversX
      const sessionKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('@elrond-multiversx-sdk-dapp:') ||
        key.startsWith('@multiversx/sdk-dapp:') ||
        key.startsWith('@walletconnect/')
      );
      
      sessionKeys.forEach(key => localStorage.removeItem(key));
      
    } catch (error) {
      console.error('Error during WalletConnect cleanup:', error);
      throw error;
    } finally {
      this.isWalletConnected = false;
      this.account = null;
      localStorage.removeItem('multiversx_walletconnect');
    }
  }

  isConnected(): boolean {
    return this.isWalletConnected && this.account !== null;
  }

  async signTransaction(transaction: MultiversXTransaction): Promise<MultiversXTransaction> {
    if (!this.isConnected() || !this.walletConnectProvider) {
      throw new Error('WalletConnect not connected');
    }
    
    try {
      // Importer les types nécessaires du SDK
      const { Transaction, Address } = await import('@multiversx/sdk-core');
      
      // Convertir les valeurs en types attendus par le SDK
      const gasLimit = BigInt(transaction.gasLimit || 50000);
      const gasPrice = BigInt(transaction.gasPrice || 1000000000);
      const value = BigInt(transaction.value || '0');
      
      // Créer une transaction avec les types corrects
      const tx = new Transaction({
        nonce: BigInt(0), // Le nonce sera mis à jour par le provider
        value: value,
        sender: new Address(transaction.sender),
        receiver: new Address(transaction.receiver),
        gasPrice: gasPrice,
        gasLimit: gasLimit,
        data: transaction.data ? Buffer.from(transaction.data) : undefined,
        chainID: 'D', // Devnet
      });
      
      // Signer la transaction via WalletConnect
      // Le SDK va gérer la signature et mettre à jour l'objet transaction
      await this.walletConnectProvider.signTransaction(tx);
      
      // Récupérer la signature et le hash de la transaction
      const typedTx = tx as unknown as Transaction;
      const signature = typedTx.getSignature().toString('hex');
      // Compute the transaction hash
      const txHash = Buffer.from(typedTx.serializeForSigning()).toString('hex');
      
      // Retourner une transaction conforme à l'interface MultiversXTransaction
      return {
        hash: txHash,
        sender: transaction.sender,
        receiver: transaction.receiver,
        value: transaction.value,
        gasLimit: Number(gasLimit),
        gasPrice: Number(gasPrice),
        data: transaction.data,
        signature: signature
      };
    } catch (error) {
      console.error('Error signing transaction with WalletConnect:', error);
      throw error;
    }
  }

  getProvider() {
    return this.walletConnectProvider;
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
