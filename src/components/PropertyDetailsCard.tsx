import React from 'react';
import { PropertyAmenities } from './PropertyAmenities';
import { PropertyDescription } from './PropertyDescription';
import { PropertyOwnerActions } from './PropertyOwnerActions';

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
  isOwner,
  isEditing,
  isDeleting,
  onEdit,
  onDelete,
}) => (
  <div className="bg-white/95 rounded-3xl shadow-2xl border-2 border-white/80 p-8 flex flex-col gap-8">
    <PropertyAmenities amenities={amenities} labels={amenitiesLabels} />
    <PropertyDescription description={description} />
    <PropertyOwnerActions isOwner={isOwner} isEditing={isEditing} isDeleting={isDeleting} onEdit={onEdit} onDelete={onDelete} />
  </div>
);
