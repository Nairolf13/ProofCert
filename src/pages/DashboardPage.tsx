import React, { useState, useMemo } from 'react';
import { ImmersiveLayout } from '../components/ImmersiveLayout';
import { Link } from 'react-router-dom';
import { usePublicProperties } from '../hooks/usePublicProperties';
import { Button } from '../components/Button';
import { FavoriteButton } from '../components/FavoriteButton';
import { useFavorites } from '../hooks/useFavorites';
import { StarIcon, MagnifyingGlassIcon, CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { Property } from '../types/index';

export const DashboardPage: React.FC = () => {
  const { properties, isLoading: isLoadingProperties } = usePublicProperties();
  
  // États pour la recherche
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    destination: '',
    checkinDate: null,
    checkoutDate: null,
    guests: ''
  });
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Fonction pour vérifier si une propriété est disponible pour des dates données
  const isPropertyAvailable = (property: Property, checkinDate: Date, checkoutDate: Date): boolean => {
    if (!property.isAvailable) return false;
    
    // Vérifier les conflits avec les réservations existantes
    if (property.rentals && property.rentals.length > 0) {
      return !property.rentals.some((rental) => {
        const rentalStart = new Date(rental.startDate);
        const rentalEnd = rental.endDate ? new Date(rental.endDate) : rentalStart;
        
        // Vérifier s'il y a chevauchement entre les dates demandées et la réservation
        return (checkinDate <= rentalEnd && checkoutDate >= rentalStart);
      });
    }
    
    return true;
  };

  // Fonction pour filtrer les propriétés selon les critères de recherche
  const filteredProperties = useMemo(() => {
    if (!isSearchActive) return properties;

    return properties.filter(property => {
      // Filtre par destination
      if (searchFilters.destination) {
        const searchTerm = searchFilters.destination.toLowerCase();
        const matchesDestination = 
          property.city?.toLowerCase().includes(searchTerm) ||
          property.country?.toLowerCase().includes(searchTerm) ||
          property.region?.toLowerCase().includes(searchTerm) ||
          property.title?.toLowerCase().includes(searchTerm);
        
        if (!matchesDestination) return false;
      }

      // Filtre par disponibilité (si des dates sont sélectionnées)
      if (searchFilters.checkinDate && searchFilters.checkoutDate) {
        return isPropertyAvailable(property, searchFilters.checkinDate, searchFilters.checkoutDate);
      }

      // Si pas de dates spécifiées, vérifier juste si la propriété est disponible
      return property.isAvailable !== false;
    });
  }, [properties, searchFilters, isSearchActive]);

  // Fonction pour effectuer la recherche
  const handleSearch = () => {
    setIsSearchActive(true);
  };

  // Fonction pour réinitialiser la recherche
  const resetSearch = () => {
    setSearchFilters({
      destination: '',
      checkinDate: null,
      checkoutDate: null,
      guests: ''
    });
    setIsSearchActive(false);
  };

  // Propriétés à afficher selon l'état de recherche
  const displayProperties = isSearchActive ? filteredProperties : properties;
  const popularProperties = displayProperties.slice(0, 6);
  const marseilleProperties = displayProperties.filter(p => p.city?.toLowerCase().includes('marseille')).slice(0, 6);
  const parisProperties = displayProperties.filter(p => p.city?.toLowerCase().includes('paris')).slice(0, 6);
  const recentProperties = displayProperties.slice(-6);

  return (
    <ImmersiveLayout>
      <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Header avec barre de recherche */}
        <div className="text-center space-y-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary">
            Découvrez nos logements
          </h1>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Explorez notre sélection de propriétés exceptionnelles dans les plus belles destinations
          </p>
          
          {/* Barre de recherche moderne */}
          <div className="max-w-4xl mx-auto">
            <SearchBar 
              searchFilters={searchFilters}
              setSearchFilters={setSearchFilters}
              onSearch={handleSearch}
              onReset={resetSearch}
              isSearchActive={isSearchActive}
            />
          </div>
        </div>

        {/* Message de résultats de recherche */}
        {isSearchActive && (
          <div className="text-center py-4">
            {filteredProperties.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Aucun logement trouvé
                </h3>
                <p className="text-yellow-600 mb-4">
                  Aucun logement ne correspond à vos critères de recherche.
                </p>
                <button
                  onClick={resetSearch}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Réinitialiser la recherche
                </button>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-green-800">
                  <span className="font-semibold">{filteredProperties.length}</span> logement
                  {filteredProperties.length > 1 ? 's' : ''} trouvé
                  {filteredProperties.length > 1 ? 's' : ''}
                  {searchFilters.destination && (
                    <span> pour "{searchFilters.destination}"</span>
                  )}
                </p>
                <button
                  onClick={resetSearch}
                  className="text-green-600 hover:text-green-800 text-sm mt-1 underline"
                >
                  Voir tous les logements
                </button>
              </div>
            )}
          </div>
        )}

        {/* Section: Logements populaires */}
        {!isSearchActive && (
          <PropertySection 
            title="Logements populaires"
            subtitle="Les plus appréciés par nos voyageurs"
            properties={popularProperties}
            isLoading={isLoadingProperties}
          />
        )}

        {/* Résultats de recherche ou sections par défaut */}
        {isSearchActive ? (
          filteredProperties.length > 0 && (
            <PropertySection 
              title="Résultats de recherche"
              subtitle={`${filteredProperties.length} logement${filteredProperties.length > 1 ? 's' : ''} trouvé${filteredProperties.length > 1 ? 's' : ''}`}
              properties={filteredProperties}
              isLoading={isLoadingProperties}
            />
          )
        ) : (
          <>
            {/* Section: Logements à Marseille */}
            {marseilleProperties.length > 0 && (
              <PropertySection 
                title="Logements à Marseille"
                subtitle="Découvrez la cité phocéenne"
                properties={marseilleProperties}
                isLoading={isLoadingProperties}
              />
            )}

            {/* Section: Logements à Paris */}
            {parisProperties.length > 0 && (
              <PropertySection 
                title="Logements à Paris"
                subtitle="La ville lumière vous attend"
                properties={parisProperties}
                isLoading={isLoadingProperties}
              />
            )}

            {/* Section: Ajouts récents */}
            <PropertySection 
              title="Ajouts récents"
              subtitle="Les dernières propriétés ajoutées"
              properties={recentProperties}
              isLoading={isLoadingProperties}
            />
          </>
        )}

        {/* Actions rapides */}
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-primary mb-6">Actions rapides</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/add-property">
              <Button variant="primary" size="lg" className="px-8 py-3">
                Ajouter un logement
              </Button>
            </Link>
            <Link to="/add-proof">
              <Button variant="secondary" size="lg" className="px-8 py-3">
                Créer une preuve
              </Button>
            </Link>
            <Link to="/properties">
              <Button variant="ghost" size="lg" className="px-8 py-3">
                Voir tous les logements
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </ImmersiveLayout>
  );
};

