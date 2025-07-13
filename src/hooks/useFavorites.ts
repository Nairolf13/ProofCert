import { useState, useEffect } from 'react';
import { favoritesApi } from '../api/favorites';
import { useAuthContext } from './AuthContext';
import type { Property, Favorite } from '../types';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthContext();

  // Charger les favoris depuis l'API uniquement si connecté
  useEffect(() => {
    if (!isAuthenticated) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }
    
    const loadFavorites = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const favoritesData = await favoritesApi.getAll();
        // S'assurer que favoritesData est un tableau
        const safeFavorites = Array.isArray(favoritesData) ? favoritesData : [];
        setFavorites(safeFavorites);
      } catch (error) {
        console.error('Erreur lors du chargement des favoris:', error);
        setError('Erreur lors du chargement des favoris');
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [isAuthenticated]);

  // Ajouter aux favoris
  const addToFavorites = async (propertyId: string) => {
    try {
      const newFavorite = await favoritesApi.add(propertyId);
      setFavorites(prev => [...prev, newFavorite]);
      return newFavorite;
    } catch (error) {
      console.error('Erreur lors de l\'ajout aux favoris:', error);
      throw error;
    }
  };

  // Supprimer des favoris
  const removeFromFavorites = async (propertyId: string) => {
    try {
      await favoritesApi.remove(propertyId);
      setFavorites(prev => prev.filter(fav => fav.propertyId !== propertyId));
    } catch (error) {
      console.error('Erreur lors de la suppression du favori:', error);
      throw error;
    }
  };

  // Basculer le statut favori
  const toggleFavorite = async (propertyId: string) => {
    try {
      if (!propertyId) {
        console.error('Property ID is missing!');
        return;
      }
      
      const result = await favoritesApi.toggle(propertyId);
      
      if (result.isFavorite && result.favorite) {
        // Ajouté aux favoris
        setFavorites(prev => [...prev, result.favorite!]);
      } else {
        // Supprimé des favoris
        setFavorites(prev => prev.filter(fav => fav.propertyId !== propertyId));
      }
    } catch (error) {
      console.error('Erreur lors du basculement du favori:', error);
      throw error;
    }
  };

  // Vérifier si une propriété est en favori
  const isFavorite = (propertyId: string): boolean => {
    return favorites.some(fav => fav.propertyId === propertyId);
  };

  // Obtenir les propriétés favorites depuis une liste
  const getFavoriteProperties = (properties: Property[]): Property[] => {
    const favoriteIds = favorites.map(fav => fav.propertyId);
    return properties.filter(property => favoriteIds.includes(property.id));
  };

  // Obtenir les favoris avec les données des propriétés
  const getFavoritesWithProperties = (): Favorite[] => {
    // S'assurer de toujours retourner un tableau
    return Array.isArray(favorites) ? favorites : [];
  };

  // S'assurer que favorites est toujours un tableau avant d'utiliser map
  const safeFavorites = Array.isArray(favorites) ? favorites : [];
  
  return {
    favorites: safeFavorites.map(fav => fav.propertyId), // Pour compatibilité avec l'ancien code
    favoritesData: safeFavorites, // Nouveaux favoris avec données complètes
    isLoading,
    error,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    getFavoriteProperties,
    getFavoritesWithProperties,
  };
};
