import React, { useState, useRef, useEffect } from 'react';

interface PropertyOwnerActionsProps {
  isOwner: boolean;
  isEditing: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export const PropertyOwnerActions: React.FC<PropertyOwnerActionsProps> = ({ 
  isOwner, 
  isEditing, 
  isDeleting, 
  onEdit, 
  onDelete 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOwner) return null;

  return (
    <div className="relative" ref={menuRef}>
      {/* Bouton discret pour ouvrir le menu */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="absolute top-0 right-0 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border-2 border-gray-200 hover:border-pink-300 hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
        title="Options propriétaire"
      >
        <svg 
          className="w-5 h-5 text-gray-600 group-hover:text-pink-600 transition-colors" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {/* Menu dropdown */}
      {isMenuOpen && (
        <div className="absolute top-12 right-0 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-white/80 overflow-hidden z-50 animate-fade-in">
          {/* En-tête du menu */}
          <div className="bg-primary-light px-4 py-3 border-b border-primary-200">
            <h4 className="text-sm font-bold text-gray-700">Gestion du bien</h4>
          </div>
          
          {/* Options */}
          <div className="py-2">
            <button
              onClick={() => {
                onEdit();
                setIsMenuOpen(false);
              }}
              disabled={isEditing}
              className="w-full px-4 py-3 text-left hover:bg-primary-light transition-all duration-200 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">✏️</span>
              </div>
              <div>
                <span className="font-semibold text-gray-800">Modifier</span>
                <p className="text-xs text-gray-500">Éditer les informations</p>
              </div>
            </button>
            
            <button
              onClick={() => {
                if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bien ?')) {
                  onDelete();
                }
                setIsMenuOpen(false);
              }}
              disabled={isDeleting}
              className="w-full px-4 py-3 text-left hover:bg-red-50 transition-all duration-200 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🗑️</span>
              </div>
              <div>
                <span className="font-semibold text-gray-800">Supprimer</span>
                <p className="text-xs text-gray-500">Retirer définitivement</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
