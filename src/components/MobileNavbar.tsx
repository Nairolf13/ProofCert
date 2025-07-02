import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './Button';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: HomeIcon },
  { name: 'Propriétés', href: '/properties', icon: ClipboardDocumentListIcon },
  { name: 'Ajouter propriété', href: '/add-property', icon: PlusIcon },
  { name: 'Locations', href: '/rentals', icon: ClipboardDocumentListIcon },
  { name: 'Mes réservations', href: '/my-reservations', icon: CalendarDaysIcon },
  { name: 'Preuves', href: '/proofs', icon: ClipboardDocumentListIcon },
  { name: 'Créer preuve', href: '/add-proof', icon: PlusIcon },
  { name: 'Profil', href: '/profile', icon: UserIcon },
];

export const MobileNavbar: React.FC = () => {
  const { user, isAuthenticated, disconnect } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname.startsWith(path);
  
  const disconnectAndRedirect = () => {
    disconnect();
    window.location.href = '/';
    setIsMenuOpen(false);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Header compact avec bouton hamburger */}
      <header className={`fixed top-0 left-0 right-0 border-b border-gray-200 md:hidden transition-all duration-300 ${
        isMenuOpen ? 'z-50 bg-surface' : 'z-50 bg-surface/95 backdrop-blur-sm'
      }`}>
        <div className="flex items-center justify-between px-3 py-2">
          {/* Logo et titre - affichés seulement quand le menu est fermé */}
          {!isMenuOpen && (
            <Link to="/" className="flex items-center gap-2" onClick={handleLinkClick}>
              <div className="w-7 h-7 gradient-primary rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xs">PC</span>
              </div>
              <span className="text-lg font-extrabold text-primary tracking-tight">ProofCert</span>
            </Link>
          )}
          
          {/* Titre "Menu" - affiché seulement quand le menu est ouvert */}
          {isMenuOpen && (
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold text-primary tracking-tight">Menu</span>
            </div>
          )}
          
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-lg bg-primary-light text-primary hover:bg-primary-500 hover:text-white transition-colors"
          >
            {isMenuOpen ? (
              <XMarkIcon className="w-5 h-5" />
            ) : (
              <Bars3Icon className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      {/* Menu fullscreen mobile optimisé */}
      <div className={`fixed inset-0 z-30 transition-transform duration-300 ease-in-out md:hidden ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Menu panel fullscreen */}
        <div className="absolute inset-0 bg-surface flex flex-col">
          {/* Espace pour le header fixe */}
          <div className="h-14"></div>

          {/* Navigation en liste verticale pour une meilleure UX mobile */}
          <nav className="flex-1 p-3 overflow-y-auto">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 p-3 rounded-lg font-medium text-base transition-all duration-200
                      ${isActive(item.href)
                        ? 'bg-primary-light text-primary shadow-md'
                        : 'text-secondary hover:bg-surface-secondary hover:text-primary'}
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isActive(item.href) ? 'text-primary' : 'text-secondary'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer du menu compact */}
          <div className="p-2 border-t border-gray-200">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                {user.walletAddress && (
                  <div className="text-xs text-secondary font-medium bg-gray-100 rounded-lg px-2 py-1 text-center">
                    {`${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={disconnectAndRedirect}
                  leftIcon={<ArrowRightOnRectangleIcon className="w-4 h-4" />}
                  className="w-full justify-center text-red-600 hover:bg-red-50 text-xs py-1.5"
                >
                  Déconnexion
                </Button>
              </div>
            ) : (
              <Link to="/auth" className="w-full" onClick={handleLinkClick}>
                <Button size="sm" className="w-full justify-center text-xs py-1.5">Connexion</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
