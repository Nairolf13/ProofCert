import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMultiversXAuth } from '../hooks/useMultiversXAuth';
import { useAuthContext } from '../hooks/AuthContext';
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
  const { user: web3User, isLoggedIn: isWeb3LoggedIn, logout: web3Logout } = useMultiversXAuth();
  const { user: classicUser, isAuthenticated: isClassicLoggedIn, disconnect: classicLogout } = useAuthContext();
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  // Déconnexion selon le mode d'auth
  const handleLogout = async () => {
    if (isWeb3LoggedIn) {
      await web3Logout();
    } else if (isClassicLoggedIn) {
      await classicLogout();
    }
    window.location.href = '/';
  };

  // Affichage info utilisateur
  let userInfo = null;
  if (isClassicLoggedIn && classicUser) {
    userInfo = (
      <span className="text-xs text-secondary font-medium truncate max-w-[160px]" title={classicUser.email}>
        {classicUser.email}
      </span>
    );
  } else if (isWeb3LoggedIn && web3User) {
    userInfo = (
      <span className="text-xs text-secondary font-medium truncate max-w-[160px]" title={web3User.walletAddress}
      >
        {web3User.walletAddress ? `${web3User.walletAddress.slice(0, 6)}...${web3User.walletAddress.slice(-4)}` : ''}
      </span>
    );
  }

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
        {/* Affichage wallet MultiversX (bouton modal) */}
        <WalletInfo onOpenWalletModal={onOpenWalletModal} />
        {/* Affichage info utilisateur + bouton déconnexion/connexion */}
        {userInfo && (
          <div className="flex items-center gap-2">
            {userInfo}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              leftIcon={<ArrowRightOnRectangleIcon className="w-5 h-5" />}
              className="w-full justify-start"
            >
              Déconnexion
            </Button>
          </div>
        )}
        {!isClassicLoggedIn && !isWeb3LoggedIn && (
          <Button size="sm" className="w-full justify-start" onClick={onOpenWalletModal}>
            Connecter Wallet
          </Button>
        )}
      </div>
    </aside>
  );
};
