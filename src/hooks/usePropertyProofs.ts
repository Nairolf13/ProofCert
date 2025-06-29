import type { Proof } from '../types/index';
import { useState, useEffect } from 'react';
import { propertyProofApi } from '../api/propertyProof';

export function usePropertyProofs(propertyId: string) {
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) return;
    propertyProofApi.getByProperty(propertyId)
      .then(setProofs)
      .catch(() => setError('Erreur lors du chargement des preuves'))
      .finally(() => setIsLoading(false));
  }, [propertyId]);

  return { proofs, isLoading, error };
}
