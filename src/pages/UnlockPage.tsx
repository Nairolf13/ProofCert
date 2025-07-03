import React from 'react';
import { useNavigate } from 'react-router-dom';
import { appConfig } from '../config/environments';
import {
  ExtensionLoginButton,
  WalletConnectLoginButton,
  WebWalletLoginButton,
  LedgerLoginButton,
  OperaWalletLoginButton
} from '../lib/multiversx';

export const UnlockPage: React.FC = () => {
  const navigate = useNavigate();

  const commonProps = {
    callbackRoute: '/dashboard',
    nativeAuth: appConfig.nativeAuth,
    onLoginRedirect: () => {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Connexion Wallet
          </h2>
          <p className="text-gray-600">
            Choisissez votre méthode de connexion préférée
          </p>
        </div>

        <div className="space-y-4">
          {/* xPortal App (WalletConnect) */}
          <WalletConnectLoginButton
            loginButtonText="Connecter avec xPortal"
            {...commonProps}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
          />

          {/* Extension Wallet */}
          <ExtensionLoginButton
            loginButtonText="Connecter avec Extension"
            {...commonProps}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
          />

          {/* Web Wallet */}
          <WebWalletLoginButton
            loginButtonText="Connecter avec Web Wallet"
            {...commonProps}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
          />

          {/* Ledger */}
          <LedgerLoginButton
            loginButtonText="Connecter avec Ledger"
            {...commonProps}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
          />

          {/* Opera Wallet */}
          <OperaWalletLoginButton
            loginButtonText="Connecter avec Opera Wallet"
            {...commonProps}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
          />
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            En vous connectant, vous acceptez nos conditions d'utilisation
          </p>
        </div>
      </div>
    </div>
  );
};
