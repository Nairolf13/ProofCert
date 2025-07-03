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
