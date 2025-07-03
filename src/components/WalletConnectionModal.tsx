import React from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ExtensionLoginButton, WalletConnectLoginButton, WebWalletLoginButton } from '../MultiversXAuth/components/LoginButtons';
import { LedgerLoginButton as SDKLedgerLoginButton } from '@multiversx/sdk-dapp/UI/ledger/LedgerLoginButton';
import logo from '/logo-modern.svg';

interface WalletConnectionModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

export const WalletConnectionModal: React.FC<WalletConnectionModalProps> = ({ isOpen = true, onClose }) => {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-sm bg-black/40">
      <div className="relative z-50 w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-800">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Fermer la modal"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        {/* Colonne unique centrée */}
        <div className="flex flex-col items-center justify-center w-full">
          {/* Header premium */}
          <img src={logo} alt="ProofEstate" className="w-14 h-14 mb-2" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Connexion à ProofEstate</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center text-base max-w-xs mb-6">
            Connecte-toi avec ton wallet MultiversX pour accéder à toutes les fonctionnalités premium de la plateforme.
          </p>
          {/* Boutons de connexion - centrés et largeur homogène */}
          <div className="flex flex-col items-center w-full space-y-4">
            <div onClick={() => setTimeout(onClose, 300)} className="w-full">
              <WalletConnectLoginButton loginButtonText="Xportal" className="w-full" />
            </div>
            <div onClick={() => setTimeout(onClose, 300)} className="w-full">
              <ExtensionLoginButton loginButtonText="Extension MultiversX" className="w-full" />
            </div>
            <div onClick={() => setTimeout(onClose, 300)} className="w-full">
              <WebWalletLoginButton loginButtonText="Web Wallet" className="w-full" />
            </div>
            <div onClick={() => setTimeout(onClose, 300)} className="w-full">
              <SDKLedgerLoginButton loginButtonText="Ledger" callbackRoute="/dashboard" className="w-full" />
            </div>
          </div>
          {/* Footer */}
          <div className="mt-8 text-center w-full">
            <span className="text-xs text-gray-400 dark:text-gray-500 block mx-auto">Besoin d’aide ? <a href="https://wallet.multiversx.com/" target="_blank" rel="noopener" className="underline hover:text-blue-600">Créer un wallet</a></span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
