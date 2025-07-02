import React, { useState, useMemo } from 'react';
import { useRentals } from '../hooks/useRentals';
import { useAuth } from '../hooks/useAuth';
import type { Rental } from '../types';
import { 
  CalendarIcon, 
  HomeIcon, 
  MapPinIcon, 
  ClockIcon,
  CheckCircleIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const MyReservationsPage: React.FC = () => {
  const { rentals, isLoading, error } = useRentals();
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'past' | 'upcoming'>('all');

  // Filtrer les réservations de l'utilisateur connecté
  const userRentals = useMemo(() => {
    if (!user || !rentals) return [];
    return rentals.filter(rental => rental.tenantId === user.id);
  }, [rentals, user]);

  // Classer les réservations par statut
  const categorizedRentals = useMemo(() => {
    const now = new Date();
    
    const categorized = userRentals.reduce((acc, rental) => {
      const startDate = new Date(rental.startDate);
      const endDate = rental.endDate ? new Date(rental.endDate) : null;
      
      if (endDate && endDate < now) {
        acc.past.push(rental);
      } else if (startDate > now) {
        acc.upcoming.push(rental);
      } else {
        acc.active.push(rental);
      }
      
      return acc;
    }, { active: [] as Rental[], upcoming: [] as Rental[], past: [] as Rental[] });

    // Trier chaque catégorie
    categorized.active.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    categorized.upcoming.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    categorized.past.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    return categorized;
  }, [userRentals]);

  // Filtrer selon le statut sélectionné
  const filteredRentals = useMemo(() => {
    switch (filterStatus) {
      case 'active':
        return categorizedRentals.active;
      case 'upcoming':
        return categorizedRentals.upcoming;
      case 'past':
        return categorizedRentals.past;
      default:
        return [...categorizedRentals.active, ...categorizedRentals.upcoming, ...categorizedRentals.past];
    }
  }, [categorizedRentals, filterStatus]);

  const getRentalStatus = (rental: Rental) => {
    const now = new Date();
    const startDate = new Date(rental.startDate);
    const endDate = rental.endDate ? new Date(rental.endDate) : null;
    
    if (endDate && endDate < now) {
      return { status: 'past', label: 'Terminée', color: 'text-gray-500', bgColor: 'bg-gray-100' };
    } else if (startDate > now) {
      return { status: 'upcoming', label: 'À venir', color: 'text-primary-600', bgColor: 'bg-primary-light' };
    } else {
      return { status: 'active', label: 'En cours', color: 'text-success-600', bgColor: 'bg-success-light' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatPricePeriod = (period?: string) => {
    switch (period) {
      case 'DAY': return '/jour';
      case 'WEEK': return '/semaine';
      case 'MONTH': return '/mois';
      default: return '/mois';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app-background flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-app-background flex justify-center items-center">
        <div className="text-red-500 text-center font-bold text-2xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-background">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8 pt-12 md:pt-8">
        {/* En-tête */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Mes Réservations</h1>
          <p className="text-secondary text-base md:text-lg">
            Gérez toutes vos réservations de biens immobiliers
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-surface rounded-xl p-4 md:p-6 card-shadow">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-success-light rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 md:w-6 md:h-6 text-success-600" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-gray-900">{categorizedRentals.active.length}</div>
                <div className="text-xs md:text-sm text-secondary">En cours</div>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-xl p-4 md:p-6 card-shadow">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-light rounded-lg flex items-center justify-center">
                <ClockIcon className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-gray-900">{categorizedRentals.upcoming.length}</div>
                <div className="text-xs md:text-sm text-secondary">À venir</div>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-xl p-4 md:p-6 card-shadow">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-gray-900">{categorizedRentals.past.length}</div>
                <div className="text-xs md:text-sm text-secondary">Terminées</div>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-xl p-4 md:p-6 card-shadow">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-accent-light rounded-lg flex items-center justify-center">
                <HomeIcon className="w-5 h-5 md:w-6 md:h-6 text-accent-600" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-gray-900">{userRentals.length}</div>
                <div className="text-xs md:text-sm text-secondary">Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-3 mb-8">
          {[
            { key: 'all', label: 'Toutes', count: userRentals.length },
            { key: 'active', label: 'En cours', count: categorizedRentals.active.length },
            { key: 'upcoming', label: 'À venir', count: categorizedRentals.upcoming.length },
            { key: 'past', label: 'Terminées', count: categorizedRentals.past.length }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFilterStatus(filter.key as 'all' | 'active' | 'past' | 'upcoming')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                filterStatus === filter.key
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-surface text-secondary hover:bg-primary-light hover:text-primary'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        {/* Liste des réservations */}
        {filteredRentals.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-surface rounded-full flex items-center justify-center mx-auto mb-6 card-shadow">
              <CalendarIcon className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">
              {filterStatus === 'all' ? 'Aucune réservation' : `Aucune réservation ${
                filterStatus === 'active' ? 'en cours' : 
                filterStatus === 'upcoming' ? 'à venir' : 'terminée'
              }`}
            </h3>
            <p className="text-gray-500 text-lg mb-6">
              {filterStatus === 'all' 
                ? 'Vous n\'avez encore effectué aucune réservation.'
                : 'Aucune réservation dans cette catégorie.'
              }
            </p>
            {filterStatus === 'all' && (
              <Link 
                to="/properties"
                className="inline-flex items-center gap-2 gradient-primary text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
              >
                <HomeIcon className="w-5 h-5" />
                Explorer les biens
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRentals.map((rental) => {
              const statusInfo = getRentalStatus(rental);
              return (
                <div key={rental.id} className="bg-surface rounded-xl p-6 card-shadow hover:shadow-lg transition-all duration-200">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Image du bien */}
                    <div className="lg:w-80 h-48 lg:h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {rental.property?.photos && rental.property.photos.length > 0 ? (
                        <img 
                          src={rental.property.photos[0]} 
                          alt={rental.property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-surface flex items-center justify-center">
                          <HomeIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Informations du bien */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {rental.property?.title || 'Bien sans titre'}
                          </h3>
                          <div className="flex items-center gap-2 text-secondary mb-2">
                            <MapPinIcon className="w-4 h-4" />
                            <span className="text-sm">{rental.property?.address}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                          {rental.property?.price && (
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">
                                {rental.property.price.toLocaleString('fr-FR')} €
                              </div>
                              <div className="text-xs text-secondary">
                                {formatPricePeriod(rental.property.pricePeriod)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-primary-500" />
                          <span className="text-sm text-secondary">Début:</span>
                          <span className="text-sm font-medium">{formatDate(rental.startDate)}</span>
                        </div>
                        {rental.endDate && (
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-accent-500" />
                            <span className="text-sm text-secondary">Fin:</span>
                            <span className="text-sm font-medium">{formatDate(rental.endDate)}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3">
                        <Link
                          to={`/properties/${rental.propertyId}`}
                          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium hover:bg-primary-light px-3 py-1 rounded-lg transition-colors"
                        >
                          Voir le bien
                          <ChevronRightIcon className="w-4 h-4" />
                        </Link>
                        
                        {rental.proofs && rental.proofs.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-success-600 text-sm">
                            <CheckCircleIcon className="w-4 h-4" />
                            {rental.proofs.length} preuve{rental.proofs.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReservationsPage;
