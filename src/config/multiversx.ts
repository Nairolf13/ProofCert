// Configuration MultiversX pour ProofEstate
export const MULTIVERSX_CONFIG = {
  // Réseau de développement (Devnet)
  chainId: 'D',
  network: 'devnet',
  apiUrl: 'https://devnet-api.multiversx.com',
  explorerUrl: 'https://devnet-explorer.multiversx.com',
  walletConnectV2ProjectId: '', // À remplir avec votre projet ID
  
  // Configuration des providers de wallet
  walletProviders: {
    webWallet: 'https://devnet-wallet.multiversx.com',
    extensionWallet: 'MultiversX DeFi Wallet',
    hardwareWallet: 'Ledger',
    walletConnect: 'WalletConnect',
  },
  
  // Configuration des smart contracts (à définir plus tard)
  contracts: {
    proofEstate: '', // Adresse du smart contract principal
  },
  
  // Configuration des tokens
  tokens: {
    egld: {
      identifier: 'EGLD',
      decimals: 18,
      ticker: 'EGLD'
    }
  }
};

// Types pour MultiversX
export interface MultiversXAccount {
  address: string;
  balance: string;
  nonce: number;
}

export interface MultiversXTransaction {
  hash: string;
  sender: string;
  receiver: string;
  value: string;
  gasLimit: number;
  gasPrice: number;
  data?: string;
  signature?: string;
}

export interface WalletProvider {
  id: string;
  name: string;
  icon?: string;
  connect: () => Promise<MultiversXAccount>;
  disconnect: () => Promise<void>;
  isConnected: () => boolean;
  signTransaction: (transaction: MultiversXTransaction) => Promise<MultiversXTransaction>;
}
