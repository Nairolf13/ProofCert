import React, { useState } from 'react';
import { ImmersiveLayout } from '../components/ImmersiveLayout';
import { Button } from '../components/Button';
import { UserIcon, WalletIcon, CalendarIcon, ArrowRightOnRectangleIcon, CameraIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { useMultiversXAuth } from '../hooks/useMultiversXAuth';

const ProfilePage: React.FC = () => {
  const { account, isLoggedIn, logout } = useMultiversXAuth();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);

  // Redirect to unlock if not authenticated
  React.useEffect(() => {
    if (!isLoggedIn) {
      navigate('/unlock');
    }
  }, [isLoggedIn, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !account) return;

    // Validation du fichier
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Format de fichier non supporté. Utilisez JPG, PNG ou WebP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('Le fichier est trop volumineux. Taille maximale : 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      // Convert to base64 for upload
      const base64 = await fileToBase64(file);
      
      // In a real implementation, upload to backend/IPFS and associate with wallet address
      console.log('Profile image would be uploaded for address:', account?.address, 'size:', base64.length);
      
      // TODO: Implement actual profile image upload
      // await profileApi.updateProfileImage(account.address, base64);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la photo de profil:', error);
      alert('Erreur lors de la mise à jour de la photo de profil');
    } finally {
      setIsUploading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  if (!isLoggedIn || !account) {
    return (
      <ImmersiveLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <UserIcon className="w-16 h-16 text-secondary mb-4" />
          <h2 className="text-3xl font-extrabold mb-2 text-primary">Non authentifié</h2>
          <p className="text-lg text-secondary mb-6">Connectez-vous pour accéder à votre profil magazine.</p>
          <Link to="/unlock">
            <Button className="btn-primary px-8 py-3 text-lg font-bold rounded-2xl shadow-xl hover:scale-105 transition">Connexion</Button>
          </Link>
        </div>
      </ImmersiveLayout>
    );
  }

  return (
    <ImmersiveLayout>
      <section className="w-full max-w-3xl mx-auto flex flex-col items-center gap-12 py-12 animate-fade-in">
        {/* Avatar magazine */}
        <div className="relative group mb-2">
          <div className="absolute -inset-2 rounded-full blur-2xl bg-primary-light opacity-30 group-hover:opacity-50 transition" />
          <div className="relative w-36 h-36 rounded-full overflow-hidden border-8 border-white shadow-2xl flex items-center justify-center bg-surface">
            {/* TODO: Profile image from backend/IPFS based on wallet address */}
            <UserIcon className="w-20 h-20 text-secondary" />
            
            {/* Overlay pour changer la photo */}
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <label htmlFor="profile-image-input" className="cursor-pointer">
                <CameraIcon className="w-8 h-8 text-white" />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </label>
            </div>
          </div>
          
          {/* Input caché pour sélectionner l'image */}
          <input
            id="profile-image-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleProfileImageChange}
            className="hidden"
            disabled={isUploading}
          />
        </div>
        {/* Infos utilisateur */}
        <div className="flex flex-col items-center gap-2 w-full">
          <span className="text-3xl font-extrabold text-primary mb-0.5 truncate max-w-xs drop-shadow">
            {account.address.slice(0, 6)}...{account.address.slice(-4)}
          </span>
          <span className="text-secondary text-lg truncate max-w-xs mb-2">MultiversX Wallet</span>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-accent-light text-accent text-base font-medium shadow border border-accent">
              <WalletIcon className="w-5 h-5" />
              {account.address}
            </span>
            <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-primary-light text-primary text-base font-medium shadow border border-primary">
              <CalendarIcon className="w-5 h-5" />
              Connecté aujourd'hui
            </span>
          </div>
          <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-surface-secondary text-secondary text-xs font-mono mt-2 border border-light">
            <WalletIcon className="w-4 h-4" />
            Balance: {account.balance ? `${account.balance} EGLD` : 'Loading...'}
          </span>
        </div>
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 w-full mt-8">
          <Link to="/favorites" className="w-full sm:w-auto flex-1">
            <Button 
              variant="secondary" 
              className="w-full text-lg font-bold border-2 border-red-200 text-red-600 hover:bg-red-50"
              leftIcon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              }
            >
              Mes favoris
            </Button>
          </Link>
          <Button
            className="btn-primary w-full sm:w-auto flex-1 text-lg font-bold shadow-xl focus:ring-2 focus:ring-primary"
            onClick={handleLogout}
            leftIcon={<ArrowRightOnRectangleIcon className="w-6 h-6" />}
          >
            Se déconnecter
          </Button>
          <Link to="/dashboard" className="w-full sm:w-auto flex-1">
            <Button variant="secondary" className="w-full text-lg font-bold">
              Retour au dashboard
            </Button>
          </Link>
        </div>
      </section>
    </ImmersiveLayout>
  );
};

export default ProfilePage;
