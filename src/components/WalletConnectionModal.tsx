import React, { useState } from 'react';
import { useMultiversX } from '../hooks/useMultiversX';
import { Button } from './Button';
import { XMarkIcon, WalletIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletConnectionModal: React.FC<WalletConnectionModalProps> = ({ isOpen, onClose }) => {
  const { connect, isLoading, error } = useMultiversX();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  if (!isOpen) return null;

  const walletProviders: Array<{
    id: 'web-wallet' | 'extension';
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }> = [
    {
      id: 'web-wallet',
      name: 'MultiversX Web Wallet',
      description: 'Se connecter via le wallet web officiel MultiversX',
      icon: GlobeAltIcon,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'extension',
      name: 'MultiversX DeFi Wallet',
      description: 'Extension de navigateur (recommandée)',
      icon: WalletIcon,
      color: 'from-purple-500 to-pink-600'
    }
  ];

  const handleConnect = async (providerId: 'web-wallet' | 'extension') => {
    setSelectedProvider(providerId);
    try {
      await connect(providerId);
      onClose();
    } catch (error) {
      console.error('Connection error:', error);
    } finally {
      setSelectedProvider(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Connecter votre Wallet</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 leading-relaxed">
            Connectez votre wallet MultiversX pour accéder à toutes les fonctionnalités de ProofEstate et certifier vos preuves sur la blockchain.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {walletProviders.map((provider) => {
            const Icon = provider.icon;
            const isConnecting = isLoading && selectedProvider === provider.id;

            return (
              <button
                key={provider.id}
                onClick={() => handleConnect(provider.id)}
                disabled={isLoading}
                className={`w-full p-6 rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 text-left group ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-1'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${provider.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{provider.name}</h3>
                    <p className="text-sm text-gray-600">{provider.description}</p>
                    {isConnecting && (
                      <div className="mt-2 flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-blue-600">Connexion en cours...</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Première fois ?</h4>
              <p className="text-sm text-blue-700">
                Si vous n'avez pas encore de wallet MultiversX, vous pouvez en créer un gratuitement sur le site officiel MultiversX.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button 
            onClick={() => window.open('https://wallet.multiversx.com', '_blank')}
            variant="ghost"
            className="flex-1"
          >
            Créer un Wallet
          </Button>
        </div>
      </div>
    </div>
  );
};
