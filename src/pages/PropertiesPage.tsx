import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyApi } from '../api/property';
import type { Property } from '../types';
import { Button } from '../components/Button';
import { ImmersiveLayout } from '../components/ImmersiveLayout';
import { FavoriteButton } from '../components/FavoriteButton';
import { useFavorites } from '../hooks/useFavorites';
import { useAuthContext } from '../hooks/AuthContext';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  CurrencyEuroIcon,
  HomeIcon,
  Squares2X2Icon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export const PropertiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useAuthContext();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  
  // Listes uniques pour les filtres
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    fetchProperties();
  }, [user]); // refetch si user change

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      // On ne filtre plus côté client : le backend renvoie tout pour l'admin, seulement les biens de l'utilisateur sinon
      const data = await propertyApi.getAll();
      setProperties(data);
      setFilteredProperties(data);
      // Extraire les pays et villes uniques (filtrer les undefined)
      const uniqueCountries = [...new Set(data.map(p => p.country).filter((country): country is string => Boolean(country)))];
      const uniqueCities = [...new Set(data.map(p => p.city).filter((city): city is string => Boolean(city)))];
      setCountries(uniqueCountries);
      setCities(uniqueCities);
    } catch (err) {
      setError('Erreur lors du chargement des propriétés');
      console.error('Error fetching properties:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de filtrage
  useEffect(() => {
    let filtered = properties;

    // Recherche textuelle
    if (searchQuery) {
      filtered = filtered.filter(property =>
        property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par pays
    if (selectedCountry) {
      filtered = filtered.filter(property => property.country === selectedCountry);
    }

    // Filtre par ville
    if (selectedCity) {
      filtered = filtered.filter(property => property.city === selectedCity);
    }

    // Filtre par prix
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(property => {
        if (!property.price) return false;
        const price = property.price;
        const min = priceRange.min ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        return price >= min && price <= max;
      });
    }

    setFilteredProperties(filtered);
  }, [properties, searchQuery, selectedCountry, selectedCity, priceRange]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCountry('');
    setSelectedCity('');
    setPriceRange({ min: '', max: '' });
  };

  const formatPrice = (price: number, period: string) => {
    const periodLabels = {
      DAY: '/jour',
      WEEK: '/semaine',
      MONTH: '/mois'
    };
    return `${price}€ ${periodLabels[period as keyof typeof periodLabels] || ''}`;
  };

  if (isLoading) {
    return (
      <ImmersiveLayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
        </div>
      </ImmersiveLayout>
    );
  }

  if (error) {
    return (
      <ImmersiveLayout>
        <div className="text-error text-center font-bold py-16 text-2xl">{error}</div>
      </ImmersiveLayout>
    );
  }

  return (
    <ImmersiveLayout>
      <section className="w-full max-w-7xl mx-auto flex flex-col gap-8 items-center animate-fade-in">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-extrabold text-center text-primary drop-shadow-lg mb-4 tracking-tight">
            Découvrez nos Propriétés
          </h1>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Trouvez la propriété parfaite parmi {properties.length} biens disponibles à la location
          </p>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="card-shadow rounded-3xl p-6 mb-8 w-full max-w-5xl">
          {/* Recherche principale */}
          <div className="relative mb-4">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" />
            <input
              type="text"
              placeholder="Rechercher par titre, adresse ou description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors text-lg"
            />
          </div>

          {/* Bouton pour afficher/masquer les filtres */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-light text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
            >
              <FunnelIcon className="w-5 h-5" />
              Filtres avancés
            </button>
            
            {(selectedCountry || selectedCity || priceRange.min || priceRange.max) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
                Effacer les filtres
              </button>
            )}
          </div>

          {/* Filtres détaillés */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-purple-400 focus:outline-none"
                >
                  <option value="">Tous les pays</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-purple-400 focus:outline-none"
                >
                  <option value="">Toutes les villes</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix minimum</label>
                <input
                  type="number"
                  placeholder="Prix min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix maximum</label>
                <input
                  type="number"
                  placeholder="Prix max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-purple-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Résultats */}
          <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
            {filteredProperties.length} propriété{filteredProperties.length > 1 ? 's' : ''} trouvée{filteredProperties.length > 1 ? 's' : ''}
          </div>
        </div>
        {/* Grille des propriétés */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
              <HomeIcon className="w-16 h-16 text-secondary" />
            </div>
            <h3 className="text-2xl font-bold text-secondary mb-2">Aucune propriété trouvée</h3>
            <p className="text-secondary text-lg">Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {filteredProperties.map((property, idx) => (
              <div
                key={property.id}
                className="card-shadow rounded-3xl overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer"
                style={{ animationDelay: `${idx * 60}ms` }}
                onClick={() => navigate(`/properties/${property.id}`)}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  {property.photos && property.photos.length > 0 ? (
                    <img
                      src={property.photos[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-secondary flex items-center justify-center">
                      <HomeIcon className="w-16 h-16 text-secondary" />
                    </div>
                  )}
                  
                  {/* Bouton favoris */}
                  <div className="absolute top-4 left-4">
                    <FavoriteButton
                      propertyId={property.id}
                      isFavorite={isFavorite(property.id)}
                      onToggle={toggleFavorite}
                      variant="overlay"
                      size="md"
                    />
                  </div>
                  
                  {/* Badge prix */}
                  <div className="absolute top-4 right-4">
                    <div className="px-3 py-1 bg-success text-white rounded-full text-sm font-bold shadow-lg">
                      {formatPrice(property.price || 0, property.pricePeriod || 'MONTH')}
                    </div>
                  </div>

                  {/* Badge nombre de photos */}
                  {property.photos && property.photos.length > 1 && (
                    <div className="absolute bottom-4 left-4">
                      <div className="px-2 py-1 bg-surface/80 text-secondary rounded-full text-xs font-bold shadow">
                        {property.photos.length} photos
                      </div>
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-800 truncate">
                      {property.title || 'Propriété sans titre'}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      property.isAvailable 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-red-100 text-red-600 border border-red-200'
                    }`}>
                      {property.isAvailable ? 'Disponible' : 'Non disponible'}
                    </span>
                  </div>
                  
                  {property.address && (
                    <div className="flex items-center gap-1 text-gray-500 mb-3">
                      <MapPinIcon className="w-4 h-4" />
                      <span className="text-sm truncate">{property.address}, {property.city}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                    <div><span className="font-semibold">Région:</span> {property.region}</div>
                    <div><span className="font-semibold">Pays:</span> {property.country}</div>
                    {property.area && (
                      <div className="flex items-center gap-1 text-primary-600">
                        <Squares2X2Icon className="w-4 h-4" />
                        <span className="font-semibold">{property.area}m²</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-primary-600">
                      <CurrencyEuroIcon className="w-4 h-4" />
                      <span className="font-semibold">{property.price}€</span>
                    </div>
                  </div>

                  {property.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 overflow-hidden">
                      {property.description}
                    </p>
                  )}

                  {/* Photos miniatures */}
                  {property.photos && property.photos.length > 1 && (
                    <div className="flex gap-2 mb-4">
                      {property.photos.slice(1, 4).map((src, i) => (
                        <img 
                          key={i} 
                          src={src} 
                          alt={`Photo ${i + 2}`} 
                          className="w-12 h-12 object-cover rounded-lg border border-gray-100 shadow-sm" 
                        />
                      ))}
                      {property.photos.length > 4 && (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500 font-semibold">
                          +{property.photos.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <Button
                    variant="primary"
                    className="w-full gradient-primary text-white font-bold shadow hover:scale-105 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/properties/${property.id}`);
                    }}
                  >
                    Découvrir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </ImmersiveLayout>
  );
};
