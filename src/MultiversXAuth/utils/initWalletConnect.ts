import { clearWalletConnectSessions } from './';

// Nettoyer les sessions WalletConnect au chargement de l'application
export const initWalletConnect = () => {
  // Nettoyer les sessions WalletConnect corrompues
  clearWalletConnectSessions();
  
  // Écouter les erreurs de connexion
  window.addEventListener('error', (event) => {
    const errorMessage = event.message || '';
    if (errorMessage.includes('WalletConnect') || 
        errorMessage.includes('Session not found') ||
        errorMessage.includes('Invalid session')) {
      console.warn('WalletConnect error detected, clearing sessions...');
      clearWalletConnectSessions();
    }
  });

  // Écouter les rejets de promesse non gérés
  window.addEventListener('unhandledrejection', (event) => {
    const errorMessage = event.reason?.message || '';
    if (errorMessage.includes('WalletConnect') || 
        errorMessage.includes('Session not found') ||
        errorMessage.includes('Invalid session')) {
      console.warn('Unhandled WalletConnect error, clearing sessions...');
      clearWalletConnectSessions();
    }
  });
};

export default initWalletConnect;
