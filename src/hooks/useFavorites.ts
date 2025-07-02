import { useState, useEffect } from 'react';
import { favoritesApi } from '../api/favorites';
import type { Property, Favorite } from '../types';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les favoris depuis l'API au démarrage
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const favoritesData = await favoritesApi.getAll();
        setFavorites(favoritesData);
      } catch (error) {
        console.error('Erreur lors du chargement des favoris:', error);
        setError('Erreur lors du chargement des favoris');
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, []);

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
    return favorites;
  };

  return {
    favorites: favorites.map(fav => fav.propertyId), // Pour compatibilité avec l'ancien code
    favoritesData: favorites, // Nouveaux favoris avec données complètes
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
