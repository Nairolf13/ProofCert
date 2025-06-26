import React, { useState } from 'react';
import { useProofs } from '../hooks/useProofs';
import { ProofType } from '../types';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import {
  PhotoIcon,
  DocumentTextIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const typeFilters = [
  { label: 'All', value: undefined },
  { label: 'Text', value: ProofType.TEXT },
  { label: 'Image', value: ProofType.IMAGE },
  { label: 'Video', value: ProofType.VIDEO },
];

const dateFilters = [
  { label: 'All', value: undefined },
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
];

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
  const [typeFilter, setTypeFilter] = useState<ProofType | undefined>();
  const [dateFilter, setDateFilter] = useState<number | undefined>();

  const filteredProofs = proofs.filter((proof) => {
    const typeMatch = !typeFilter || proof.contentType === typeFilter;
    const dateMatch = (() => {
      if (!dateFilter) return true;
      const proofDate = new Date(proof.timestamp);
      const now = new Date();
      const diffDays = (now.getTime() - proofDate.getTime()) / (1000 * 3600 * 24);
      return diffDays <= dateFilter;
    })();
    return typeMatch && dateMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Proofs</h1>
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {typeFilters.map((f) => (
            <Button
              key={f.label}
              variant={typeFilter === f.value ? 'primary' : 'outline'}
              className="rounded-full px-6"
              onClick={() => setTypeFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {dateFilters.map((f) => (
            <Button
              key={f.label}
              variant={dateFilter === f.value ? 'primary' : 'outline'}
              className="rounded-full px-6"
              onClick={() => setDateFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading proofs...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {filteredProofs.map((proof) => (
              <Link key={proof.id} to={`/proof/${proof.id}`} className="block group">
                <Card className="overflow-hidden group-hover:shadow-lg transition-shadow">
                  <CardContent>
                    <div className="mb-4">
                      <div className="w-full h-48 bg-gray-200 rounded-xl mb-2 flex items-center justify-center overflow-hidden">
                        {proof.contentType === ProofType.IMAGE && proof.ipfsHash ? (
                          <img
                            src={proof.ipfsHash.startsWith('http') ? proof.ipfsHash : `https://ipfs.io/ipfs/${proof.ipfsHash}`}
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
                      {proof.contentType.charAt(0) + proof.contentType.slice(1).toLowerCase()} · {formatDate(proof.timestamp)}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
