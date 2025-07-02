import React from 'react';
import { PropertyOwnerActions } from './PropertyOwnerActions';
import { FavoriteButton } from './FavoriteButton';

interface PropertyHeaderProps {
  title: string;
  isAvailable: boolean;
  price: number;
  pricePeriod: string;
  area: number;
  address: string;
  city: string;
  region: string;
  country: string;
  createdAt: string;
  owner?: { username?: string; email?: string; profileImage?: string };
  isOwner?: boolean;
  isEditing?: boolean;
  isDeleting?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  // Props pour les favoris
  propertyId?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (propertyId: string) => void;
}
import { CheckCircleIcon, XCircleIcon, CurrencyEuroIcon, Squares2X2Icon, MapPinIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline';

export const PropertyHeader: React.FC<PropertyHeaderProps> = ({
  title, isAvailable, price, pricePeriod, area, address, city, region, country, createdAt, owner,
  isOwner, isEditing, isDeleting, onEdit, onDelete, propertyId, isFavorite, onToggleFavorite
}) => (
  <div className="relative w-full max-w-5xl flex flex-col gap-2 mb-2 items-center text-center mx-auto">
    {isOwner && onEdit && onDelete && (
      <div className="absolute top-0 right-0 z-10">
        <PropertyOwnerActions 
          isOwner={isOwner}
          isEditing={isEditing || false}
          isDeleting={isDeleting || false}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    )}
    
    {/* Bouton favoris (pour les non-propriétaires) */}
    {!isOwner && propertyId && onToggleFavorite && (
      <div className="absolute top-0 left-0 z-10">
        <FavoriteButton
          propertyId={propertyId}
          isFavorite={isFavorite || false}
          onToggle={onToggleFavorite}
          variant="default"
          size="lg"
        />
      </div>
    )}
    
    <div className="flex flex-col items-center gap-3 mb-2">
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 drop-shadow-lg">
        {title}
      </h1>
    </div>
    <div className="flex flex-wrap justify-center gap-3 mb-1">
      <span className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-lg font-bold shadow border-2 border-white/70 ${isAvailable ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-600'}`}>{isAvailable ? <CheckCircleIcon className="w-6 h-6" /> : <XCircleIcon className="w-6 h-6" />} {isAvailable ? 'Disponible' : 'Non disponible'}</span>
      <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-lg font-bold shadow border-2 border-white/70">
        <CurrencyEuroIcon className="w-6 h-6" /> {price} €
        <span className="text-base text-primary-500 font-semibold">{pricePeriod === 'DAY' ? '/jour' : pricePeriod === 'WEEK' ? '/semaine' : '/mois'}</span>
      </span>
      <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-purple-100 text-purple-700 text-lg font-bold shadow border-2 border-white/70">
        <Squares2X2Icon className="w-6 h-6" /> {area} m²
      </span>
    </div>
    <div className="flex flex-wrap justify-center gap-2 text-base font-semibold text-primary-700">
      <MapPinIcon className="w-6 h-6 text-primary-400" />
      <span>{address}</span>
      <span className="text-gray-400">{city}</span>
      <span className="text-gray-400">{region}</span>
      <span className="text-gray-400">{country}</span>
    </div>
    <div className="flex items-center gap-2 mt-2 justify-center">
      <CalendarIcon className="w-5 h-5 text-primary-400" />
      <span className="text-sm text-primary-500 font-semibold">Ajouté le {new Date(createdAt).toLocaleDateString()}</span>
    </div>
    {owner && (
      <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-xl px-4 py-2 shadow border border-white/70 mt-2 justify-center">
        <div className="relative w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
          {owner.profileImage ? (
            <img 
              src={owner.profileImage} 
              alt="Photo de profil" 
              className="w-full h-full object-cover"
            />
          ) : (
            <UserIcon className="w-7 h-7 text-primary-400" />
          )}
        </div>
        <span className="font-bold text-gray-900">{owner.username || owner.email}</span>
        <span className="text-xs text-gray-500 ml-2">Propriétaire</span>
      </div>
    )}
  </div>
);
