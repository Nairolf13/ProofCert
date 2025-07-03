import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WebWalletLoginButton } from '../../lib/multiversx/index';

export const WebWalletUnlockPage: React.FC = () => {
  const navigate = useNavigate();
  const commonProps = { callbackRoute: '/dashboard' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Web Wallet</h1>
          <p className="text-gray-600">Connectez-vous avec le wallet web officiel MultiversX</p>
        </div>
        <div className="space-y-4">
          {WebWalletLoginButton ? (
            <WebWalletLoginButton
              loginButtonText="Ouvrir Web Wallet"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              {...commonProps}
            />
          ) : (
            <div className="text-red-500 text-center font-medium rounded bg-red-50 p-3">
              Bouton Web Wallet non disponible.<br />
              <span className="text-xs text-gray-500">Vérifiez l'intégration du SDK MultiversX côté front.</span>
            </div>
          )}
          <button
            onClick={() => navigate('/')}
            className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    </div>
  );
};
