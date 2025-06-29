import React from 'react';
import { useProofs } from '../hooks/useProofs';
import { ProofType } from '../types';
import { Card, CardContent } from '../components/Card';
import {
  PhotoIcon,
  DocumentTextIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

function formatDate(date: string) {
  return date.split('T')[0];
}

function getProofIcon(type: ProofType) {
  switch (type) {
    case ProofType.IMAGE:
      return <PhotoIcon className="w-5 h-5 mr-1" />;
    case ProofType.TEXT:
      return <DocumentTextIcon className="w-5 h-5 mr-1" />;
    case ProofType.VIDEO:
      return <VideoCameraIcon className="w-5 h-5 mr-1" />;
    default:
      return <DocumentTextIcon className="w-5 h-5 mr-1" />;
  }
}

export const ProofsPage: React.FC = () => {
  const { proofs, isLoading } = useProofs();

  const filteredProofs = proofs; // Pas de filtre appliqué

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-4 md:px-8 animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 drop-shadow-sm">
        Mes preuves
      </h1>
      {/* Liste des preuves modernisée */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="text-center py-12" style={{ gridColumn: '1 / -1' }}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading proofs...</p>
          </div>
        ) : (
          filteredProofs.map((proof) => (
            <Link key={proof.id} to={`/proof/${proof.id}`} className="block group">
              <Card className="overflow-hidden group-hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="mb-4">
                    <div className="w-full h-48 bg-gray-200 rounded-xl mb-2 flex items-center justify-center overflow-hidden">
                      {proof.contentType === ProofType.IMAGE && proof.ipfsHash ? (
                        <img
                          src={
                            proof.ipfsHash.startsWith('http')
                              ? proof.ipfsHash
                              : `https://ipfs.io/ipfs/${proof.ipfsHash}`
                          }
                          alt={proof.title || 'Proof image'}
                          className="object-cover w-full h-full"
                          loading="lazy"
                        />
                      ) : (
                        getProofIcon(proof.contentType)
                      )}
                    </div>
                  </div>
                  <div className="font-semibold text-lg mb-1">
                    Proof of {proof.contentType.toLowerCase()}
                  </div>
                  <div className="text-primary-600 text-base mb-2">
                    {proof.contentType.charAt(0) +
                      proof.contentType.slice(1).toLowerCase()}
                    {' · '}
                    {formatDate(proof.timestamp)}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};
