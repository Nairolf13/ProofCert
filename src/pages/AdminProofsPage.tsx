import React, { useEffect } from 'react';
import { useProofs } from '../hooks/useProofs';
import { ImmersiveLayout } from '../components/ImmersiveLayout';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../hooks/AuthContext';

export const AdminProofsPage: React.FC = () => {
  const { user: classicUser } = useAuthContext();
  const isAdmin = classicUser?.role === 'ADMIN';
  const { proofs, isLoading, refreshProofs } = useProofs({ 
    includeDeleted: true,
    autoFetch: true
  });
  
  const activeProofs = proofs.filter(p => !p.deletedAt);
  const archivedProofs = proofs.filter(p => !!p.deletedAt);
  
  // Rafraîchir les preuves au montage du composant
  useEffect(() => {
    refreshProofs();
  }, [refreshProofs]);

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
