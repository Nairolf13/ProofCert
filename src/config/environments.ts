import { EnvironmentsEnum } from '@multiversx/sdk-dapp/types';

// Configuration pour les différents environnements MultiversX
export const config = {
  [EnvironmentsEnum.devnet]: {
    id: 'devnet',
    name: 'Devnet',
    egldLabel: 'xEGLD',
    walletAddress: 'https://devnet-wallet.multiversx.com',
    apiAddress: 'https://devnet-api.multiversx.com',
    explorerAddress: 'https://devnet-explorer.multiversx.com',
    chainId: 'D',
    gasPerDataByte: 1500,
    walletConnectDeepLink: 'https://maiar.page.link/?apn=com.elrond.maiar.wallet&isi=1519405832&ibi=com.elrond.maiar.wallet&link=https://maiar.com/',
    walletConnectBridgeAddresses: ['https://bridge.walletconnect.org']
  },
  [EnvironmentsEnum.testnet]: {
    id: 'testnet',
    name: 'Testnet',
    egldLabel: 'xEGLD',
    walletAddress: 'https://testnet-wallet.multiversx.com',
    apiAddress: 'https://testnet-api.multiversx.com',
    explorerAddress: 'https://testnet-explorer.multiversx.com',
    chainId: 'T',
    gasPerDataByte: 1500,
    walletConnectDeepLink: 'https://maiar.page.link/?apn=com.elrond.maiar.wallet&isi=1519405832&ibi=com.elrond.maiar.wallet&link=https://maiar.com/',
    walletConnectBridgeAddresses: ['https://bridge.walletconnect.org']
  },
  [EnvironmentsEnum.mainnet]: {
    id: 'mainnet',
    name: 'Mainnet',
    egldLabel: 'EGLD',
    walletAddress: 'https://wallet.multiversx.com',
    apiAddress: 'https://api.multiversx.com',
    explorerAddress: 'https://explorer.multiversx.com',
    chainId: '1',
    gasPerDataByte: 1500,
    walletConnectDeepLink: 'https://maiar.page.link/?apn=com.elrond.maiar.wallet&isi=1519405832&ibi=com.elrond.maiar.wallet&link=https://maiar.com/',
    walletConnectBridgeAddresses: ['https://bridge.walletconnect.org']
  }
};

// Environment par défaut - changez selon vos besoins
export const environment = process.env.NODE_ENV === 'production' 
  ? EnvironmentsEnum.mainnet 
  : EnvironmentsEnum.devnet;

export const currentConfig = config[environment];

// Configuration spécifique à l'application
export const appConfig = {
  // WalletConnect Project ID - obtenez le vôtre sur https://cloud.walletconnect.com/
  walletConnectV2ProjectId: '9b1a9564f91cb659ffe21b73d5c4e2d8',
  // Active l'authentification native
  nativeAuth: true,
  // Timeout pour les appels API (ms)
  apiTimeout: 6000,
  // Taille des transactions
  transactionSize: 10
};

// Domaines autorisés pour l'authentification
export const sampleAuthenticatedDomains = ['localhost', '127.0.0.1'];
