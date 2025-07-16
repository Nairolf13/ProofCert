import { useEffect } from 'react';
import { useMultiversXAuth } from '../../hooks/useMultiversXAuth';
import { userApi } from '../../api/user';

// Effet pour lier le wallet à l'utilisateur classique si besoin
export const WalletAutoLinker: React.FC = () => {
  const { user, address, isLoggedIn, isWalletConnected } = useMultiversXAuth();

  useEffect(() => {
    console.log('[WalletAutoLinker] Effet déclenché', {
      isLoggedIn,
      isWalletConnected,
      user,
      address,
      userWalletAddress: user?.walletAddress
    });
    if (isLoggedIn && isWalletConnected && user && address && !user.walletAddress) {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token') || undefined;
      console.log('[WalletAutoLinker] Appel userApi.connectWallet', {
        address,
        token,
        userAvant: user
      });
      userApi.connectWallet(address, token)
        .then(({ user: updatedUser }) => {
          console.log('[WalletAutoLinker] Wallet lié à l’utilisateur classique:', updatedUser);
        })
        .catch((err) => {
          console.error('[WalletAutoLinker] Erreur lors de la liaison du wallet:', err);
        });
    }
  }, [isLoggedIn, isWalletConnected, user, address]);
  return null;
};
import React from 'react';
import { ExtensionLoginButton as SDKExtensionLoginButton } from '@multiversx/sdk-dapp/UI/extension/ExtensionLoginButton';
import { WalletConnectLoginButton as SDKWalletConnectLoginButton } from '@multiversx/sdk-dapp/UI/walletConnect/WalletConnectLoginButton';
import { WebWalletLoginButton as SDKWebWalletLoginButton } from '@multiversx/sdk-dapp/UI/webWallet/WebWalletLoginButton';
import { logout } from '../utils';
import type { LoginButtonProps } from '../types';

export const ExtensionLoginButton: React.FC<LoginButtonProps> = ({
  loginButtonText,
  className = '',
  callbackRoute = '/dashboard'
}) => (
  <SDKExtensionLoginButton
    callbackRoute={callbackRoute}
    loginButtonText={loginButtonText}
    className={className}
  />
);

export const WalletConnectLoginButton: React.FC<LoginButtonProps> = ({
  loginButtonText,
  className = '',
  callbackRoute = '/dashboard'
}) => (
  <SDKWalletConnectLoginButton
    callbackRoute={callbackRoute}
    loginButtonText={loginButtonText}
    className={className}
  />
);

export const WebWalletLoginButton: React.FC<LoginButtonProps> = ({
  loginButtonText,
  className = '',
  callbackRoute = '/dashboard'
}) => (
  <SDKWebWalletLoginButton
    callbackRoute={callbackRoute}
    loginButtonText={loginButtonText}
    className={className}
  />
);

export const LogoutButton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <button
    onClick={() => logout('/')}
    className={`px-4 py-2 bg-red-500 text-white rounded ${className}`}
  >
    Déconnexion
  </button>
);
