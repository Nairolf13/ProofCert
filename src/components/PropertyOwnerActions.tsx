import React from 'react';
import { Button } from './Button';

interface PropertyOwnerActionsProps {
  isOwner: boolean;
  isEditing: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export const PropertyOwnerActions: React.FC<PropertyOwnerActionsProps> = ({ isOwner, isEditing, isDeleting, onEdit, onDelete }) => (
  isOwner ? (
    <div className="flex flex-col md:flex-row gap-4 w-full mt-4">
      <Button onClick={onEdit} variant="primary" className="flex-1 text-lg py-3 shadow-lg" disabled={isEditing}>✏️ Modifier</Button>
      <Button onClick={onDelete} variant="secondary" isLoading={isDeleting} className="flex-1 bg-red-500 hover:bg-red-600 text-white text-lg py-3 shadow-lg">🗑️ Supprimer</Button>
    </div>
  ) : null
);
