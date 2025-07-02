import React from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

interface FavoriteButtonProps {
  propertyId: string;
  isFavorite: boolean;
  onToggle: (propertyId: string) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'overlay' | 'compact';
  className?: string;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  propertyId,
  isFavorite,
  onToggle,
  size = 'md',
  variant = 'default',
  className = '',
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!propertyId) {
      console.error('Property ID is missing!');
      return;
    }
    
    onToggle(propertyId);
  };

  // Styles selon la taille
  const sizeStyles = {
    sm: 'w-6 h-6 p-1',
    md: 'w-8 h-8 p-1.5',
    lg: 'w-10 h-10 p-2',
  };

  // Styles selon la variante
  const variantStyles = {
    default: 'bg-white/90 backdrop-blur-sm border-2 border-gray-200 hover:border-pink-300 shadow-lg hover:shadow-xl',
    overlay: 'bg-black/20 backdrop-blur border border-white/30 hover:bg-black/40',
    compact: 'bg-transparent hover:bg-gray-100',
  };

  // Icône selon l'état
  const IconComponent = isFavorite ? HeartIconSolid : HeartIcon;
  const iconColor = isFavorite ? 'text-red-500' : 'text-gray-600 group-hover:text-red-500';

  return (
    <button
      onClick={handleClick}
      className={`
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        rounded-full
        transition-all duration-200
        flex items-center justify-center
        group
        focus:outline-none focus:ring-2 focus:ring-red-300
        ${className}
      `}
      title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <IconComponent 
        className={`
          ${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'}
          ${iconColor}
          transition-colors duration-200
        `}
      />
    </button>
  );
};
