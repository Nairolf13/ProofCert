import React, { useEffect, useState } from 'react';
import { useProofs } from '../hooks/useProofs';
import { ImmersiveLayout } from '../components/ImmersiveLayout';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../hooks/AuthContext';
import { useMultiversXAuth } from '../hooks/useMultiversXAuth';
import userApi from '../api/user';

export const AdminProofsPage: React.FC = () => {
  const { user: classicUser, updateUser } = useAuthContext();
  const { user: web3User, address, isLoggedIn: isWeb3LoggedIn } = useMultiversXAuth();
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Vérifier les droits d'administrateur
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        console.log('Vérification des droits administrateur...');
        
        // Vérifier d'abord si l'utilisateur est connecté via Web3
        if (isWeb3LoggedIn && address) {
          console.log('Vérification des droits administrateur pour le wallet:', address);
          const response = await userApi.get(`/by-wallet/${address}`);
          
          if (response.data?.success && response.data?.exists && response.data?.data) {
            const userData = response.data.data;
            console.log('Données utilisateur du serveur:', userData);
            
            // Mettre à jour l'état local si l'utilisateur est admin
            const userIsAdmin = userData.role === 'ADMIN';
            setIsAdmin(userIsAdmin);
            
            // Mettre à jour le contexte d'authentification si nécessaire
            if (classicUser && classicUser.role !== userData.role) {
              console.log('Mise à jour du rôle dans le contexte d\'authentification');
              updateUser({ ...classicUser, role: userData.role });
            }
            
            // Mettre à jour le localStorage
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
              const parsedUser = JSON.parse(savedUser);
              if (parsedUser.walletAddress === address && parsedUser.role !== userData.role) {
                console.log('Mise à jour du rôle dans le localStorage');
                parsedUser.role = userData.role;
                localStorage.setItem('user', JSON.stringify(parsedUser));
              }
            }
            
            setIsCheckingAdmin(false);
            return;
          }
        }
        
        // Si l'utilisateur est connecté via l'authentification classique
        if (classicUser) {
          console.log('Utilisateur connecté via authentification classique:', classicUser);
          const userIsAdmin = classicUser.role === 'ADMIN';
          setIsAdmin(userIsAdmin);
          setIsCheckingAdmin(false);
          return;
        }
        
        // Si on arrive ici, l'utilisateur n'est pas admin
        console.log('Aucun utilisateur administrateur trouvé');
        setIsAdmin(false);
        setIsCheckingAdmin(false);
        
      } catch (error) {
        console.error('Erreur lors de la vérification des droits administrateur:', error);
        setIsAdmin(false);
        setIsCheckingAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, [classicUser, updateUser, address, isWeb3LoggedIn]);
  
  console.log('AdminProofsPage - État de l\'authentification:', {
    classicUser: {
      id: classicUser?.id,
      email: classicUser?.email,
      role: classicUser?.role,
      walletAddress: classicUser?.walletAddress
    },
    web3User: {
      address: web3User?.address,
      role: web3User?.role,
      walletAddress: web3User?.walletAddress
    },
    isAdmin,
    address,
    isWeb3LoggedIn
  });
  const { proofs, isLoading, refreshProofs } = useProofs({ 
    includeDeleted: true,
    autoFetch: false // Désactiver le chargement automatique
  });
  
  // Rafraîchir les preuves une fois que la vérification de l'administrateur est terminée
  useEffect(() => {
    if (!isCheckingAdmin) {
      console.log('Vérification administrateur terminée, rafraîchissement des preuves...');
      refreshProofs();
    }
  }, [isCheckingAdmin, refreshProofs]);
  
  const activeProofs = proofs.filter(p => !p.deletedAt);
  const archivedProofs = proofs.filter(p => !!p.deletedAt);
  
  // Vérifier les droits d'administrateur au chargement du composant
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Si l'utilisateur est connecté via Web3, vérifier son statut administrateur
        if (address) {
          console.log('Vérification du statut administrateur pour l\'adresse:', address);
          const response = await userApi.get(`/by-wallet/${address}`);
          
          if (response.data?.success && response.data?.exists && response.data?.data) {
            const userData = response.data.data;
            console.log('Données utilisateur du serveur:', userData);
            
            // Mettre à jour l'utilisateur dans le contexte d'authentification
            if (userData.role === 'ADMIN' && classicUser) {
              console.log('Mise à jour du rôle administrateur dans le contexte');
              updateUser({ ...classicUser, role: 'ADMIN' });
            }
            
            // Mettre à jour le localStorage
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
              const parsedUser = JSON.parse(savedUser);
              if (parsedUser.walletAddress === address && userData.role === 'ADMIN') {
                parsedUser.role = 'ADMIN';
                localStorage.setItem('user', JSON.stringify(parsedUser));
              }
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du statut administrateur:', error);
      } finally {
        setIsCheckingAdmin(false);
      }
    };
    
    checkAdminStatus();
    refreshProofs();
  }, [address, updateUser, classicUser, refreshProofs]);
  
  // Afficher un indicateur de chargement pendant la vérification des droits
  if (isCheckingAdmin) {
    return (
      <ImmersiveLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </ImmersiveLayout>
    );
  }

  if (!isAdmin) {
    return (
      <ImmersiveLayout>
        <div className="w-full max-w-2xl mx-auto py-24 text-center text-2xl text-red-500 font-bold animate-fade-in">
          Accès refusé : cette page est réservée à l’administrateur.
        </div>
      </ImmersiveLayout>
    );
  }

  return (
    <ImmersiveLayout>
      <section className="w-full max-w-6xl mx-auto py-14 px-4 md:px-8 animate-fade-in">
        <header className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-5xl md:text-6xl font-serif font-extrabold text-primary drop-shadow-lg tracking-tight mb-2 animate-fade-in-slow">
              Administration des preuves
            </h1>
            <p className="text-lg md:text-xl text-secondary font-serif max-w-2xl">
              Toutes les preuves, y compris archivées. Filtrez, consultez, et restaurez si besoin.
            </p>
          </div>
        </header>
        <h2 className="text-2xl font-bold mb-4">Preuves actives</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center py-24">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-400 mb-6"></div>
              <p className="text-gray-600 text-xl font-serif">Chargement des preuves...</p>
            </div>
          ) : activeProofs.length === 0 ? (
            <div className="col-span-full text-center text-secondary text-2xl font-serif py-24">
              Aucune preuve active.
            </div>
          ) : (
            activeProofs.map((proof) => (
              <Link key={proof.id} to={`/proof/${proof.id}`} className="group">
                <div className="relative card-shadow rounded-3xl p-8 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.015] cursor-pointer">
                  <div className="absolute -inset-2 rounded-3xl bg-primary-light opacity-20 blur-lg -z-10" />
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-bold font-serif text-primary group-hover:text-accent transition-colors">
                      {proof.title || 'Preuve sans titre'}
                    </span>
                  </div>
                  <div className="text-secondary font-serif text-base mb-1 truncate">
                    {proof.content || '—'}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-secondary font-mono">
                    <span>Hash :</span>
                    <span className="truncate max-w-[120px]">{proof.hash}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-secondary font-mono">
                    <span>Ajoutée le</span>
                    <span>{proof.createdAt.split('T')[0]}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
        <h2 className="text-2xl font-bold mb-4">Archives (preuves supprimées)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center py-24">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-400 mb-6"></div>
              <p className="text-gray-600 text-xl font-serif">Chargement des archives...</p>
            </div>
          ) : archivedProofs.length === 0 ? (
            <div className="col-span-full text-center text-secondary text-2xl font-serif py-24">
              Aucune preuve archivée.
            </div>
          ) : (
            archivedProofs.map((proof) => (
              <Link key={proof.id} to={`/proof/${proof.id}`} className="group opacity-60">
                <div className="relative card-shadow rounded-3xl p-8 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.01] cursor-pointer border border-dashed border-gray-300">
                  <div className="absolute -inset-2 rounded-3xl bg-gray-200 opacity-20 blur-lg -z-10" />
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-bold font-serif text-gray-500 group-hover:text-accent transition-colors">
                      {proof.title || 'Preuve sans titre'}
                    </span>
                  </div>
                  <div className="text-secondary font-serif text-base mb-1 truncate">
                    {proof.content || '—'}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-secondary font-mono">
                    <span>Hash :</span>
                    <span className="truncate max-w-[120px]">{proof.hash}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-secondary font-mono">
                    <span>Supprimée le</span>
                    <span>{proof.deletedAt?.split('T')[0]}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </ImmersiveLayout>
  );
};

export default AdminProofsPage;
