import type { Property } from '../types/index';
import { useState, useEffect, useCallback } from 'react';
import { propertyApi } from '../api/property';

export function usePublicProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(() => {
    setIsLoading(true);
    propertyApi.getAllPublic()
      .then(setProperties)
      .catch((error) => {
        console.error('Erreur lors du chargement des propriétés:', error);
        // Si erreur 403, probablement un problème d'authentification
        if (error.response?.status === 403 || error.response?.status === 401) {
          // Rediriger vers la page de connexion ou nettoyer le token expiré
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/auth';
          return;
        }
        setError('Erreur lors du chargement des biens');
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return { properties, isLoading, error, refresh: fetchProperties };
}
