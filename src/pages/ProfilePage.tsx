import React, { useState, useEffect } from 'react';
import { ImmersiveLayout } from '../components/ImmersiveLayout';
import { Button } from '../components/Button';
import { UserIcon, WalletIcon, CalendarIcon, ArrowRightOnRectangleIcon, CameraIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { useMultiversXAuth } from '../hooks/useMultiversXAuth';
import { useAuthContext } from '../hooks/AuthContext';
import { userApi } from '../api/user';
import type { User } from '../types';

const ProfilePage: React.FC = () => {
  const { account, isLoggedIn, logout: walletLogout, isLoading: isWalletLoading } = useMultiversXAuth();
  const { user: authUser, isAuthenticated, disconnect, isAuthLoading } = useAuthContext();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier l'authentification
  useEffect(() => {
    if (!isWalletLoading && !isAuthLoading) {
      if (!isLoggedIn && !isAuthenticated) {
        navigate('/login');
      } else {
        setIsLoading(false);
      }
    }
  }, [isLoggedIn, isAuthenticated, isWalletLoading, isAuthLoading, navigate]);

  // Gérer la déconnexion selon le type d'authentification
  const handleLogoutClick = async () => {
    if (isLoggedIn) {
      await walletLogout();
    } else if (isAuthenticated) {
      disconnect();
    }
    navigate('/');
  };

  // Fonction utilitaire pour valider le rôle
  const getValidRole = (role: string | undefined): 'OWNER' | 'TENANT' | 'ADMIN' | undefined => {
    const validRoles = ['OWNER', 'TENANT', 'ADMIN'] as const;
    return validRoles.includes(role as any) ? role as 'OWNER' | 'TENANT' | 'ADMIN' : 'ADMIN';
  };

  // Extension du type User avec des propriétés supplémentaires pour le profil
  interface ProfileUser extends Omit<User, 'role'> {
    name: string; // Ajout du champ name qui est optionnel dans User
    avatar?: string; // Alias pour profileImage
    walletAddress: string; // Rendons walletAddress obligatoire pour le profil
    role: 'OWNER' | 'TENANT' | 'ADMIN'; // Rendre le rôle obligatoire avec un type restreint
    [key: string]: any; // Pour les propriétés dynamiques comme 'phone'
  };

  // État pour stocker les données utilisateur récupérées
  const [userData, setUserData] = useState<ProfileUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les informations de l'utilisateur depuis l'API
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchUserData = async () => {
      if (!isMounted) return;
      
      try {
        setIsLoadingUser(true);
        setError(null);
        
        if (isLoggedIn && account?.address) {
          console.log('Récupération des données utilisateur pour le wallet:', account.address);
          
          // Récupérer l'utilisateur depuis l'API en utilisant l'adresse du wallet
          const userFromApi = await userApi.getByWallet(account.address);
          
          if (!isMounted) return;
          
          if (userFromApi) {
            console.log('Utilisateur trouvé dans la base de données:', userFromApi);
            
            // Créer un objet utilisateur avec des valeurs par défaut sécurisées
            const userData: ProfileUser = {
              // Propriétés de base requises
              id: userFromApi.id || account.address,
              email: userFromApi.email || `${account.address.slice(0, 8)}...@wallet`,
              username: userFromApi.username || `user_${account.address.slice(0, 8)}`,
              
              // Propriétés avec valeurs par défaut
              name: (userFromApi as any).name || userFromApi.username || `User ${account.address.slice(0, 6)}`,
              avatar: (userFromApi as any).avatar || userFromApi.profileImage,
              profileImage: userFromApi.profileImage,
              
              // Propriétés liées au wallet
              walletAddress: account.address,
              address: account.address,
              
              // Rôle et métadonnées avec validation stricte
              role: getValidRole(userFromApi.role) || 'ADMIN',
              
              // Propriétés avec gestion des valeurs par défaut
              createdAt: userFromApi.createdAt || new Date().toISOString(),
              updatedAt: userFromApi.updatedAt || new Date().toISOString(),
              
              // Copier les propriétés supplémentaires qui pourraient être présentes
              ...(userFromApi as Omit<typeof userFromApi, 'id' | 'email' | 'username' | 'profileImage' | 'role' | 'createdAt' | 'updatedAt'>)
            };
            

            
            console.log('Données utilisateur formatées:', userData);
            setUserData(userData);
          } else {
            // Si l'utilisateur n'existe pas encore en base
            console.log('Création d\'un profil par défaut pour le wallet');
            const defaultUser: ProfileUser = {
              id: account.address,
              email: `${account.address.slice(0, 8)}...@wallet`,
              username: `user_${account.address.slice(0, 8)}`,
              name: `User ${account.address.slice(0, 6)}`,
              walletAddress: account.address,
              address: account.address,
              role: 'ADMIN',
              profileImage: undefined,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            setUserData(defaultUser);
          }
        } else if (authUser) {
          // Utilisateur authentifié de manière classique
          console.log('Utilisation des données utilisateur classiques');
          const authUserData: ProfileUser = {
            ...authUser,
            name: authUser.username || 'Utilisateur',
            avatar: authUser.profileImage,
            profileImage: authUser.profileImage,
            walletAddress: authUser.walletAddress || '',
            address: authUser.address || '',
            role: getValidRole(authUser.role) || 'ADMIN' // Utiliser la fonction getValidRole pour s'assurer que le rôle est valide
          };
          setUserData(authUserData);
        } else {
          console.log('Aucun utilisateur connecté');
          setUserData(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Erreur lors de la récupération des données utilisateur:', err);
          setError('Impossible de charger les informations du profil. Veuillez réessayer plus tard.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingUser(false);
        }
      }
    };

    // Démarrer la récupération des données
    fetchUserData();

    // Nettoyage
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [isLoggedIn, account, authUser]);

  // Utiliser userData comme source de vérité pour l'affichage
  const user = userData;

  // Vérifier si l'utilisateur est connecté
  const isUserAuthenticated = isLoggedIn || isAuthenticated;
  
  // Afficher le chargement si nécessaire
  if (isLoading || isAuthLoading || isLoadingUser) {
    return (
      <ImmersiveLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">Chargement de votre profil...</p>
          <p className="text-sm text-gray-500 mt-2">Veuillez patienter</p>
        </div>
      </ImmersiveLayout>
    );
  }
  
  // Afficher les erreurs
  if (error) {
    return (
      <ImmersiveLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
          <div className="bg-red-100 p-4 rounded-full mb-4">
            <UserIcon className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oups !</h2>
          <p className="text-gray-600 mb-6 max-w-md">
            {error}
            <br />
            <span className="text-sm">Si le problème persiste, contactez le support.</span>
          </p>
          <div className="flex gap-4">
            <Button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              Réessayer
            </Button>
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </ImmersiveLayout>
    );
  }

  // Si pas d'utilisateur mais authentifié, afficher une erreur
  if (isUserAuthenticated && !user) {
    return (
      <ImmersiveLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <UserIcon className="w-16 h-16 text-secondary mb-4" />
          <h2 className="text-3xl font-extrabold mb-2 text-primary">Erreur de chargement</h2>
          <p className="text-lg text-secondary mb-6">Impossible de charger les informations du profil</p>
          <Button 
            onClick={() => window.location.reload()}
            className="btn-primary px-8 py-3 text-lg font-bold rounded-2xl shadow-xl hover:scale-105 transition"
          >
            Réessayer
          </Button>
        </div>
      </ImmersiveLayout>
    );
  }

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

  if (!isUserAuthenticated) {
    return (
      <ImmersiveLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <UserIcon className="w-16 h-16 text-secondary mb-4" />
          <h2 className="text-3xl font-extrabold mb-2 text-primary">Non authentifié</h2>
          <p className="text-lg text-secondary mb-6">Connectez-vous pour accéder à votre profil </p>
          <Link to="/unlock">
            <Button className="btn-primary px-8 py-3 text-lg font-bold rounded-2xl shadow-xl hover:scale-105 transition">Connexion</Button>
          </Link>
        </div>
      </ImmersiveLayout>
    );
  }

  // S'assurer que user n'est pas null avant d'afficher le contenu
  if (!user) {
    return (
      <ImmersiveLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <UserIcon className="w-16 h-16 text-secondary mb-4" />
          <h2 className="text-3xl font-extrabold mb-2 text-primary">Erreur de chargement</h2>
          <p className="text-lg text-secondary mb-6">Impossible de charger les informations du profil</p>
          <Button 
            onClick={() => window.location.reload()}
            className="btn-primary px-8 py-3 text-lg font-bold rounded-2xl shadow-xl hover:scale-105 transition"
          >
            Réessayer
          </Button>
        </div>
      </ImmersiveLayout>
    );
  }

  return (
    <ImmersiveLayout>
      <section className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8 py-8 px-4 animate-fade-in">
        {/* En-tête du profil */}
        <div className="w-full bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative group">
              <div className="absolute -inset-2 rounded-full blur-2xl bg-primary-light opacity-30 group-hover:opacity-50 transition" />
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl flex items-center justify-center bg-surface">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-16 h-16 text-secondary" />
                )}
                
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

            {/* Informations principales */}
            <div className="flex-1 text-center md:text-left">
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-primary">{user.name}</h1>
                <div className="inline-flex items-center mt-2 px-4 py-1 rounded-full text-sm font-medium bg-primary-light text-primary">
                  {user.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{user.email || 'Non spécifié'}</span>
                </div>
                
                {(isLoggedIn && account?.address) || user.walletAddress ? (
                  <div className="flex items-start text-gray-600">
                    <WalletIcon className="w-5 h-5 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    <span className="break-all">{(isLoggedIn && account?.address) || user.walletAddress || ''}</span>
                  </div>
                ) : null}
                
                {user?.createdAt && (
                  <div className="flex items-center text-gray-600">
                    <CalendarIcon className="w-5 h-5 mr-2 text-primary" />
                    <span>Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Bouton de déconnexion */}
            <Button 
              onClick={handleLogoutClick}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors mt-4 md:mt-0"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Statistiques et informations supplémentaires */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section Informations personnelles */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-primary mb-4">Informations personnelles</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Nom complet</h3>
                <p className="mt-1">{user.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1">{user.email}</p>
              </div>
              {(isLoggedIn && account?.address) || user.walletAddress ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Adresse du portefeuille</h3>
                  <p className="mt-1 font-mono text-sm break-all">{(isLoggedIn && account?.address) || user.walletAddress || ''}</p>
                  {isLoggedIn && account?.balance && (
                    <div className="mt-2">
                      <h3 className="text-sm font-medium text-gray-500">Solde</h3>
                      <p className="mt-1 font-mono">{account.balance} EGLD</p>
                    </div>
                  )}
                </div>
              ) : null}
              {'phone' in user && user.phone && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Téléphone</h3>
                  <p className="mt-1">{user.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Section Activité récente */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-primary mb-4">Activité récente</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Profil mis à jour</p>
                  <p className="text-sm text-gray-500">Il y a 2 jours</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Connexion réussie</p>
                  <p className="text-sm text-gray-500">Aujourd'hui à {new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Link to="/app/favorites" className="block">
            <Button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-primary border border-gray-200 rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              Mes favoris
            </Button>
          </Link>
          <Link to="/dashboard" className="block">
            <Button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-primary border border-gray-200 rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Tableau de bord
            </Button>
          </Link>
        </div>
      </section>
    </ImmersiveLayout>
  );
};

export default ProfilePage;
