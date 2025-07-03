// Fonctions utilitaires pour simuler les fonctions MultiversX

// Fonction de déconnexion
export const logout = () => {
  localStorage.removeItem('multiversx_address');
  localStorage.removeItem('multiversx_provider');
  window.location.reload();
};

// Constants
export const ACCOUNTS_ENDPOINT = '/accounts';

// Environment types
export const EnvironmentsEnum = {
  devnet: 'devnet',
  testnet: 'testnet',
  mainnet: 'mainnet'
} as const;
