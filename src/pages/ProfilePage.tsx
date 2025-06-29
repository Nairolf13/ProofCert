import React, { useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { UserIcon, WalletIcon, CalendarIcon, EnvelopeIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { userApi } from '../api/user';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, refreshUser, disconnect } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      // TODO: upload to backend or IPFS, here just a placeholder
      const url = 'https://placehold.co/96x96?text=TODO';
      await userApi.updateProfileImage(url);
      await refreshUser?.();
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100">
        <Card className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-xl rounded-2xl">
          <CardContent className="text-center">
            <UserIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Not Authenticated</h2>
            <p className="text-gray-600 mb-4">Please log in to view your profile.</p>
            <Link to="/auth">
              <Button>Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center px-2 py-8 animate-fade-in">
      <div className="w-full max-w-lg mx-auto">
        <div className="relative rounded-3xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl p-8 flex flex-col items-center gap-6 glass-card">
          {/* Avatar avec effet glow */}
          <div className="relative group mb-2">
            <div className="absolute -inset-1 rounded-full blur-xl bg-gradient-to-tr from-primary-300/60 to-primary-500/40 opacity-60 group-hover:opacity-90 transition" />
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <UserIcon className="w-14 h-14 text-primary-400" />
              )}
              <button
                type="button"
                className="absolute bottom-2 right-2 bg-white/80 rounded-full p-1.5 shadow hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-400"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Changer la photo de profil"
                disabled={isUploading}
              >
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2a2.828 2.828 0 11-4-4 2.828 2.828 0 014 4z" /></svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageChange}
                disabled={isUploading}
              />
            </div>
          </div>
          {isUploading && <div className="text-xs text-primary-600 mt-1">Uploading...</div>}
          {uploadError && <div className="text-xs text-red-500 mt-1">{uploadError}</div>}

          {/* Infos utilisateur */}
          <div className="flex flex-col items-center gap-1 w-full">
            <span className="text-2xl font-bold text-gray-900 mb-0.5 truncate max-w-xs drop-shadow-sm">{user.username || user.email}</span>
            <span className="text-gray-500 text-sm truncate max-w-xs mb-2">{user.email}</span>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium shadow-sm border border-primary-100">
                <WalletIcon className="w-4 h-4" />
                {user.walletAddress ? user.walletAddress : 'Wallet non connecté'}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium shadow-sm border border-primary-100">
                <CalendarIcon className="w-4 h-4" />
                Membre depuis {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-mono mt-2 border border-gray-200">
              <EnvelopeIcon className="w-4 h-4" />
              ID: {user.id}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-6">
            <Button
              className="w-full sm:w-auto flex-1 bg-gradient-to-r from-primary-500 to-primary-400 text-white shadow-lg hover:from-primary-600 hover:to-primary-500 focus:ring-2 focus:ring-primary-400"
              onClick={disconnect}
              leftIcon={<ArrowRightOnRectangleIcon className="w-5 h-5" />}
            >
              Se déconnecter
            </Button>
            <Link to="/dashboard" className="w-full sm:w-auto flex-1">
              <Button variant="secondary" className="w-full">
                Retour au dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
