import React, { useEffect, useState } from 'react';
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
  CalendarDaysIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { userApi } from '../api/user';

const navigation = [
  { name: 'Tableau de bord', href: '/app/dashboard', icon: HomeIcon },
  { name: 'Propriétés', href: '/app/properties', icon: ClipboardDocumentListIcon },
  { name: 'Ajouter propriété', href: '/app/add-property', icon: PlusIcon },
  { name: 'Locations', href: '/app/rentals', icon: ClipboardDocumentListIcon },
  { name: 'Mes réservations', href: '/app/my-reservations', icon: CalendarDaysIcon },
  { name: 'Preuves', href: '/app/proofs', icon: ClipboardDocumentListIcon },
  { name: 'Profil', href: '/app/profile', icon: UserIcon },
];

export const Navbar: React.FC<{ onOpenWalletModal: () => void }> = ({ onOpenWalletModal }) => {
  const { user: web3User, isLoggedIn: isWeb3LoggedIn, logout: web3Logout } = useMultiversXAuth();
  const { user: classicUser, isAuthenticated: isClassicLoggedIn, disconnect: classicLogout } = useAuthContext();
  const location = useLocation();
  const [isWalletAdmin, setIsWalletAdmin] = useState(false);

  const isActive = (path: string) => location.pathname.startsWith(path);

  // Vérifier le statut admin du wallet uniquement si nécessaire
  useEffect(() => {
    let ignore = false;
    
    const checkWalletAdmin = async () => {
      // Ne pas vérifier si déjà admin via l'authentification classique
      if (isClassicLoggedIn && classicUser?.role === 'ADMIN') {
        setIsWalletAdmin(false);
        return;
      }
      
      // Vérifier le statut admin du wallet si connecté
      if (isWeb3LoggedIn && web3User?.walletAddress) {
        try {
          const user = await userApi.getByWallet(web3User.walletAddress);
          if (!ignore) {
            setIsWalletAdmin(!!user && user.role === 'ADMIN');
          }
        } catch (error) {
          console.error('Error checking wallet admin status:', error);
          if (!ignore) setIsWalletAdmin(false);
        }
      } else if (!ignore) {
        setIsWalletAdmin(false);
      }
    };
    
    // Délai pour éviter les appels trop fréquents
    const timer = setTimeout(checkWalletAdmin, 500);
    
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [isWeb3LoggedIn, web3User?.walletAddress, isClassicLoggedIn, classicUser?.role]);

  // Déconnexion complète
  const handleLogout = async () => {
    try {
      // 1. Déconnexion Web3 si connecté
      if (isWeb3LoggedIn) {
        try {
          await web3Logout();
        } catch (error) {
          console.warn('Erreur lors de la déconnexion Web3:', error);
        }
        
        // Nettoyer manuellement les données WalletConnect
        const walletConnectKeys = [
          ...Object.keys(localStorage).filter(key => 
            key.startsWith('wc@2') || 
            key.startsWith('WALLETCONNECT') ||
            key.startsWith('walletconnect')
          ),
          ...Object.keys(sessionStorage).filter(key => 
            key.startsWith('wc@2') || 
            key.startsWith('WALLETCONNECT') ||
            key.startsWith('walletconnect')
          )
        ];
        
        walletConnectKeys.forEach(key => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });
      }
      
      // 2. Déconnexion classique si connecté
      if (isClassicLoggedIn) {
        try {
          await classicLogout();
        } catch (error) {
          console.warn('Erreur lors de la déconnexion classique:', error);
        }
      }
      
      // 3. Nettoyage complet
      localStorage.clear();
      sessionStorage.clear();
      
      // 4. Forcer un rechargement complet
      window.location.href = '/';
      window.location.reload();
    } catch (error) {
      console.error('Erreur critique lors de la déconnexion:', error);
      // En cas d'erreur, on force un nettoyage complet
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
      window.location.reload();
    }
  };

  // Affichage info utilisateur
  let userInfo = null;
  // L'utilisateur est admin s'il est connecté en tant qu'admin via l'authentification classique
  // OU s'il est connecté avec un wallet admin
  const isAdmin = Boolean(
    (isClassicLoggedIn && classicUser?.role === 'ADMIN') ||
    (isWeb3LoggedIn && isWalletAdmin)
  );
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
        {isAdmin && (
          <Link
            to="/app/admin/proofs"
            className={`flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-base transition-all duration-150 w-full group
              ${isActive('/app/admin/proofs')
                ? 'bg-primary-light text-primary shadow-md scale-105'
                : 'text-secondary hover:bg-surface-secondary hover:text-primary'}
            `}
          >
            <ArchiveBoxIcon className={`w-6 h-6 ${isActive('/app/admin/proofs') ? 'text-primary' : 'text-secondary group-hover:text-primary'}`} />
            <span>Archives Preuves</span>
          </Link>
        )}
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
