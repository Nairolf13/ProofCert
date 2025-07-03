import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface WalletConnectionModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

export const WalletConnectionModal: React.FC<WalletConnectionModalProps> = ({ isOpen = true, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleConnectWallet = () => {
    onClose();
    navigate('/unlock');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Connecter un Wallet
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Connectez votre wallet MultiversX pour accéder à toutes les fonctionnalités de ProofEstate.
          </p>

          <Button
            onClick={handleConnectWallet}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Choisir un Wallet
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-4">
            Nouveau sur MultiversX ?
          </p>
          <Button
            onClick={() => window.open('https://wallet.multiversx.com/', '_blank')}
            variant="outline"
            className="w-full"
          >
            Créer un Wallet
          </Button>
        </div>
      </div>
    </div>
  );
};
