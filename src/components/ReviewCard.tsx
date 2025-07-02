import React from 'react';
import { UserIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import type { Review, User } from '../types';

interface ReviewCardProps {
  review: Review;
  currentUser?: User | null;
  onDelete?: (id: string) => void;
  onAskDelete?: (id: string) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, currentUser, onDelete, onAskDelete }) => (
  <div className="p-4 bg-primary-50 rounded-xl shadow-sm flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Avatar de l'utilisateur */}
        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primary-200 bg-white flex items-center justify-center flex-shrink-0">
          {review.user?.profileImage ? (
            <img 
              src={review.user.profileImage} 
              alt={`Photo de profil de ${review.user.username || 'Utilisateur'}`} 
              className="w-full h-full object-cover" 
              loading="lazy" 
            />
          ) : (
            <UserIcon className="w-6 h-6 text-primary-500" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-primary-700 font-semibold">{review.user && typeof review.user.username === 'string' && review.user.username.trim() ? review.user.username : 'Utilisateur inconnu'}</span>
          <div className="flex gap-1">
            {Array.from({ length: review.rating }).map((_, i) => (
              <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
            ))}
          </div>
        </div>
      </div>
      {currentUser && review.user && currentUser.id === review.user.id && (
        <button
          onClick={() => onAskDelete ? onAskDelete(review.id) : onDelete?.(review.id)}
          className="text-red-500 hover:text-red-700 transition-colors"
          aria-label="Supprimer l'avis"
        >
          <XCircleIcon className="w-6 h-6" />
        </button>
      )}
    </div>
    <p className="text-gray-700">{review.comment}</p>
  </div>
);
