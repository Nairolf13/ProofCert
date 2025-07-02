import React from 'react';
import { useProofs } from '../hooks/useProofs';
import { ProofType } from '../types';
import {
  PhotoIcon,
  DocumentTextIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { ImmersiveLayout } from '../components/ImmersiveLayout';
import { Button } from '../components/Button';

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
  const { proofs, isLoading } = useProofs();
  const filteredProofs = proofs;

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
            <Button className="gradient-primary text-white px-8 py-3 rounded-xl font-bold shadow hover:scale-105 transition text-lg">
              Ajouter une preuve
            </Button>
          </Link>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center py-24">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-400 mb-6"></div>
              <p className="text-gray-600 text-xl font-serif">Chargement des preuves...</p>
            </div>
          ) : filteredProofs.length === 0 ? (
            <div className="col-span-full text-center text-secondary text-2xl font-serif py-24">
              Aucune preuve pour le moment.
            </div>
          ) : (
            filteredProofs.map((proof) => (
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
