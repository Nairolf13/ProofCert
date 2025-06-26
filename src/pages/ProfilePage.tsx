import React, { useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { UserIcon, WalletIcon, CalendarIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { userApi } from '../api/user';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const url = 'https://placehold.co/96x96?text=TODO'; 
      await userApi.updateProfileImage(url);
      await refreshUser?.();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setUploadError(err.message || 'Upload failed');
      } else {
        setUploadError('Upload failed');
      }
    } finally {
      setIsUploading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-xl mx-auto px-4">
        <Card>
          <CardHeader className="flex flex-col items-center pb-0">
            <div className="relative w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mb-4 overflow-hidden shadow">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <UserIcon className="w-12 h-12 text-primary-600" />
              )}
              <button
                type="button"
                className="absolute bottom-1 right-1 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Change profile picture"
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
            {isUploading && <div className="text-xs text-primary-600 mt-1">Uploading...</div>}
            {uploadError && <div className="text-xs text-red-500 mt-1">{uploadError}</div>}
            <CardTitle className="text-2xl text-center mb-1 truncate max-w-xs">{user.username || user.email}</CardTitle>
            <p className="text-gray-500 text-sm text-center mb-2 truncate max-w-xs">{user.email}</p>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            <div className="flex items-center gap-3">
              <WalletIcon className="w-5 h-5 text-primary-500" />
              <span className="text-gray-700 font-medium">Wallet:</span>
              <span className="font-mono text-xs text-gray-600 truncate">{user.walletAddress ? user.walletAddress : 'Not connected'}</span>
            </div>
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-primary-500" />
              <span className="text-gray-700 font-medium">Member since:</span>
              <span className="text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-3">
              <EnvelopeIcon className="w-5 h-5 text-primary-500" />
              <span className="text-gray-700 font-medium">User ID:</span>
              <span className="font-mono text-xs text-gray-600 truncate">{user.id}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
