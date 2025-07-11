import { EnvironmentsEnum } from '@multiversx/sdk-dapp/types/enums.types';

// Utilisons la configuration existante du projet
export const MULTIVERSX_NETWORK_CONFIG = {
  name: 'customConfig',
  apiTimeout: 10000, // Augmenté le timeout pour les connexions lentes
  walletConnectV2ProjectId: '9b1a9564f91cb659ffe21b73d5c4e2d8', // Project ID valide pour WalletConnect v2
};

export const MULTIVERSX_DAPP_CONFIG = {
  shouldUseWebViewProvider: false, // Désactiver pour éviter les erreurs de handshake
  logoutRoute: '/',
  walletConnectV2ProjectId: '9b1a9564f91cb659ffe21b73d5c4e2d8',
  // Configuration améliorée pour WalletConnect
  walletConnectDeepLink: 'https://xportal.com',
  walletConnectV2Options: {
    // Utiliser le relai officiel de WalletConnect
    relayUrl: 'wss://relay.walletconnect.com',
    // Activer le mode pairing pour une meilleure expérience utilisateur
    shouldPairWithWalletConnect: true,
    // Désactiver le mode pairing si nécessaire
    // shouldPairWithWalletConnect: false,
  },
};

export const MULTIVERSX_ENVIRONMENT = EnvironmentsEnum.devnet; // Changez selon votre environnement

export const MULTIVERSX_ENDPOINTS = {
  [EnvironmentsEnum.devnet]: 'https://devnet-api.multiversx.com',
  [EnvironmentsEnum.testnet]: 'https://testnet-api.multiversx.com',
  [EnvironmentsEnum.mainnet]: 'https://api.multiversx.com',
};

export const MULTIVERSX_EXPLORER_URLS = {
  [EnvironmentsEnum.devnet]: 'https://devnet-explorer.multiversx.com',
  [EnvironmentsEnum.testnet]: 'https://testnet-explorer.multiversx.com',
  [EnvironmentsEnum.mainnet]: 'https://explorer.multiversx.com',
};

export const WALLET_URLS = {
  [EnvironmentsEnum.devnet]: 'https://devnet-wallet.multiversx.com',
  [EnvironmentsEnum.testnet]: 'https://testnet-wallet.multiversx.com',
  [EnvironmentsEnum.mainnet]: 'https://wallet.multiversx.com',
};

export const AUTHENTICATED_DOMAINS = [
  'api.multiversx.com',
  'devnet-api.multiversx.com',
  'testnet-api.multiversx.com',
  'localhost:3000',
  'localhost:5173',
  'localhost:5175',
];
