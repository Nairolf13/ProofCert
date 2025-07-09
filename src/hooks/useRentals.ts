import type { Rental } from '../types/index';
import { useState, useEffect, useCallback } from 'react';
import { rentalApi } from '../api/rental';

export function useRentals() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRentals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await rentalApi.getAll();
      setRentals(data);
      return data;
    } catch (err) {
      console.error('Erreur lors du chargement des locations:', err);
      setError('Erreur lors du chargement des locations');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRentals();
  }, [fetchRentals]);

  return { 
    rentals, 
    isLoading, 
    error, 
    refetch: fetchRentals 
  };
}
