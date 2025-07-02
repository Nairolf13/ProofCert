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
  const [showModal, setShowModal] = useState(false);
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
    <>
      {/* Section principale des avis */}
      <div className="relative overflow-hidden">
        {/* Header décoratif */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <h2 className="text-3xl md:text-4xl font-black text-accent">
              Avis des locataires
            </h2>
          </div>
          <div className="w-24 h-1 gradient-accent mx-auto rounded-full"></div>
        </div>

        {/* Conteneur principal avec fond magazine */}
        <div className="relative bg-surface backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl overflow-hidden card-shadow">
          {/* Motifs décoratifs de fond */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-300 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-orange-300 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-red-300 rounded-full blur-2xl"></div>
          </div>

          <div className="relative p-8 md:p-12">
            {reviews.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-bold text-gray-600 mb-2">Aucun avis pour le moment</h3>
                <p className="text-gray-500">Soyez le premier à laisser un avis sur ce bien !</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Aperçu des avis (maximum 2) */}
                <div className="space-y-4">
                  {reviews.slice(0, 2).map((review) => (
                    <div key={review.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-yellow-200/50 shadow-lg">
                      <ReviewCard
                        review={review}
                        currentUser={user}
                        onAskDelete={setReviewToDelete}
                      />
                    </div>
                  ))}
                </div>

                {/* Bouton "Voir tous les avis" si plus de 2 avis */}
                {reviews.length > 2 && (
                  <div className="text-center pt-6">
                    <button
                      onClick={() => setShowModal(true)}
                      className="inline-flex items-center gap-3 gradient-accent text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 relative overflow-hidden group"
                    >
                      {/* Effet de brillance au hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      
                      <div className="relative flex items-center gap-3">
                        <span>Voir tous les avis ({reviews.length})</span>
                      </div>
                    </button>
                  </div>
                )}

                {/* Statistiques des avis */}
                {reviews.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-yellow-200/50">
                    <div className="flex items-center justify-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-700">
                          {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}/5
                        </span>
                      </div>
                      <div className="w-px h-6 bg-yellow-300"></div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">
                          {reviews.length} avis au total
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Formulaire d'ajout d'avis */}
      {AddReviewForm}

      {/* Modal pour afficher tous les avis */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center animate-fade-in">
          <div className="w-full max-w-4xl mx-4 max-h-[90vh] transform overflow-hidden rounded-3xl bg-white/95 backdrop-blur-2xl shadow-2xl transition-all border-2 border-white/80">
            
            {/* Header de la modal */}
            <div className="sticky top-0 bg-accent-light border-b border-accent-200 p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="text-2xl font-bold text-accent">
                      Tous les avis
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {reviews.length} avis • Note moyenne : {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}/5
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="w-10 h-10 rounded-full bg-white/80 hover:bg-white transition-colors flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenu de la modal */}
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-surface backdrop-blur-sm rounded-2xl p-6 border border-accent-200 shadow-lg card-shadow">
                    <ReviewCard
                      review={review}
                      currentUser={user}
                      onAskDelete={setReviewToDelete}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Footer de la modal */}
            <div className="sticky bottom-0 bg-accent-light border-t border-accent-200 p-4">
              <div className="flex items-center justify-center">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 gradient-accent text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-200 shadow-lg"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialog de confirmation de suppression */}
      <ConfirmDialog
        open={!!reviewToDelete}
        title="Supprimer l'avis"
        description="Êtes-vous sûr de vouloir supprimer cet avis ? Cette action est irréversible."
        confirmLabel={loading ? 'Suppression...' : 'Supprimer'}
        onCancel={() => setReviewToDelete(null)}
        onConfirm={handleConfirmDelete}
        confirmClassName="bg-red-600 hover:bg-red-700 text-white"
      />
    </>
  );
};
