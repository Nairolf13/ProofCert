import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './Button';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
  BellIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Proofs', href: '/proofs', icon: ClipboardDocumentListIcon },
  { name: 'Create', href: '/add-proof', icon: PlusIcon },
  { name: 'Activity', href: '/activity', icon: BellIcon },
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

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PC</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">ProofCert</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700 font-medium">
                  {user.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : ''}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={disconnectAndRedirect}
                  leftIcon={<ArrowRightOnRectangleIcon className="w-4 h-4" />}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button size="sm">Connect Wallet</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
