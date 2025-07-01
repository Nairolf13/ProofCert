import type { Rental } from '../types/index';
import { useState, useEffect } from 'react';
import { rentalApi } from '../api/rental';

export function useRentals() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    rentalApi.getAll()
      .then(setRentals)
      .catch(() => setError('Erreur lors du chargement des locations'))
      .finally(() => setIsLoading(false));
  }, []);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await rentalApi.getAll();
      setRentals(data);
    } catch {
      setError('Erreur lors du chargement des locations');
    } finally {
      setIsLoading(false);
    }
  };

  return { rentals, isLoading, error, refetch };
}
