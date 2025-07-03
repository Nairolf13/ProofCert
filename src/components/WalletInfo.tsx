import React, { useState, useEffect } from 'react';
import { useMultiversXAuth } from '../hooks/useMultiversXAuth';
import { Button } from './Button';
import { 
  WalletIcon, 
  ArrowRightOnRectangleIcon,
  CurrencyDollarIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { config } from '../config/environments';
import { EnvironmentsEnum } from '@multiversx/sdk-dapp/types';

// Configuration par défaut pour devnet
const currentConfig = config[EnvironmentsEnum.devnet];

export const WalletInfo: React.FC<{ onOpenWalletModal?: () => void }> = ({ onOpenWalletModal }) => {
  const { isLoggedIn, account, address, logout } = useMultiversXAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [realTimeBalance, setRealTimeBalance] = useState<string | null>(null);

  // Formater le solde en EGLD
  const formatBalance = (balance: string) => {
    const balanceInEGLD = parseFloat(balance) / Math.pow(10, 18);
    return balanceInEGLD.toFixed(4);
  };

  // Formater l'adresse pour l'affichage
  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  // Copier l'adresse
  const copyAddress = async () => {
    if (account?.address) {
      try {
        await navigator.clipboard.writeText(account.address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  // Récupérer le solde en temps réel
  useEffect(() => {
    const fetchRealTimeBalance = async () => {
      if (address) {
        try {
          const response = await fetch(`${currentConfig.apiAddress}/accounts/${address}`);
          const accountData = await response.json();
          setRealTimeBalance(accountData.balance || '0');
        } catch (error) {
          console.error('Failed to fetch real-time balance:', error);
        }
      }
    };

    if (isLoggedIn && address) {
      fetchRealTimeBalance();
      // Mettre à jour le solde toutes les 30 secondes
      const interval = setInterval(fetchRealTimeBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, address]);

  // Déconnexion
  const handleDisconnect = async () => {
    try {
      await logout();
      setShowDropdown(false);
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  if (!isLoggedIn || !address) {
    return (
      <>
        <Button
          onClick={onOpenWalletModal}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
        >
          <WalletIcon className="w-4 h-4" />
          Connecter Wallet
        </Button>
      </>
    );
  }

  const displayBalance = realTimeBalance ? formatBalance(realTimeBalance) : 
                        (account?.balance ? formatBalance(account.balance) : '0.0000');

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:border-gray-300 hover:shadow-sm w-full text-left"
      >
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <WalletIcon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">
              {formatAddress(address)}
            </p>
            {/* Removed provider display as it's not available in the new hook */}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <CurrencyDollarIcon className="w-3 h-3 text-gray-400" />
            <p className="text-xs text-gray-600 font-mono">
              {displayBalance} {currentConfig.egldLabel}
            </p>
          </div>
        </div>
        <div className="text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {showDropdown && (
        <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 min-w-[320px]">
          {/* Header avec info du provider */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">Wallet Connecté</p>
                <p className="text-xs text-gray-500">MultiversX</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <CheckIcon className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-1">Adresse MultiversX</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-mono text-gray-900 truncate">
                {account.address}
              </p>
              <button
                onClick={copyAddress}
                className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Copier l'adresse"
              >
                {copied ? (
                  <CheckIcon className="w-4 h-4 text-green-500" />
                ) : (
                  <ClipboardDocumentIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          
          {/* Solde */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-1">Solde</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CurrencyDollarIcon className="w-4 h-4 text-green-500" />
                <span className="text-lg font-bold text-gray-900 font-mono">
                  {formatBalance(realTimeBalance || account.balance)}
                </span>
                <span className="text-sm text-gray-600">EGLD</span>
              </div>
              {realTimeBalance && realTimeBalance !== account.balance && (
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  Live
                </span>
              )}
            </div>
            {account.nonce !== undefined && (
              <p className="text-xs text-gray-500 mt-1">
                Nonce: {account.nonce}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="p-2 space-y-1">
            <button
              onClick={copyAddress}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {copied ? (
                <CheckIcon className="w-4 h-4 text-green-500" />
              ) : (
                <ClipboardDocumentIcon className="w-4 h-4" />
              )}
              {copied ? 'Adresse copiee !' : 'Copier l\'adresse'}
            </button>
            
            <button
              onClick={() => window.open(`${currentConfig.explorerAddress}/accounts/${address}`, '_blank')}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              Voir dans l'explorateur
            </button>
            
            <button
              onClick={handleDisconnect}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              Déconnecter
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