// Interface pour les filtres de recherche
interface SearchFilters {
  destination: string;
  checkinDate: Date | null;
  checkoutDate: Date | null;
  guests: string;
}

// Composant barre de recherche moderne
const SearchBar: React.FC<{
  searchFilters: SearchFilters;
  setSearchFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  onSearch: () => void;
  onReset: () => void;
  isSearchActive: boolean;
}> = ({ searchFilters, setSearchFilters, onSearch, onReset, isSearchActive }) => {
  const [showCalendar, setShowCalendar] = useState<'checkin' | 'checkout' | null>(null);
  
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short'
    });
  };

  const handleDateSelect = (date: Date) => {
    if (showCalendar === 'checkin') {
      setSearchFilters(prev => ({ ...prev, checkinDate: date }));
      // Si pas de date de départ ou si arrivée >= départ, on ouvre le calendrier de départ
      if (!searchFilters.checkoutDate || date >= searchFilters.checkoutDate) {
        setShowCalendar('checkout');
        setSearchFilters(prev => ({ ...prev, checkoutDate: null }));
      } else {
        setShowCalendar(null);
      }
    } else if (showCalendar === 'checkout') {
      setSearchFilters(prev => ({ ...prev, checkoutDate: date }));
      setShowCalendar(null);
    }
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchFilters(prev => ({ ...prev, destination: e.target.value }));
  };

  const handleGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchFilters(prev => ({ ...prev, guests: e.target.value }));
  };

  const handleSearchClick = () => {
    onSearch();
    setShowCalendar(null);
  };

  return (
    <div className="relative">
      <div className="bg-white rounded-full shadow-lg border border-gray-200 p-2">
        <div className="flex flex-col md:flex-row md:divide-x divide-gray-200">
          {/* Destination */}
          <div className="flex-1 px-6 py-4">
            <div className="text-left">
              <label className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Destination
              </label>
              <input
                type="text"
                placeholder="Rechercher une destination"
                value={searchFilters.destination}
                onChange={handleDestinationChange}
                className="w-full text-sm text-gray-600 placeholder-gray-400 bg-transparent border-0 focus:outline-none mt-1"
              />
            </div>
          </div>

          {/* Arrivée */}
          <div className="flex-1 px-6 py-4 cursor-pointer" onClick={() => setShowCalendar(showCalendar === 'checkin' ? null : 'checkin')}>
            <div className="text-left">
              <label className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Arrivée
              </label>
              <div className="flex items-center gap-2 mt-1">
                <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                <span className={`text-sm ${searchFilters.checkinDate ? 'text-gray-900' : 'text-gray-400'}`}>
                  {searchFilters.checkinDate ? formatDate(searchFilters.checkinDate) : 'Ajouter des dates'}
                </span>
              </div>
            </div>
          </div>

          {/* Départ */}
          <div className="flex-1 px-6 py-4 cursor-pointer" onClick={() => setShowCalendar(showCalendar === 'checkout' ? null : 'checkout')}>
            <div className="text-left">
              <label className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Départ
              </label>
              <div className="flex items-center gap-2 mt-1">
                <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                <span className={`text-sm ${searchFilters.checkoutDate ? 'text-gray-900' : 'text-gray-400'}`}>
                  {searchFilters.checkoutDate ? formatDate(searchFilters.checkoutDate) : 'Ajouter des dates'}
                </span>
              </div>
            </div>
          </div>

          {/* Voyageurs */}
          <div className="flex-1 px-6 py-4">
            <div className="text-left">
              <label className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Voyageurs
              </label>
              <input
                type="text"
                placeholder="Ajouter des voyageurs"
                value={searchFilters.guests}
                onChange={handleGuestsChange}
                className="w-full text-sm text-gray-600 placeholder-gray-400 bg-transparent border-0 focus:outline-none mt-1"
              />
            </div>
          </div>

          {/* Bouton de recherche */}
          <div className="flex items-center justify-center px-2">
            {isSearchActive ? (
              <button 
                onClick={onReset}
                className="bg-gray-500 hover:bg-gray-600 text-white p-4 rounded-full transition-colors duration-200 shadow-lg"
                title="Réinitialiser"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : (
              <button 
                onClick={handleSearchClick}
                className="bg-primary hover:bg-primary-600 text-white p-4 rounded-full transition-colors duration-200 shadow-lg"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Calendrier */}
      {showCalendar && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-6 z-50">
          <SearchCalendar 
            onDateSelect={handleDateSelect}
            checkinDate={searchFilters.checkinDate}
            checkoutDate={searchFilters.checkoutDate}
            mode={showCalendar}
          />
        </div>
      )}
    </div>
  );
};

