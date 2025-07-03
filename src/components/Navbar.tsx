import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMultiversXAuth } from '../hooks/useMultiversXAuth';
import { Button } from './Button';
import { WalletInfo } from './WalletInfo';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon
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

export const Navbar: React.FC<{ onOpenWalletModal: () => void }> = ({ onOpenWalletModal }) => {
  const { user, isLoggedIn, logout } = useMultiversXAuth();
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);
  const disconnectAndRedirect = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <aside
      className="navbar-professional fixed inset-y-0 left-0 z-40 w-64 flex-col py-6 px-4 hidden md:flex"
    >
      <div className="flex items-center gap-2 mb-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-extrabold text-primary tracking-tight drop-shadow-sm">ProofEstate</span>
        </Link>
      </div>
      <nav className="flex-1 flex flex-col gap-2 w-full">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-base transition-all duration-150 w-full group
                ${isActive(item.href)
                  ? 'bg-primary-light text-primary shadow-md scale-105'
                  : 'text-secondary hover:bg-surface-secondary hover:text-primary'}
              `}
            >
              <Icon className={`w-6 h-6 ${isActive(item.href) ? 'text-primary' : 'text-secondary group-hover:text-primary'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-3 w-full">
        {/* Informations du wallet */}
        <WalletInfo onOpenWalletModal={onOpenWalletModal} />
        {isLoggedIn && user ? (
          <>
            <span className="text-xs text-secondary font-medium truncate max-w-[120px]">
              {user.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : ''}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={disconnectAndRedirect}
              leftIcon={<ArrowRightOnRectangleIcon className="w-5 h-5" />}
              className="w-full justify-start"
            >
              Déconnexion
            </Button>
          </>
        ) : (
          <Button size="sm" className="w-full justify-start" onClick={onOpenWalletModal}>
            Connecter Wallet
          </Button>
        )}
      </div>
    </aside>
  );
};
