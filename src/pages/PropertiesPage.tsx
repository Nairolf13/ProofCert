import React, { useEffect } from 'react';
import { useProperties } from '../hooks/useProperties';
import { Link, useNavigate } from 'react-router-dom';

export const PropertiesPage: React.FC = () => {
  const { properties, isLoading, error, refresh } = useProperties();
  const navigate = useNavigate();

  useEffect(() => {
    refresh();
    // eslint-disable-next-line
  }, []);

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (error) return <div className="text-red-500 text-center font-semibold py-8">{error}</div>;

  return (
    <div className="w-full max-w-6xl mx-auto py-10 px-4 md:px-8 animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 drop-shadow-sm text-center">Tous les biens immobiliers</h1>
      <div className="flex justify-end mb-6">
        <Link to="/add-property" className="inline-block">
          <button className="px-5 py-2 rounded-xl bg-gradient-to-tr from-purple-500 via-pink-500 to-blue-500 text-white font-semibold shadow hover:scale-105 transition">+ Ajouter un bien</button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map((property, idx) => (
          <Link
            key={property.id}
            to={`/properties/${property.id}`}
            className="group relative bg-white/60 backdrop-blur-md border border-gray-100 rounded-3xl shadow-2xl p-0 overflow-hidden transition-all duration-300 hover:shadow-3xl hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-primary-400 animate-fade-in-up h-full min-h-[420px] flex flex-col"
            tabIndex={0}
            aria-label={`Voir le bien ${property.title}`}
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            {/* Photo principale ou carousel */}
            <div className="relative w-full h-48 shrink-0">
              {property.photos && property.photos.length > 0 ? (
                <img
                  src={property.photos[0]}
                  alt={property.title}
                  className="w-full h-48 object-cover rounded-t-3xl border-b border-gray-100 group-hover:brightness-95 transition"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 flex items-center justify-center rounded-t-3xl text-5xl text-gray-300">
                  <span className="material-symbols-outlined">home</span>
                </div>
              )}
              {/* Badge nombre de photos */}
              {property.photos && property.photos.length > 1 && (
                <span className="absolute top-3 right-3 bg-white/80 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full shadow border border-gray-200 backdrop-blur-sm">
                  {property.photos.length} photos
                </span>
              )}
            </div>
            {/* Contenu */}
            <div className="p-6 flex flex-col gap-2 flex-1 min-h-[220px]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-bold text-primary-700 truncate max-w-[60%]">{property.title}</span>
                <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm border ${property.isAvailable ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-600 border-red-200'}`}>{property.isAvailable ? 'Disponible' : 'Non disponible'}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600 text-sm mt-1">
                <div className="col-span-2 truncate"><span className="font-semibold">Ville :</span> {property.city}</div>
                <div className="truncate"><span className="font-semibold">Région :</span> {property.region}</div>
                <div className="truncate"><span className="font-semibold">Pays :</span> {property.country}</div>
                <div><span className="font-semibold">Surface :</span> {property.area} m²</div>
                <div><span className="font-semibold">Prix :</span> {property.price} €</div>
              </div>
              <div className="text-xs text-gray-400 truncate mt-2 min-h-[1.5em] max-h-[2.5em] overflow-hidden"><span className="font-semibold">Description :</span> {property.description}</div>
              {/* Miniatures supplémentaires */}
              {property.photos && property.photos.length > 1 && (
                <div className="flex gap-2 mt-2">
                  {property.photos.slice(1, 4).map((src, i) => (
                    <img key={i} src={src} alt={`Photo ${i + 2}`} className="w-12 h-12 object-cover rounded-lg border border-gray-100 shadow-sm" loading="lazy" />
                  ))}
                  {property.photos.length > 4 && (
                    <span className="text-xs text-gray-400 self-center">+{property.photos.length - 4} photos</span>
                  )}
                </div>
              )}
              <div className="flex-1" /> {/* pousse le bouton en bas */}
              <button
                type="button"
                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-tr from-primary-500 via-pink-400 to-blue-400 text-white font-semibold shadow hover:scale-105 transition focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
                tabIndex={0}
                aria-label={`Voir les détails du bien ${property.title}`}
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  navigate(`/properties/${property.id}`);
                }}
              >
                Détails
              </button>
            </div>
            {/* Effet de survol moderne */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none group-hover:ring-4 group-hover:ring-primary-200/40 transition"></div>
          </Link>
        ))}
      </div>
      {properties.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <img src="/empty-state.svg" alt="Aucun bien" className="w-32 h-32 mb-4 opacity-70" />
          <div className="text-gray-400 text-lg font-medium">Aucun bien pour le moment.<br/>Ajoutez votre premier bien pour commencer !</div>
        </div>
      )}
    </div>
  );
};
