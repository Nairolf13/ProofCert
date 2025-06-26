import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
  BellIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Proofs', href: '/proofs', icon: ClipboardDocumentListIcon },
  { name: 'Create', href: '/add-proof', icon: PlusIcon },
  { name: 'Activity', href: '/activity', icon: BellIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow md:hidden">
      <div className="flex justify-between items-center px-2 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center flex-1 py-2 px-1 text-xs font-medium transition-colors ${
                active ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${active ? 'text-primary-600' : 'text-gray-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
