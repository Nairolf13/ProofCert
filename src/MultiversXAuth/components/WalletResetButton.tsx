import React from 'react';

export const WalletResetButton: React.FC<{ variant?: 'clear' | 'reset'; className?: string }> = ({ variant = 'reset', className = '' }) => {
  return (
    <button
      type="button"
      className={`rounded px-4 py-2 border ${variant === 'clear' ? 'border-gray-300 text-gray-600' : 'border-red-500 text-red-600'} ${className}`}
      onClick={() => {
        // Action de reset à définir selon le besoin
        if (variant === 'clear') {
          localStorage.removeItem('user');
          window.location.reload();
        } else {
          localStorage.clear();
          window.location.reload();
        }
      }}
    >
      {variant === 'clear' ? 'Déconnexion' : 'Réinitialiser Wallet'}
    </button>
  );
};