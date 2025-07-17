import React from 'react';
import { useProofs } from '../hooks/useProofs';
import { ProofType } from '../types';
import {
  PhotoIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { ArrowPathIcon as Loader2 } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { ImmersiveLayout } from '../components/ImmersiveLayout';
import { Button } from '../components/Button';
import { useAuthContext } from '../hooks/AuthContext';
import { useMultiversXAuth } from '../hooks/useMultiversXAuth';

function formatDate(date: string) {
  return date.split('T')[0];
}

function getProofIcon(contentType: ProofType) {
  switch (contentType) {
    case ProofType.IMAGE:
      return <PhotoIcon className="w-5 h-5 mr-1" />;
    case ProofType.TEXT:
      return <DocumentTextIcon className="w-5 h-5 mr-1" />;
    case ProofType.VIDEO:
      return <VideoCameraIcon className="w-5 h-5 mr-1" />;
    case ProofType.AUDIO:
      return <VideoCameraIcon className="w-5 h-5 mr-1" />; 
    case ProofType.DOCUMENT:
      return <DocumentTextIcon className="w-5 h-5 mr-1" />;
    default:
      return <DocumentTextIcon className="w-5 h-5 mr-1" />;
  }
}

export const ProofsPage: React.FC = () => {
  const { proofs, isLoading } = useProofs({ filterByUser: true });
  const { user: classicUser } = useAuthContext();
  const { user: web3User } = useMultiversXAuth();

  // Debug log (optionnel, à retirer en prod)
  // console.log('📋 ProofsPage - Données des preuves:', {
  //   nbProofs: proofs.length,
  //   classicUserId: classicUser?.id,
  //   web3UserAddress: web3User?.address,
  //   isWeb3LoggedIn: !!web3User
  // });

  return (
    <ImmersiveLayout>
      <section className="w-full max-w-5xl mx-auto py-14 px-4 md:px-8 animate-fade-in">
        <header className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-5xl md:text-6xl font-serif font-extrabold text-primary drop-shadow-lg tracking-tight mb-2 animate-fade-in-slow">
              Mes preuves
            </h1>
            <p className="text-lg md:text-xl text-secondary font-serif max-w-2xl">
              Retrouvez toutes vos preuves certifiées, stockées de façon immuable et
              partageables en un clic. Expérience magazine, sécurité premium.
            </p>
          </div>
          <Link to="/add-proof">
            <Button variant="primary" size="lg" className="w-full md:w-auto">
              <PlusIcon className="w-5 h-5 mr-2" />
              Nouvelle preuve
            </Button>
          </Link>
        </header>
        {/* Affichage des preuves, loading et empty state */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center py-24">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
              <p className="text-gray-600 text-xl font-serif">Chargement des preuves...</p>
            </div>
          ) : proofs.length === 0 ? (
            <div className="col-span-full text-center text-secondary text-2xl font-serif py-24">
              Aucune preuve pour le moment.
              <div className="mt-4 text-base text-gray-500">
                {(classicUser || web3User?.address)
                  ? "Vous n'avez pas encore créé de preuve ou vous n'êtes peut-être pas connecté avec le bon compte."
                  : "Veuillez vous connecter pour voir vos preuves."}
                {web3User?.address && (
                  <p className="mt-2">Adresse du wallet connecté: {web3User.address}</p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
                <Link to="/add-proof">
                  <Button variant="primary">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Créer une preuve
                  </Button>
                </Link>
                {!(classicUser || web3User?.address) && (
                  <Link to="/login">
                    <Button variant="outline">
                      <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                      Se connecter
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            proofs.map((proof) => (
              <Link key={proof.id} to={`/proof/${proof.id}`} className="group">
                <div className="relative card-shadow rounded-3xl p-8 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.015] cursor-pointer">
                  <div className="absolute -inset-2 rounded-3xl bg-primary-light opacity-20 blur-lg -z-10" />
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-light shadow text-xl text-primary">
                      {getProofIcon(proof.contentType)}
                    </span>
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
                    <span>{formatDate(proof.createdAt)}</span>
                  </div>
                  <span className="absolute top-4 right-4 bg-primary-light text-primary font-bold px-3 py-1 rounded-xl text-xs shadow">
                    {proof.contentType}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </ImmersiveLayout>
  );
};
