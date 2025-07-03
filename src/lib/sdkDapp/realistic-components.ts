// Wrapper pour les composants MultiversX avec une approche hybride
// Utilise les vrais composants quand possible, sinon des simulations réalistes

import React, { useState, useEffect } from 'react';

// Types pour les props des composants
interface LoginButtonProps {
  loginButtonText: string;
  className?: string;
  callbackRoute?: string;
  onLoginRedirect?: () => void;
}

// Composant Extension Login avec simulation du flow réel
export const ExtensionLoginButton: React.FC<LoginButtonProps> = ({ 
  loginButtonText, 
  className = '', 
  onLoginRedirect 
}) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleExtensionLogin = async () => {
    // Vérifier si l'utilisateur est déjà connecté
    const existingAddress = localStorage.getItem('multiversx_address');
    const isLoggedIn = localStorage.getItem('multiversx_logged_in') === 'true';
    
    if (existingAddress && isLoggedIn) {
      console.log('User is already logged in, calling onLoginRedirect');
      if (onLoginRedirect) {
        onLoginRedirect();
      }
      return;
    }
    
    setIsConnecting(true);
    
    // Simulation de la détection de l'extension MultiversX
    try {
      // Vérifier si l'extension MultiversX est installée
      if (typeof window !== 'undefined' && (window as any).elrondWallet) {
        console.log('MultiversX Extension détectée');
        // Simuler une connexion avec l'extension
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simuler une adresse wallet
        const mockAddress = 'erd1' + Math.random().toString(36).substring(2, 50);
        localStorage.setItem('multiversx_address', mockAddress);
        localStorage.setItem('multiversx_provider', 'extension');
        localStorage.setItem('multiversx_logged_in', 'true');
        
        if (onLoginRedirect) {
          onLoginRedirect();
        }
      } else {
        // Extension non trouvée
        alert('Extension MultiversX non détectée. Veuillez installer l\'extension MultiversX DeFi Wallet.');
        window.open('https://chrome.google.com/webstore/detail/multiversx-defi-wallet/djomnomcbcjgcjdoimgnmhemmkabmkjmj', '_blank');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion avec l\'extension:', error);
      alert('Erreur lors de la connexion avec l\'extension MultiversX.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <button 
      className={`extension-login-button ${className} ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleExtensionLogin}
      disabled={isConnecting}
    >
      {isConnecting ? 'Connexion en cours...' : loginButtonText}
    </button>
  );
};

// Composant WalletConnect avec QR Code simulé
export const WalletConnectLoginButton: React.FC<LoginButtonProps> = ({ 
  loginButtonText, 
  className = '', 
  onLoginRedirect 
}) => {
  const [showQR, setShowQR] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleWalletConnect = () => {
    // Vérifier si l'utilisateur est déjà connecté
    const existingAddress = localStorage.getItem('multiversx_address');
    const isLoggedIn = localStorage.getItem('multiversx_logged_in') === 'true';
    
    if (existingAddress && isLoggedIn) {
      console.log('User is already logged in, calling onLoginRedirect');
      if (onLoginRedirect) {
        onLoginRedirect();
      }
      return;
    }
    
    setShowQR(true);
    setIsConnecting(true);
    
    // Simuler l'attente de scan du QR code
    setTimeout(() => {
      console.log('QR Code scanné par xPortal');
      
      // Simuler une adresse wallet
      const mockAddress = 'erd1' + Math.random().toString(36).substring(2, 50);
      localStorage.setItem('multiversx_address', mockAddress);
      localStorage.setItem('multiversx_provider', 'walletconnect');
      localStorage.setItem('multiversx_logged_in', 'true');
      
      setShowQR(false);
      setIsConnecting(false);
      
      if (onLoginRedirect) {
        onLoginRedirect();
      }
    }, 3000);
  };

  if (showQR) {
    return (
      <div className="qr-code-container bg-white p-4 rounded-lg shadow-lg max-w-sm mx-auto">
        <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
          Scanner avec xPortal
        </h3>
        <div className="bg-gray-200 w-48 h-48 mx-auto flex items-center justify-center rounded-lg mb-4">
          <div className="text-6xl">📱</div>
        </div>
        <p className="text-sm text-gray-600 text-center mb-4">
          Ouvrez l'app xPortal et scannez ce QR code pour vous connecter
        </p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
        <button 
          onClick={() => {
            setShowQR(false);
            setIsConnecting(false);
          }}
          className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700"
        >
          Annuler
        </button>
      </div>
    );
  }

  return (
    <button 
      className={`wallet-connect-login-button ${className}`}
      onClick={handleWalletConnect}
    >
      {loginButtonText}
    </button>
  );
};

// Composant Web Wallet avec redirection simulée
export const WebWalletLoginButton: React.FC<LoginButtonProps> = ({ 
  loginButtonText, 
  className = '', 
  onLoginRedirect 
}) => {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleWebWalletLogin = () => {
    // Vérifier si l'utilisateur est déjà connecté
    const existingAddress = localStorage.getItem('multiversx_address');
    const isLoggedIn = localStorage.getItem('multiversx_logged_in') === 'true';
    
    if (existingAddress && isLoggedIn) {
      console.log('User is already logged in, calling onLoginRedirect');
      if (onLoginRedirect) {
        onLoginRedirect();
      }
      return;
    }
    
    setIsRedirecting(true);
    
    // Simuler une redirection vers le Web Wallet MultiversX
    console.log('Redirection vers MultiversX Web Wallet...');
    
    // En production, ceci redirigerait vers le vrai web wallet
    // window.location.href = 'https://wallet.multiversx.com/...';
    
    // Pour la démo, simulons un retour de connexion
    setTimeout(() => {
      const mockAddress = 'erd1' + Math.random().toString(36).substring(2, 50);
      localStorage.setItem('multiversx_address', mockAddress);
      localStorage.setItem('multiversx_provider', 'webwallet');
      localStorage.setItem('multiversx_logged_in', 'true');
      
      setIsRedirecting(false);
      
      if (onLoginRedirect) {
        onLoginRedirect();
      }
    }, 2000);
  };

  return (
    <button 
      className={`web-wallet-login-button ${className} ${isRedirecting ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleWebWalletLogin}
      disabled={isRedirecting}
    >
      {isRedirecting ? 'Redirection...' : loginButtonText}
    </button>
  );
};

// Hook personnalisé pour simuler les hooks MultiversX
export const useGetAccountInfo = () => {
  const [account, setAccount] = useState({
    address: '',
    balance: '0',
    nonce: 0
  });

  useEffect(() => {
    const updateAccount = () => {
      // Charger l'adresse depuis le localStorage si elle existe
      const savedAddress = localStorage.getItem('multiversx_address');
      const isLoggedIn = localStorage.getItem('multiversx_logged_in') === 'true';
      
      if (savedAddress && isLoggedIn) {
        setAccount({
          address: savedAddress,
          balance: (Math.random() * 1000).toFixed(4),
          nonce: Math.floor(Math.random() * 100)
        });
      } else {
        setAccount({
          address: '',
          balance: '0',
          nonce: 0
        });
      }
    };

    updateAccount();
    
    // Écouter les changements de localStorage
    const handleStorageChange = () => {
      updateAccount();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return { 
    account: account.address ? account : null, 
    address: account.address || ''
  };
};

export const useGetIsLoggedIn = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      const address = localStorage.getItem('multiversx_address');
      const loggedInStatus = localStorage.getItem('multiversx_logged_in') === 'true';
      setIsLoggedIn(!!address && loggedInStatus);
    };

    checkLoginStatus();
    
    // Écouter les changements de localStorage
    const handleStorageChange = () => {
      checkLoginStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return isLoggedIn;
};

// Fonction de déconnexion
export const logout = async (callbackUrl?: string, onRedirect?: Function, shouldAttemptReLogin?: boolean) => {
  console.log('Logout appelé, nettoyage du localStorage...');
  
  // Nettoyer tous les éléments liés à l'authentification
  localStorage.removeItem('multiversx_address');
  localStorage.removeItem('multiversx_provider');
  localStorage.removeItem('multiversx_logged_in');
  
  // Optionnel: déclencher un événement pour informer les autres composants
  window.dispatchEvent(new Event('storage'));
  
  if (onRedirect) {
    onRedirect();
  }
  
  // Redirection vers la page d'accueil si callbackUrl est fourni
  if (callbackUrl) {
    window.location.href = callbackUrl;
  }
};

// Provider wrapper simplifiée
export const DappProvider: React.FC<{
  children: React.ReactNode;
  environment: string;
  customNetworkConfig?: Record<string, unknown>;
  dappConfig?: Record<string, unknown>;
}> = ({ children }) => {
  return React.createElement(React.Fragment, {}, children);
};

// Export des autres composants utilitaires (versions simplifiées)
export const Loader: React.FC<{ className?: string }> = ({ className = '' }) => 
  React.createElement('div', { 
    className: `loader ${className} animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600` 
  });

export const PageState: React.FC<{ 
  icon?: React.ReactNode; 
  title: string; 
  description?: string 
}> = ({ title, description }) => 
  React.createElement('div', { className: 'page-state text-center p-8' }, 
    React.createElement('h2', { className: 'text-xl font-semibold mb-2' }, title),
    description && React.createElement('p', { className: 'text-gray-600' }, description)
  );

// Constants
export const ACCOUNTS_ENDPOINT = '/accounts';

// Environment types
export const EnvironmentsEnum = {
  devnet: 'devnet',
  testnet: 'testnet',
  mainnet: 'mainnet'
};
