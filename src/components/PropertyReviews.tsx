import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import type { Review } from '../types';

interface PropertyReviewsProps {
  reviews: Review[];
  showAllReviews: boolean;
  setShowAllReviews: (v: boolean) => void;
  user: import('../types').User | null;
  property: import('../types').Property;
  handleDeleteReview: (id: string) => void;
  deleteSuccess: boolean;
  AddReviewForm: React.FC<{ propertyId: string; onReviewAdded: () => void }>;
  onReviewAdded: () => void;
}

export const PropertyReviews: React.FC<PropertyReviewsProps> = ({
  reviews, showAllReviews, setShowAllReviews, user, property, handleDeleteReview, deleteSuccess, AddReviewForm, onReviewAdded
}) => (
  <section className="w-full max-w-5xl mx-auto mt-8 mb-8">
    <h3 className="text-2xl font-extrabold mb-4 text-primary-700 flex items-center gap-2">⭐ Avis des locataires</h3>
    {reviews.length === 0 && (
      <div className="text-gray-400 text-center mb-4">Aucun avis pour ce bien pour le moment.</div>
    )}
    {reviews.length > 0 && (
      <div className="flex flex-col gap-4">
        {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review: Review) => (
          <div key={review.id} className="bg-white/90 border border-primary-100 rounded-2xl p-4 shadow flex flex-col gap-1 relative animate-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-primary-700">{review.user && typeof review.user.username === 'string' && review.user.username.trim() ? review.user.username : 'Utilisateur'}</span>
              <span className="flex items-center gap-1 ml-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`} />
                ))}
              </span>
              <span className="text-xs text-gray-400 ml-2">{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="text-gray-700 text-base">{review.comment}</div>
            {user && review.user && user.id === review.user.id ? (
              <button
                onClick={() => handleDeleteReview(review.id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm font-bold px-2 py-1 rounded focus:outline-none"
                title="Supprimer l'avis"
              >Supprimer</button>
            ) : null}
          </div>
        ))}
        {reviews.length > 3 && !showAllReviews && (
          <button
            onClick={() => setShowAllReviews(true)}
            className="mt-2 text-primary-600 font-semibold underline hover:text-primary-800 transition"
          >Voir tous les avis ({reviews.length})</button>
        )}
        {showAllReviews && reviews.length > 3 && (
          <button
            onClick={() => setShowAllReviews(false)}
            className="mt-2 text-primary-600 font-semibold underline hover:text-primary-800 transition"
          >Réduire</button>
        )}
        {deleteSuccess && (
          <div className="text-green-600 text-center font-semibold animate-fade-in">Avis supprimé avec succès.</div>
        )}
      </div>
    )}
    {/* Formulaire d'ajout d'avis */}
    {user && user.id !== property.ownerId && (
      <AddReviewForm propertyId={property.id} onReviewAdded={onReviewAdded} />
    )}
  </section>
);
