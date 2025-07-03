import { EnvironmentsEnum } from '@multiversx/sdk-dapp/types/enums.types';

// Utilisons la configuration existante du projet
export const MULTIVERSX_NETWORK_CONFIG = {
  name: 'customConfig',
  apiTimeout: 6000,
  walletConnectV2ProjectId: '9b1a9564f91cb659ffe21b73d5c4e2d8',
};

export const MULTIVERSX_DAPP_CONFIG = {
  shouldUseWebViewProvider: false, // Désactiver pour éviter les erreurs de handshake
  logoutRoute: '/',
  // Configuration pour éviter les erreurs de session WalletConnect
  walletConnectV2RelayAddresses: ['wss://relay.walletconnect.org'],
  walletConnectV2ProjectId: '9b1a9564f91cb659ffe21b73d5c4e2d8',
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
