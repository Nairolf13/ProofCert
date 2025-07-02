import React, { useState } from 'react';
import { useMultiversX } from '../hooks/useMultiversX';
import { Button } from './Button';
import { WalletConnectionModal } from './WalletConnectionModal';
import { 
  WalletIcon, 
  ArrowRightOnRectangleIcon,
  CurrencyDollarIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

export const WalletInfo: React.FC = () => {
  const { isConnected, account, disconnect } = useMultiversX();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const formatBalance = (balance: string) => {
    const balanceInEGLD = parseFloat(balance) / Math.pow(10, 18);
    return balanceInEGLD.toFixed(4);
  };

  const copyAddress = async () => {
    if (account?.address) {
      await navigator.clipboard.writeText(account.address);
      // Vous pouvez ajouter une notification ici
    }
  };

  if (!isConnected || !account) {
    return (
      <>
        <Button
          onClick={() => setShowWalletModal(true)}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <WalletIcon className="w-4 h-4" />
          Connecter Wallet
        </Button>
        <WalletConnectionModal 
          isOpen={showWalletModal} 
          onClose={() => setShowWalletModal(false)} 
        />
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-secondary transition-colors w-full text-left"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <WalletIcon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {account.address.slice(0, 6)}...{account.address.slice(-4)}
          </p>
          <p className="text-xs text-gray-500">
            {formatBalance(account.balance)} EGLD
          </p>
        </div>
      </button>

      {showDropdown && (
        <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500">Adresse MultiversX</p>
            <p className="text-sm font-mono text-gray-900 break-all">
              {account.address}
            </p>
          </div>
          
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500">Solde</p>
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-900">
                {formatBalance(account.balance)} EGLD
              </span>
            </div>
          </div>

          <div className="p-2 space-y-1">
            <button
              onClick={copyAddress}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <ClipboardDocumentIcon className="w-4 h-4" />
              Copier l'adresse
            </button>
            
            <button
              onClick={() => {
                disconnect();
                setShowDropdown(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              Déconnecter Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
