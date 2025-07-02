import React from 'react';

interface PropertyReservationFormProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isBooking: boolean;
  calendarMessage: string | null;
}

export const PropertyReservationForm: React.FC<PropertyReservationFormProps> = ({
  startDate, endDate, onStartDateChange, onEndDateChange, onSubmit, isBooking, calendarMessage
}) => (
  <div className="w-full max-w-md mx-auto relative">
    {/* Formulaire avec design magazine - hauteur fixe pour correspondre au calendrier */}
    <div className="bg-surface backdrop-blur-sm rounded-2xl border border-primary-200 shadow-xl p-6 overflow-hidden relative h-[520px] flex flex-col card-shadow">
      
      {/* Motifs décoratifs subtils */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-2 left-2 w-16 h-16 bg-blue-300 rounded-full blur-2xl"></div>
        <div className="absolute bottom-2 right-2 w-12 h-12 bg-pink-300 rounded-full blur-xl"></div>
      </div>

      <div className="relative flex-1 flex flex-col">
        <form onSubmit={onSubmit} className="flex-1 flex flex-col justify-between">
          {/* Section supérieure avec les champs */}
          <div className="space-y-6">
            {/* Champs de dates avec design premium */}
            <div className="space-y-4">
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Date d'arrivée
                </label>
                <div className="relative">
                  <input 
                    type="date" 
                    className="w-full bg-white/80 border-2 border-blue-200/50 rounded-xl px-4 py-3 text-gray-800 font-medium focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100/50 transition-all duration-200 group-hover:border-blue-300"
                    value={startDate} 
                    onChange={e => onStartDateChange(e.target.value)} 
                    required 
                  />
                  <div className="absolute inset-0 rounded-xl bg-primary-light pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </div>
              </div>
              
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Date de départ
                </label>
                <div className="relative">
                  <input 
                    type="date" 
                    className="w-full bg-white/80 border-2 border-pink-200/50 rounded-xl px-4 py-3 text-gray-800 font-medium focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100/50 transition-all duration-200 group-hover:border-pink-300"
                    value={endDate} 
                    onChange={e => onEndDateChange(e.target.value)} 
                    required 
                  />
                  <div className="absolute inset-0 rounded-xl bg-primary-light pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </div>
              </div>
            </div>

            {/* Message de statut avec design élégant */}
            {calendarMessage && (
              <div className="p-4 rounded-xl bg-primary-light border border-primary-200 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <p className={`text-sm font-semibold ${
                    calendarMessage.includes('succès') ? 'text-green-700' :
                    calendarMessage.includes('erreur') || calendarMessage.includes('Erreur') ? 'text-red-700' :
                    'text-blue-700'
                  }`}>
                    {calendarMessage}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section inférieure avec le bouton */}
          <div className="space-y-6">
            {/* Bouton de réservation premium */}
            <button
              type="submit"
              disabled={isBooking}
              className="w-full gradient-primary text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
            >
              {/* Effet de brillance au hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              <div className="relative flex items-center justify-center gap-3">
                {isBooking ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Réservation en cours...</span>
                  </>
                ) : (
                  <span>Réserver maintenant</span>
                )}
              </div>
            </button>

            {/* Ligne décorative en bas */}
            <div className="pt-4 border-t border-blue-200/50">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <span className="font-medium">Réservation sécurisée</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
);
