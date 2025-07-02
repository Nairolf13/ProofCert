import React from 'react';
import { Link } from 'react-router-dom';
import { ImmersiveLayout } from '../components/ImmersiveLayout';
import { Button } from '../components/Button';
import { FavoriteButton } from '../components/FavoriteButton';
import { useFavorites } from '../hooks/useFavorites';
import { HeartIcon, StarIcon, HomeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import type { Favorite } from '../types/index';

export const FavoritesPage: React.FC = () => {
  const { favoritesData, isLoading: isFavoritesLoading, error, toggleFavorite, isFavorite } = useFavorites();

  if (isFavoritesLoading) {
    return (
      <ImmersiveLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
        </div>
      </ImmersiveLayout>
    );
  }

  if (error) {
    return (
      <ImmersiveLayout>
        <div className="text-center py-20">
          <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <HeartIcon className="w-16 h-16 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-red-600 mb-2">Erreur</h3>
          <p className="text-red-500 text-lg mb-6">{error}</p>
          <Button 
            variant="primary" 
            size="lg" 
            className="px-8 py-3"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </Button>
        </div>
      </ImmersiveLayout>
    );
  }

  return (
    <ImmersiveLayout>
      <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HeartSolidIcon className="w-10 h-10 text-red-500" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-primary">
              Mes favoris
            </h1>
          </div>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Retrouvez ici tous les logements que vous avez ajoutés à vos favoris
          </p>
        </div>

        {/* Contenu */}
        {favoritesData.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartIcon className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">Aucun favori pour le moment</h3>
            <p className="text-gray-500 text-lg mb-6">
              Explorez nos propriétés et ajoutez vos coups de cœur à vos favoris !
            </p>
            <Link to="/dashboard">
              <Button variant="primary" size="lg" className="px-8 py-3">
                Découvrir des logements
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoritesData.map((favorite) => (
              <FavoriteCard 
                key={favorite.id} 
                favorite={favorite} 
                onToggleFavorite={toggleFavorite}
                isFavorite={isFavorite(favorite.propertyId)}
              />
            ))}
          </div>
        )}

        {/* Actions rapides */}
        {favoritesData.length > 0 && (
          <div className="text-center pt-8 border-t border-gray-200">
            <Link to="/dashboard">
              <Button variant="secondary" size="lg" className="px-8 py-3">
                Découvrir plus de logements
              </Button>
            </Link>
          </div>
        )}
      </div>
    </ImmersiveLayout>
  );
};

// Composant pour une carte de favori
const FavoriteCard: React.FC<{ 
  favorite: Favorite; 
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
}> = ({ favorite, onToggleFavorite, isFavorite }) => {
  const property = favorite.property;
  
  if (!property) {
    return null;
  }

  return (
    <div className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {property.photos && property.photos.length > 0 ? (
          <img 
            src={property.photos[0]} 
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.setAttribute('style', 'display: flex;');
            }}
          />
        ) : null}
        
        {/* Fallback quand il n'y a pas d'image */}
        <div 
          className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-light to-primary-500"
          style={{ display: property.photos && property.photos.length > 0 ? 'none' : 'flex' }}
        >
          <HomeIcon className="w-16 h-16 text-white" />
        </div>
        
        {/* Bouton favoris */}
        <div className="absolute top-3 right-3">
          <FavoriteButton
            propertyId={property.id}
            isFavorite={isFavorite}
            onToggle={onToggleFavorite}
            variant="default"
            size="md"
          />
        </div>
      </div>
      
      {/* Contenu */}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 truncate">{property.title}</h3>
          <div className="flex items-center gap-1">
            <StarIcon className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-600">4.8</span>
          </div>
        </div>
        
        {property.city && (
          <div className="flex items-center gap-1 text-gray-500">
            <MapPinIcon className="w-4 h-4" />
            <span className="text-sm truncate">{property.city}, {property.country}</span>
          </div>
        )}
        
        {property.description && (
          <p className="text-sm text-gray-500 truncate">
            {property.description}
          </p>
        )}
        
        <div className="flex items-center justify-between pt-2">
          <div className="text-lg font-bold text-gray-900">
            {property.price}€
            <span className="text-sm font-normal text-gray-600">
              /{property.pricePeriod === 'DAY' ? 'jour' : property.pricePeriod === 'WEEK' ? 'semaine' : 'mois'}
            </span>
          </div>
          {property.area && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {property.area}m²
            </span>
          )}
        </div>

        {/* Bouton voir les détails */}
        <Link 
          to={`/properties/${property.id}`}
          className="block w-full mt-3"
        >
          <Button variant="primary" size="sm" className="w-full">
            Voir les détails
          </Button>
        </Link>
      </div>
    </div>
  );
};
