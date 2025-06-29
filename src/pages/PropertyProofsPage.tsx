import React from 'react';
import { useParams } from 'react-router-dom';
import { usePropertyProofs } from '../hooks/usePropertyProofs';

export const PropertyProofsPage: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const { proofs, isLoading, error } = usePropertyProofs(propertyId!);

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-4 md:px-8 animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 drop-shadow-sm">Preuves du bien</h1>
      {/* Liste des preuves du bien modernisée */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {proofs.map((proof) => (
          <div key={proof.id} className="border rounded-lg p-4 transition-shadow hover:shadow-lg">
            <div className="font-semibold text-lg">{proof.title}</div>
            <div className="text-gray-600">{proof.contentType}</div>
            {/* <div className="text-sm text-gray-500">{proof.description}</div> */}
            <div className="text-xs text-gray-400">Hash : {proof.hash}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
