import React, { useState } from 'react';
import { rentalApi } from '../api/rental';
import { useProperties } from '../hooks/useProperties';
import { Button } from '../components/Button';

export const AddRentalPage: React.FC = () => {
  const { properties } = useProperties();
  const [propertyId, setPropertyId] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await rentalApi.create({ propertyId, tenantId, startDate, endDate });
      window.location.href = '/rentals';
    } catch {
      alert('Erreur lors de la création de la location');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-app-background animate-fade-in">
      <div className="w-full max-w-lg bg-white/80 rounded-3xl shadow-2xl p-8 space-y-7 border border-white/40 backdrop-blur-lg">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 drop-shadow-sm">Créer une location</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Bien</label>
            <select className="w-full border rounded p-2" value={propertyId} onChange={e => setPropertyId(e.target.value)} required>
              <option value="">Sélectionner un bien</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">ID du locataire</label>
            <input className="w-full border rounded p-2" value={tenantId} onChange={e => setTenantId(e.target.value)} required />
          </div>
          <div>
            <label className="block mb-1">Date de début</label>
            <input type="date" className="w-full border rounded p-2" value={startDate} onChange={e => setStartDate(e.target.value)} required />
          </div>
          <div>
            <label className="block mb-1">Date de fin</label>
            <input type="date" className="w-full border rounded p-2" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <Button type="submit" isLoading={isSubmitting}>Créer la location</Button>
        </form>
      </div>
    </div>
  );
};
