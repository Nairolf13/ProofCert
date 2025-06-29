import type { Property } from '../types/index';
import { useState, useEffect, useCallback } from 'react';
import { propertyApi } from '../api/property';

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(() => {
    setIsLoading(true);
    propertyApi.getAll()
      .then(setProperties)
      .catch(() => setError('Erreur lors du chargement des biens'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return { properties, isLoading, error, refresh: fetchProperties };
}