// Composant calendrier pour la recherche
const SearchCalendar: React.FC<{
  onDateSelect: (date: Date) => void;
  checkinDate: Date | null;
  checkoutDate: Date | null;
  mode: 'checkin' | 'checkout';
}> = ({ onDateSelect, checkinDate, checkoutDate, mode }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Lundi = 0

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isDateInRange = (date: Date) => {
    if (!checkinDate || !checkoutDate) return false;
    return date > checkinDate && date < checkoutDate;
  };

  const isDateSelected = (date: Date) => {
    if (checkinDate && date.toDateString() === checkinDate.toDateString()) return true;
    if (checkoutDate && date.toDateString() === checkoutDate.toDateString()) return true;
    return false;
  };

  const isDateDisabled = (date: Date) => {
    // Désactiver les dates passées
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    // Si on sélectionne la date de départ, désactiver les dates avant l'arrivée
    if (mode === 'checkout' && checkinDate && date <= checkinDate) return true;

    return false;
  };

  const getDayClass = (date: Date) => {
    let classes = "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors cursor-pointer ";
    
    if (isDateDisabled(date)) {
      classes += "text-gray-300 cursor-not-allowed ";
    } else if (isDateSelected(date)) {
      classes += "bg-primary text-white ";
    } else if (isDateInRange(date)) {
      classes += "bg-primary-light text-primary ";
    } else {
      classes += "text-gray-700 hover:bg-primary-light hover:text-primary ";
    }

    return classes;
  };

  const renderCalendar = () => {
    const days = [];

    // Cases vides pour les jours avant le premier du mois
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
    }

    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      days.push(
        <button
          key={day}
          onClick={() => !isDateDisabled(date) && onDateSelect(date)}
          className={getDayClass(date)}
          disabled={isDateDisabled(date)}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Header du calendrier */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {mode === 'checkin' ? 'Sélectionnez votre arrivée' : 'Sélectionnez votre départ'}
        </h3>
      </div>

      {/* Navigation mois */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
        
        <h4 className="text-lg font-semibold text-gray-900">
          {monthNames[currentMonth]} {currentYear}
        </h4>
        
        <button
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="w-10 h-10 flex items-center justify-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Grille du calendrier */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendar()}
      </div>

      {/* Info dates sélectionnées */}
      {(checkinDate || checkoutDate) && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            {checkinDate && (
              <div>Arrivée: {checkinDate.toLocaleDateString('fr-FR')}</div>
            )}
            {checkoutDate && (
              <div>Départ: {checkoutDate.toLocaleDateString('fr-FR')}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Composant pour une section de propriétés
const PropertySection: React.FC<{
  title: string;
  subtitle: string;
  properties: Property[];
  isLoading: boolean;
}> = ({ title, subtitle, properties, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-primary">{title}</h2>
          <p className="text-secondary">{subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-64 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-primary">{title}</h2>
          <p className="text-secondary">{subtitle}</p>
        </div>
        <Link 
          to="/properties" 
          className="text-primary hover:text-primary-600 font-medium text-sm hidden md:block"
        >
          Voir tout →
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
      
      {/* Lien mobile */}
      <div className="text-center md:hidden">
        <Link 
          to="/properties" 
          className="text-primary hover:text-primary-600 font-medium"
        >
          Voir tous les logements →
        </Link>
      </div>
    </div>
  );
};

// Composant pour une carte de propriété
const PropertyCard: React.FC<{ property: Property }> = ({ property }) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  
  return (
    <Link 
      to={`/properties/${property.id}`}
      className="group block bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {property.photos && property.photos.length > 0 ? (
          <img 
            src={property.photos[0]} 
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Si l'image ne charge pas, on affiche le fallback
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.setAttribute('style', 'display: flex;');
            }}
          />
        ) : null}
        
        {/* Fallback quand il n'y a pas d'image ou en cas d'erreur */}
        <div 
          className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-light to-primary-500"
          style={{ display: property.photos && property.photos.length > 0 ? 'none' : 'flex' }}
        >
          <span className="text-white text-xl font-bold">
            {property.title?.charAt(0) || 'P'}
          </span>
        </div>
        
        {/* Bouton favoris */}
        <div className="absolute top-3 right-3">
          <FavoriteButton
            propertyId={property.id}
            isFavorite={isFavorite(property.id)}
            onToggle={toggleFavorite}
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
        
        <p className="text-sm text-gray-600 truncate">
          {property.city}, {property.country}
        </p>
        
        <p className="text-sm text-gray-500 truncate">
          {property.description}
        </p>
        
        <div className="flex items-center justify-between pt-2">
          <div className="text-lg font-bold text-gray-900">
            {property.price}€
            <span className="text-sm font-normal text-gray-600">
              /{property.pricePeriod === 'DAY' ? 'jour' : property.pricePeriod === 'WEEK' ? 'semaine' : 'mois'}
            </span>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {property.area ? `${property.area}m²` : 'Propriété'}
          </span>
        </div>
      </div>
    </Link>
  );
};
