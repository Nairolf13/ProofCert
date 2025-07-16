import React, { useEffect } from 'react';
import { clearWalletConnectSessions, forceResetWalletConnection } from '../utils';

interface WalletConnectErrorHandlerProps {
  children: React.ReactNode;
}

export const WalletConnectErrorHandler: React.FC<WalletConnectErrorHandlerProps> = ({ children }) => {
  useEffect(() => {
    let errorCount = 0;
    const maxErrors = 3; 
    
    // Écouter les erreurs de console
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      const errorMessage = args.join(' ');
      
      // Détecter les erreurs WalletConnect
      if (
        errorMessage.includes('Pending session not found') || 
        errorMessage.includes('Session not found') ||
        errorMessage.includes('Invalid session') ||
        errorMessage.includes('No matching key') ||
        errorMessage.includes('Pairing not found') ||
        errorMessage.includes('Topic not found')
      ) {
        errorCount++;
        console.warn(`WalletConnect error detected (${errorCount}/${maxErrors}):`, errorMessage);
        
        if (errorCount >= maxErrors) {
          console.warn('Too many WalletConnect errors, forcing reset...');
          forceResetWalletConnection();
        } else {
          clearWalletConnectSessions();
        }
      }
      
      originalError.apply(console, args);
    };

    // Écouter les erreurs non gérées
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.message || '';
      
      if (
        errorMessage.includes('Pending session not found') ||
        errorMessage.includes('Session not found') ||
        errorMessage.includes('Invalid session') ||
        errorMessage.includes('No matching key') ||
        errorMessage.includes('Pairing not found') ||
        errorMessage.includes('Topic not found')
      ) {
        errorCount++;
        console.warn(`WalletConnect promise rejection (${errorCount}/${maxErrors}):`, errorMessage);
        
        if (errorCount >= maxErrors) {
          console.warn('Too many WalletConnect errors, forcing reset...');
          forceResetWalletConnection();
        } else {
          clearWalletConnectSessions();
        }
        
        event.preventDefault(); // Empêcher l'affichage de l'erreur
      }
    };

    // Écouter les erreurs générales
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || '';
      
      if (
        errorMessage.includes('Pending session not found') ||
        errorMessage.includes('Session not found') ||
        errorMessage.includes('Invalid session')
      ) {
        errorCount++;
        console.warn(`WalletConnect window error (${errorCount}/${maxErrors}):`, errorMessage);
        
        if (errorCount >= maxErrors) {
          console.warn('Too many WalletConnect errors, forcing reset...');
          forceResetWalletConnection();
        } else {
          clearWalletConnectSessions();
        }
        
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Nettoyer les sessions au démarrage si nécessaire
    const checkAndCleanOnStart = () => {
      try {
        const hasWalletConnectData = Object.keys(localStorage).some(key => 
          key.includes('walletconnect') || key.includes('wc@2')
        );
        
        if (hasWalletConnectData) {
          console.log('Found WalletConnect data on startup, checking validity...');
          // Si on a des données WalletConnect mais des erreurs, nettoyer
          setTimeout(() => {
            if (errorCount > 0) {
              console.log('Errors detected, cleaning WalletConnect sessions...');
              clearWalletConnectSessions();
            }
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking WalletConnect data on startup:', error);
      }
    };

    checkAndCleanOnStart();

    return () => {
      console.error = originalError;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return <>{children}</>;
};
