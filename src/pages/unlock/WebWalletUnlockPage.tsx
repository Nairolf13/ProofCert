import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WebWalletLoginButton } from '../../lib/sdkDapp/realistic-components';

export const WebWalletUnlockPage: React.FC = () => {
  const navigate = useNavigate();

  const commonProps = {
    callbackRoute: '/dashboard',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Web Wallet
          </h1>
          <p className="text-gray-600">
            Connectez-vous avec le wallet web officiel MultiversX
          </p>
        </div>

        <div className="space-y-4">
          <WebWalletLoginButton
            loginButtonText="Ouvrir Web Wallet"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            {...commonProps}
          />

          <button
            onClick={() => navigate('/')}
            className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors"
          >
            Retour
          </button>
        </div>

        <div className="mt-6 p-4 bg-green-50 rounded-xl">
          <p className="text-sm text-green-800">
            <strong>Note:</strong> Vous serez redirigé vers le wallet web officiel MultiversX.
          </p>
        </div>
      </div>
    </div>
  );
};
