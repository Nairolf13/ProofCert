import React, { useEffect } from 'react';
import { clearWalletConnectSessions, forceResetWalletConnection } from '../utils';

interface WalletConnectErrorHandlerProps {
  children: React.ReactNode;
}

export const WalletConnectErrorHandler: React.FC<WalletConnectErrorHandlerProps> = ({ children }) => {
  useEffect(() => {
    let errorCount = 0;
    const maxErrors = 3; // Maximum d'erreurs avant reset complet
    
    // Écouter les erreurs de console
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      const errorMessage = args.join(' ');
      
      // Détecter les erreurs WalletConnect
      const walletConnectErrors = [
        'Pending session not found',
        'Session not found',
        'Invalid session',
        'No matching key',
        'Pairing not found',
        'Topic not found'
      ];

      if (walletConnectErrors.some(error => errorMessage.includes(error))) {
        errorCount++;
        
        if (errorCount >= maxErrors) {
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
      
      const walletConnectErrors = [
        'Pending session not found',
        'Session not found',
        'Invalid session',
        'No matching key',
        'Pairing not found',
        'Topic not found'
      ];

      if (walletConnectErrors.some(error => errorMessage.includes(error))) {
        errorCount++;
        
        if (errorCount >= maxErrors) {
          forceResetWalletConnection();
        } else {
          clearWalletConnectSessions();
        }
        
        event.preventDefault();
      }
    };

    // Écouter les erreurs générales
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || '';
      
      const walletConnectErrors = [
        'Pending session not found',
        'Session not found',
        'Invalid session'
      ];

      if (walletConnectErrors.some(error => errorMessage.includes(error))) {
        errorCount++;
        
        if (errorCount >= maxErrors) {
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
          // Vérifier si nous avons des données corrompues
          const hasErrors = Object.entries(localStorage).some(([key, value]) => {
            if (!key.includes('walletconnect') && !key.includes('wc@2')) return false;
            
            try {
              JSON.parse(value);
              return false;
            } catch {
              return true;
            }
          });
          
          if (hasErrors) {
            clearWalletConnectSessions();
          }
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
