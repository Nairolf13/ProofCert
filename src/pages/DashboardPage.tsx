import React from 'react';
import { Link } from 'react-router-dom';
import { useProperties } from '../hooks/useProperties';
import { useRentals } from '../hooks/useRentals';
import { useProofs } from '../hooks/useProofs';
import { Button } from '../components/Button';

export const DashboardPage: React.FC = () => {
  const { properties, isLoading: isLoadingProperties } = useProperties();
  const { rentals, isLoading: isLoadingRentals } = useRentals();
  const { proofs, isLoading: isLoadingProofs } = useProofs();

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 md:px-8 animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 drop-shadow-sm">Tableau de bord</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <DashboardCard
          title="Biens immobiliers"
          value={isLoadingProperties ? '...' : properties.length}
          link="/properties"
          color="from-purple-400 via-pink-400 to-blue-400"
          icon="🏠"
        />
        <DashboardCard
          title="Locations"
          value={isLoadingRentals ? '...' : rentals.length}
          link="/rentals"
          color="from-blue-400 via-green-400 to-purple-400"
          icon="🔑"
        />
        <DashboardCard
          title="Preuves enregistrées"
          value={isLoadingProofs ? '...' : proofs.length}
          link="/proofs"
          color="from-pink-400 via-yellow-400 to-purple-400"
          icon="📄"
        />
        <DashboardCard
          title="Ajouter un bien"
          value="+"
          link="/add-property"
          color="from-green-400 via-blue-400 to-purple-400"
          icon="➕"
        />
      </div>
      <div className="bg-white/80 rounded-2xl shadow-xl p-6 border border-white/40 backdrop-blur-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Actions rapides</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/add-proof">
            <Button variant="primary" size="md">Ajouter une preuve</Button>
          </Link>
          <Link to="/add-property">
            <Button variant="secondary" size="md">Ajouter un bien</Button>
          </Link>
          <Link to="/add-rental">
            <Button variant="secondary" size="md">Créer une location</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const DashboardCard: React.FC<{
  title: string;
  value: string | number;
  link: string;
  color: string;
  icon: string;
}> = ({ title, value, link, color, icon }) => (
  <Link to={link} className={`block rounded-2xl shadow-xl p-6 bg-gradient-to-tr ${color} text-white hover:scale-[1.03] active:scale-95 transition-all duration-150 min-h-[120px] flex flex-col items-start justify-between`}>
    <span className="text-4xl mb-2 drop-shadow-lg">{icon}</span>
    <div className="flex flex-col gap-1">
      <span className="text-lg font-semibold">{title}</span>
      <span className="text-2xl font-extrabold">{value}</span>
    </div>
  </Link>
);
