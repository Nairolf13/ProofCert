import React from 'react';
import { ExtensionLoginButton as SDKExtensionLoginButton } from '@multiversx/sdk-dapp/UI/extension/ExtensionLoginButton';
import { WalletConnectLoginButton as SDKWalletConnectLoginButton } from '@multiversx/sdk-dapp/UI/walletConnect/WalletConnectLoginButton';
import { WebWalletLoginButton as SDKWebWalletLoginButton } from '@multiversx/sdk-dapp/UI/webWallet/WebWalletLoginButton';
import { WalletResetButton } from './WalletResetButton';
import type { LoginButtonProps } from '../types';

export const ExtensionLoginButton: React.FC<LoginButtonProps> = ({
  loginButtonText,
  className = '',
  callbackRoute = '/dashboard'
}) => {
  return (
    <SDKExtensionLoginButton
      callbackRoute={callbackRoute}
      loginButtonText={loginButtonText}
      className={className}
    />
  );
};

export const WalletConnectLoginButton: React.FC<LoginButtonProps> = ({
  loginButtonText,
  className = '',
  callbackRoute = '/dashboard'
}) => {
  return (
    <SDKWalletConnectLoginButton
      callbackRoute={callbackRoute}
      loginButtonText={loginButtonText}
      className={className}
    />
  );
};

export const WebWalletLoginButton: React.FC<LoginButtonProps> = ({
  loginButtonText,
  className = '',
  callbackRoute = '/dashboard'
}) => {
  return (
    <SDKWebWalletLoginButton
      callbackRoute={callbackRoute}
      loginButtonText={loginButtonText}
      className={className}
    />
  );
};

// Composant pour afficher tous les boutons de connexion avec reset
export const LoginButtonsWithReset: React.FC<{
  showResetButton?: boolean;
  callbackRoute?: string;
}> = ({ showResetButton = true, callbackRoute = '/dashboard' }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <ExtensionLoginButton 
          callbackRoute={callbackRoute}
          loginButtonText="Connexion avec Extension"
          className="w-full"
        />
        <WalletConnectLoginButton 
          callbackRoute={callbackRoute}
          loginButtonText="Connexion avec WalletConnect"
          className="w-full"
        />
        <WebWalletLoginButton 
          callbackRoute={callbackRoute}
          loginButtonText="Connexion avec Web Wallet"
          className="w-full"
        />
      </div>
      
      {showResetButton && (
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
          <WalletResetButton variant="clear" className="flex-1 text-sm" />
          <WalletResetButton variant="reset" className="flex-1 text-sm" />
        </div>
      )}
    </div>
  );
};
