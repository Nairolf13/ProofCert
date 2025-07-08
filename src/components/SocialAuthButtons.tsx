import React from 'react';

interface SocialAuthButtonsProps {
  variant: 'login' | 'register';
  onGoogleClick?: () => void;
  onAppleClick?: () => void;
}

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  variant = 'login',
  onGoogleClick = () => {},
  onAppleClick = () => {},
}) => {
  const actionText = variant === 'login' ? 'Se connecter' : 'S\'inscrire';

  return (
    <div className="flex flex-col gap-3">
      <button 
        className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 font-semibold hover:bg-gray-50 transition-colors w-full"
        onClick={onGoogleClick}
        type="button"
      >
        {actionText} avec Google
      </button>
      <button 
        className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 font-semibold hover:bg-gray-50 transition-colors w-full"
        onClick={onAppleClick}
        type="button"
      >
        {actionText} avec Apple
      </button>
    </div>
  );
};
