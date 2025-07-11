// Configuration pour MultiversX DApp
export const dAppConfig = {
  chainId: 'D', // Devnet
  environment: 'devnet' as const,
  walletConnectV2ProjectId: '9b1a9564f91cb659ffe21b73d5c4e2d8', // Même Project ID que dans la config MultiversX
  apiUrl: 'https://devnet-api.multiversx.com',
  explorerUrl: 'https://devnet-explorer.multiversx.com',
  walletAddress: 'https://devnet-wallet.multiversx.com',
  walletConnectDeepLink: 'https://xportal.com',
  walletConnectV2RelayUrl: 'wss://relay.walletconnect.com'
};

// Configuration des providers réels
export const walletProviders = {
  'extension': {
    id: 'extension',
    name: 'MultiversX DeFi Wallet',
    description: 'Extension de navigateur (recommandée pour desktop)',
    icon: '🔌',
    color: 'from-purple-500 to-pink-600',
    availability: 'Desktop',
    isAvailable: () => {
      return typeof window !== 'undefined' && window.elrondWallet;
    }
  },
  'walletconnect': {
    id: 'walletconnect',
    name: 'xPortal (WalletConnect)',
    description: 'Scannez le QR code avec votre app xPortal',
    icon: '📱',
    color: 'from-blue-500 to-cyan-600',
    availability: 'Mobile',
    isAvailable: () => true
  },
  'webwallet': {
    id: 'webwallet',
    name: 'Web Wallet',
    description: 'Wallet web officiel MultiversX',
    icon: '🌐',
    color: 'from-green-500 to-teal-600',
    availability: 'Tous appareils',
    isAvailable: () => true
  }
};

// Types pour TypeScript
export interface WalletInfo {
  address: string;
  balance: string;
  nonce: number;
}

export type WalletProviderId = keyof typeof walletProviders;
