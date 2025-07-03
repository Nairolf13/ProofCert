import React from 'react';
import { useNavigate } from 'react-router-dom';
// Assurez-vous que ExtensionLoginButton est bien exporté du SDK MultiversX
import { ExtensionLoginButton } from '../../lib/multiversx/index';
// const ExtensionLoginButton = undefined; // Remplacez par l'import réel si disponible

export const ExtensionUnlockPage: React.FC = () => {
  const navigate = useNavigate();
  const commonProps = { callbackRoute: '/dashboard' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            DeFi Wallet Extension
          </h1>
          <p className="text-gray-600">
            Connectez-vous avec l'extension MultiversX DeFi Wallet
          </p>
        </div>

        <div className="space-y-4">
          {ExtensionLoginButton ? (
            <ExtensionLoginButton
              loginButtonText="Connecter DeFi Wallet"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              {...commonProps}
            />
          ) : (
            <div className="text-red-500 text-center font-medium rounded bg-red-50 p-3">
              Bouton d'extension non disponible. <br />
              <span className="text-xs text-gray-500">
                Vérifiez l'intégration du SDK MultiversX côté front.
              </span>
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
