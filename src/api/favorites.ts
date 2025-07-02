import api from './user';
import type { Favorite } from '../types';

export const favoritesApi = {
  // Récupérer tous les favoris de l'utilisateur connecté
  getAll: async (): Promise<Favorite[]> => {
    const response = await api.get('/favorites');
    return response.data;
  },

  // Ajouter une propriété aux favoris
  add: async (propertyId: string): Promise<Favorite> => {
    const response = await api.post('/favorites', { propertyId });
    return response.data;
  },

  // Supprimer une propriété des favoris
  remove: async (propertyId: string): Promise<void> => {
    await api.delete(`/favorites/${propertyId}`);
  },

  // Vérifier si une propriété est en favori
  isFavorite: async (propertyId: string): Promise<boolean> => {
    try {
      const response = await api.get(`/favorites/check/${propertyId}`);
      return response.data.isFavorite;
    } catch {
      return false;
    }
  },

  // Basculer le statut favori d'une propriété
  toggle: async (propertyId: string): Promise<{ isFavorite: boolean; favorite?: Favorite }> => {
    const response = await api.post(`/favorites/toggle`, { propertyId });
    return response.data;
  },
};
