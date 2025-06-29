import React, { useRef, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './Button';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

// Nouvelle navbar latérale moderne et fluide
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Proofs', href: '/proofs', icon: ClipboardDocumentListIcon },
  { name: 'Create Proof', href: '/add-proof', icon: PlusIcon },
  { name: 'Properties', href: '/properties', icon: ClipboardDocumentListIcon },
  { name: 'Add Property', href: '/add-property', icon: PlusIcon },
  { name: 'Rentals', href: '/rentals', icon: ClipboardDocumentListIcon },
  { name: 'Add Rental', href: '/add-rental', icon: PlusIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
];

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, disconnect } = useAuth();
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);
  const disconnectAndRedirect = () => {
    disconnect();
    window.location.href = '/';
  };

  // --- Hide on mouse leave, show on hover (desktop only) ---
  const navRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (collapsed && hovered) setCollapsed(false);
  }, [hovered, collapsed]);

  // Hide on mouse leave (desktop), show on hover
  const handleMouseEnter = () => setHovered(true);
  const handleMouseLeave = () => setHovered(false);
  useEffect(() => {
    if (!hovered) {
      const timeout = setTimeout(() => setCollapsed(true), 600);
      return () => clearTimeout(timeout);
    } else {
      setCollapsed(false);
    }
  }, [hovered]);

  // Always expanded on mobile
  // Responsive: collapsed = icon only, expanded = full
  return (
    <aside
      ref={navRef}
      className={`fixed inset-y-0 left-0 z-40 transition-all duration-300
        ${collapsed ? 'w-16 md:w-20' : 'w-20 md:w-64'}
        bg-white/90 backdrop-blur-lg border-r border-gray-200 shadow-xl flex flex-col items-center md:items-stretch py-6 px-2 md:px-4
        group/nav hover:w-64 md:hover:w-64
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ minWidth: collapsed ? 64 : 256 }}
    >
      <div className="flex flex-col items-center md:items-start gap-4 mb-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 via-pink-400 to-blue-400 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">PC</span>
          </div>
          <span className={`hidden md:inline text-2xl font-extrabold text-gray-900 tracking-tight drop-shadow-sm transition-opacity duration-200 ${collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>ProofCert</span>
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
                  ? 'bg-gradient-to-tr from-purple-100 via-pink-100 to-blue-100 text-primary-700 shadow-md scale-105'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-primary-600'}
              `}
            >
              <Icon className={`w-6 h-6 ${isActive(item.href) ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500'}`} />
              <span className={`hidden md:inline transition-opacity duration-200 ${collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col items-center md:items-start gap-3 w-full">
        {isAuthenticated && user ? (
          <>
            <span className={`hidden md:inline text-xs text-gray-400 font-medium truncate max-w-[120px] transition-opacity duration-200 ${collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>{user.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : ''}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={disconnectAndRedirect}
              leftIcon={<ArrowRightOnRectangleIcon className="w-5 h-5" />}
              className="w-full justify-start"
            >
              <span className={`hidden md:inline transition-opacity duration-200 ${collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>Déconnexion</span>
            </Button>
          </>
        ) : (
          <Link to="/auth" className="w-full">
            <Button size="sm" className="w-full justify-start">Connexion</Button>
          </Link>
        )}
      </div>
    </aside>
  );
};
