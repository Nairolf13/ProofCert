import React from 'react';
import { useRentals } from '../hooks/useRentals';

export const RentalsPage: React.FC = () => {
  const { rentals, isLoading, error } = useRentals();

  // Fonction pour formater les dates
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Fonction pour calculer la durée
  const calculateDuration = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) {
      return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} semaine${weeks > 1 ? 's' : ''}`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} mois`;
    }
  };

  // Fonction pour calculer les revenus d'une location (pro-rata temporis)
  const calculateRentalRevenue = (rental: Rental): number => {
    if (!rental.property?.price || !rental.property?.pricePeriod) return 0;

    const start = new Date(rental.startDate);
    const end = rental.endDate ? new Date(rental.endDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const { price, pricePeriod } = rental.property;

    switch (pricePeriod) {
      case 'DAY':
        return price * diffDays;
      case 'WEEK': {
        // Calcul pro-rata pour les semaines (prix par jour)
        const dailyRate = price / 7;
        return dailyRate * diffDays;
      }
      case 'MONTH': {
        // Calcul pro-rata pour les mois (prix par jour)
        const dailyRate = price / 30;
        return dailyRate * diffDays;
      }
      default:
        return 0;
    }
  };

  // Fonction pour calculer les revenus mensuels d'une propriété (locations en cours ce mois)
  const calculateMonthlyRevenue = (rentals: Rental[]): number => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return rentals.reduce((total, rental) => {
      // Vérifier si la location est en cours ce mois
      const startDate = new Date(rental.startDate);
      const endDate = rental.endDate ? new Date(rental.endDate) : new Date();
      const currentDate = new Date();
      
      // La location doit être en cours (pas terminée ou commence ce mois)
      const isOngoing = !rental.endDate || endDate >= currentDate;
      const isThisMonth = (startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear) ||
                         (startDate <= currentDate && isOngoing);
      
      if (!isThisMonth || !rental.property?.price || !rental.property?.pricePeriod) {
        return total;
      }

      // Calculer les revenus pour ce mois seulement
      const monthStart = new Date(currentYear, currentMonth, 1);
      const monthEnd = new Date(currentYear, currentMonth + 1, 0);
      
      const effectiveStart = new Date(Math.max(startDate.getTime(), monthStart.getTime()));
      const effectiveEnd = new Date(Math.min(endDate.getTime(), monthEnd.getTime()));
      
      const diffTime = effectiveEnd.getTime() - effectiveStart.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const { price, pricePeriod } = rental.property;
      
      switch (pricePeriod) {
        case 'DAY': {
          return total + (price * diffDays);
        }
        case 'WEEK': {
          // Calcul pro-rata pour les semaines (prix par jour)
          const dailyRate = price / 7;
          return total + (dailyRate * diffDays);
        }
        case 'MONTH': {
          // Calcul pro-rata pour les mois (prix par jour)
          const dailyRate = price / 30;
          return total + (dailyRate * diffDays);
        }
        default:
          return total;
      }
    }, 0);
  };

  // Fonction pour calculer les revenus réels générés par une propriété ce mois (locations terminées)
  const calculatePropertyTotalRevenue = (rentals: Rental[]): number => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentDate = new Date();
    
    return rentals.reduce((total, rental) => {
      if (!rental.endDate) return total; // Ignorer les locations en cours (pas de date de fin)
      
      const endDate = new Date(rental.endDate);
      
      // Vérifier si la location s'est terminée ce mois ET est effectivement terminée
      const isCompletedThisMonth = endDate.getMonth() === currentMonth && 
                                  endDate.getFullYear() === currentYear;
      const isActuallyFinished = endDate < currentDate; // La date de fin doit être dans le passé
      
      if (!isCompletedThisMonth || !isActuallyFinished) return total;
      
      return total + calculateRentalRevenue(rental);
    }, 0);
  };

  // Définir les types pour property et rental
  type Property = {
    id: string;
    title?: string;
    address?: string;
    photos?: string[];
    price?: number;
    pricePeriod?: 'DAY' | 'WEEK' | 'MONTH';
  };

  type Rental = {
    id: string;
    propertyId: string;
    property?: Property;
    tenant?: {
      username?: string;
      email?: string;
    };
    startDate: string;
    endDate?: string;
  };

  // Grouper les locations par bien
  const groupedRentals = rentals.reduce((acc, rental: Rental) => {
    const propertyId = rental.propertyId;
    if (!acc[propertyId]) {
      acc[propertyId] = {
        property: rental.property,
        rentals: [] as Rental[]
      };
    }
    acc[propertyId].rentals.push(rental);
    return acc;
  }, {} as Record<string, { property?: Property; rentals: Rental[] }>);

  // Trier les locations par date de début (plus récent en premier)
  Object.values(groupedRentals).forEach(group => {
    group.rentals.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  });

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-app-background flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-app-background flex justify-center items-center">
        <div className="text-red-500 text-center font-bold text-2xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-app-background font-serif text-gray-900">
      <section className="w-full max-w-7xl mx-auto py-8 px-4 md:px-8 animate-fade-in">

        {Object.keys(groupedRentals).length === 0 ? (
          /* État vide */
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-surface rounded-full flex items-center justify-center mx-auto mb-6 card-shadow">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">Aucune location</h3>
            <p className="text-gray-500 text-lg">Vous n'avez encore aucune location enregistrée.</p>
          </div>
        ) : (
          /* Grille des biens avec leurs locations */
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {Object.entries(groupedRentals).map(([propertyId, { property, rentals }]) => (
              <article 
                key={propertyId} 
                className="group bg-white/95 rounded-3xl shadow-2xl border-2 border-white/80 overflow-hidden hover:shadow-3xl transition-all duration-300"
              >
                {/* Header du bien */}
                <div className="relative">
                  {/* Image du bien */}
                  <div className="relative h-48 overflow-hidden">
                    {property?.photos && property.photos.length > 0 ? (
                      <img
                        src={property.photos[0]}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface flex items-center justify-center card-shadow">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Badge nombre de locations */}
                    <div className="absolute top-4 right-4">
                      <div className="px-3 py-1 bg-primary-500 text-white rounded-full text-xs font-bold shadow-lg">
                        {rentals.length} location{rentals.length > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  {/* Informations du bien */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {property?.title || 'Bien sans titre'}
                    </h3>
                    {property?.address && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mb-4">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {property.address}
                      </p>
                    )}

                    {/* Prix et revenus */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      {/* Prix de location */}
                      {property?.price && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                          <div className="flex items-center gap-2 mb-1">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span className="text-xs font-medium text-green-700">Prix</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="font-bold text-green-600 text-base">{property.price}€</span>
                            <span className="text-xs text-green-600">
                              /{property.pricePeriod === 'DAY' ? 'j' : property.pricePeriod === 'WEEK' ? 's' : 'm'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Revenus totaux générés */}
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span className="text-xs font-medium text-blue-700">Généré ce mois</span>
                        </div>
                        <div className="font-bold text-blue-600 text-base">
                          {calculatePropertyTotalRevenue(rentals).toLocaleString('fr-FR')} €
                        </div>
                      </div>

                      {/* Potentiel mensuel */}
                      <div className="bg-primary-light rounded-lg p-3 border border-primary-200">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <span className="text-xs font-medium text-primary-700">Potentiel ce mois</span>
                        </div>
                        <div className="font-bold text-primary-600 text-base">
                          {calculateMonthlyRevenue(rentals).toLocaleString('fr-FR')} €
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Liste des locations */}
                <div className="border-t border-gray-200">
                  <div className="p-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Historique des locations
                      </div>
                      <span className="text-sm font-normal text-gray-500">
                        {rentals.length} location{rentals.length > 1 ? 's' : ''}
                      </span>
                    </h4>
                    
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin">
                      {rentals.map((rental) => (
                        <div key={rental.id} className="bg-surface rounded-lg p-3 border border-primary-100 hover:shadow-md transition-shadow duration-200 card-shadow">
                          {/* En-tête de la location */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="font-semibold text-gray-800 text-sm">
                                {rental.tenant?.username || rental.tenant?.email || 'Nom non disponible'}
                              </span>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-bold text-white ${
                              rental.endDate && new Date(rental.endDate) < new Date() 
                                ? 'bg-gray-500' 
                                : 'bg-green-500'
                            }`}>
                              {rental.endDate && new Date(rental.endDate) < new Date() ? 'Terminée' : 'En cours'}
                            </div>
                          </div>

                          {/* Informations de période - Format plus compact */}
                          <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                            <div className="bg-white bg-opacity-50 rounded p-2">
                              <div className="text-gray-600 mb-1">Début</div>
                              <div className="font-medium text-gray-800">{formatDate(rental.startDate)}</div>
                            </div>
                            {rental.endDate ? (
                              <div className="bg-white bg-opacity-50 rounded p-2">
                                <div className="text-gray-600 mb-1">Fin</div>
                                <div className="font-medium text-gray-800">{formatDate(rental.endDate)}</div>
                              </div>
                            ) : (
                              <div className="bg-white bg-opacity-50 rounded p-2">
                                <div className="text-gray-600 mb-1">Durée</div>
                                <div className="font-medium text-green-600">En cours</div>
                              </div>
                            )}
                          </div>
                          
                          {/* Informations financières et durée */}
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-200">
                            {rental.endDate && (
                              <div className="text-xs">
                                <span className="text-gray-600">Durée :</span>
                                <span className="font-bold text-purple-600 ml-1">{calculateDuration(rental.startDate, rental.endDate)}</span>
                              </div>
                            )}
                            <div className="text-xs">
                              <span className="text-gray-600">Revenus :</span>
                              <span className="font-bold text-green-600 ml-1">
                                {calculateRentalRevenue(rental).toLocaleString('fr-FR')} €
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
