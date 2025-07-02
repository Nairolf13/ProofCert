import React from 'react';
import { PropertyAmenities } from './PropertyAmenities';
import { PropertyDescription } from './PropertyDescription';

interface PropertyDetailsCardProps {
  amenities: string[];
  amenitiesLabels: Record<string, string>;
  description: string;
  isOwner: boolean;
  isEditing: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export const PropertyDetailsCard: React.FC<PropertyDetailsCardProps> = ({
  amenities,
  amenitiesLabels,
  description,
}) => (
  <div className="relative bg-white/95 rounded-3xl shadow-2xl border-2 border-white/80 p-8 flex flex-col gap-8">
    <PropertyDescription description={description} />
    <PropertyAmenities amenities={amenities} labels={amenitiesLabels} />
  </div>
);
