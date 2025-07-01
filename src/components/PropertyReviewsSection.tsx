import React, { useState } from 'react';
import type { Review, User } from '../types';
import { ReviewCard } from './ReviewCard';
import { ConfirmDialog } from './ConfirmDialog';

interface PropertyReviewsSectionProps {
  reviews: Review[];
  user?: User | null;
  onDeleteReview: (id: string) => Promise<void>;
  AddReviewForm?: React.ReactNode;
}

export const PropertyReviewsSection: React.FC<PropertyReviewsSectionProps> = ({
  reviews,
  user,
  onDeleteReview,
  AddReviewForm,
}) => {
  const [showAll, setShowAll] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    setLoading(true);
    await onDeleteReview(reviewToDelete);
    setLoading(false);
    setReviewToDelete(null);
  };

  return (
    <section className="w-full max-w-5xl mx-auto mt-8 mb-8">
      <h3 className="text-2xl font-extrabold mb-4 text-primary-700 flex items-center gap-2">⭐ Avis des locataires</h3>
      {reviews.length === 0 && (
        <div className="text-gray-400 text-center mb-4">Aucun avis pour ce bien pour le moment.</div>
      )}
      {reviews.length > 0 && (
        <div className="flex flex-col gap-4">
          {(showAll ? reviews : reviews.slice(0, 3)).map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUser={user}
              onAskDelete={setReviewToDelete}
            />
          ))}
          {reviews.length > 3 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="mt-2 text-primary-600 font-semibold underline hover:text-primary-800 transition"
            >Voir tous les avis ({reviews.length})</button>
          )}
          {showAll && reviews.length > 3 && (
            <button
              onClick={() => setShowAll(false)}
              className="mt-2 text-primary-600 font-semibold underline hover:text-primary-800 transition"
            >Réduire</button>
          )}
        </div>
      )}
      {AddReviewForm}
      <ConfirmDialog
        open={!!reviewToDelete}
        title="Supprimer l'avis"
        description="Êtes-vous sûr de vouloir supprimer cet avis ? Cette action est irréversible."
        confirmLabel={loading ? 'Suppression...' : 'Supprimer'}
        onCancel={() => setReviewToDelete(null)}
        onConfirm={handleConfirmDelete}
        confirmClassName="bg-red-600 hover:bg-red-700 text-white"
      />
    </section>
  );
};
