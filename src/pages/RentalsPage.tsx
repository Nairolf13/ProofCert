import React from 'react';
import { useRentals } from '../hooks/useRentals';

export const RentalsPage: React.FC = () => {
  const { rentals, isLoading, error } = useRentals();

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-4 md:px-8 animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 drop-shadow-sm">Mes locations</h1>
      {/* Liste des locations modernisée */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rentals.map((rental) => (
          <div key={rental.id} className="bg-white shadow-md rounded-lg p-6 transition-transform transform hover:scale-105">
            <div className="font-semibold text-lg mb-2">Bien : {rental.property?.title || rental.propertyId}</div>
            <div className="text-gray-700 mb-4">Locataire : {rental.tenantId}</div>
            <div className="text-sm text-gray-500">Début : {rental.startDate}</div>
            {rental.endDate && <div className="text-sm text-gray-500">Fin : {rental.endDate}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};
