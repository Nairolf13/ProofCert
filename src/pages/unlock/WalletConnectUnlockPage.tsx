import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WalletConnectLoginButton } from '../../lib/multiversx/index';

export const WalletConnectUnlockPage: React.FC = () => {
  const navigate = useNavigate();
  const commonProps = { callbackRoute: '/dashboard' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Connexion xPortal</h1>
          <p className="text-gray-600">Connectez-vous avec l'application xPortal via WalletConnect</p>
        </div>
        <div className="space-y-4">
          <WalletConnectLoginButton
            loginButtonText="Connecter xPortal"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            {...commonProps}
          />
          <button
            onClick={() => navigate('/')}
            className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors"
          >
            Retour
          </button>
        </div>
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-800">
            Scannez le QR code avec xPortal pour vous connecter en toute sécurité.
          </p>
        </div>
      </div>
    </div>
  );
};
