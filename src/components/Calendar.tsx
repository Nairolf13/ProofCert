import React, { useState } from 'react';

interface CalendarProps {
  bookings: Array<{ start: string; end: string }>;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function isDateBooked(date: string, bookings: Array<{ start: string; end: string }>) {
  // Compare uniquement la partie YYYY-MM-DD
  const d = date;
  return bookings.some(b => {
    const start = b.start.slice(0, 10); // YYYY-MM-DD
    const end = b.end ? b.end.slice(0, 10) : start;
    return d >= start && d <= end;
  });
}

export const Calendar: React.FC<Pick<CalendarProps, 'bookings'>> = ({ bookings }) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = new Date(year, month, 1).getDay();

  // Génère les jours du calendrier
  const days: Array<{ date: string; booked: boolean }> = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({ date: dateStr, booked: isDateBooked(dateStr, bookings) });
  }

  // Navigation mois
  const prevMonth = () => {
    if (month === 0) {
      setMonth(11); setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0); setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  return (
    <div className="w-full max-w-md mx-auto relative">
      {/* Calendrier principal avec design professionnel - hauteur fixe pour correspondre au formulaire */}
      <div className="card-shadow rounded-2xl p-6 overflow-hidden relative h-[520px] flex flex-col bg-surface">
        
        {/* Motifs décoratifs subtils */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-2 right-2 w-16 h-16 bg-primary rounded-full blur-2xl"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 bg-accent rounded-full blur-xl"></div>
        </div>

        <div className="relative flex-1 flex flex-col">
          {/* Header du calendrier */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={prevMonth} 
              className="w-10 h-10 rounded-full bg-primary-light border border-light hover:bg-primary-100 transition-all duration-200 flex items-center justify-center group shadow-sm"
              aria-label="Mois précédent"
            >
              <svg className="w-5 h-5 text-primary group-hover:text-primary-dark transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="text-center">
              <h3 className="text-xl font-black text-primary tracking-tight">
                {monthNames[month]}
              </h3>
              <p className="text-sm font-semibold text-secondary mt-1">{year}</p>
            </div>
            
            <button 
              onClick={nextMonth} 
              className="w-10 h-10 rounded-full bg-primary-light border border-light hover:bg-primary-100 transition-all duration-200 flex items-center justify-center group shadow-sm"
              aria-label="Mois suivant"
            >
              <svg className="w-5 h-5 text-primary group-hover:text-primary-dark transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Section principale du calendrier avec flex-grow */}
          <div className="flex-1 flex flex-col">
            {/* Jours de la semaine */}
            <div className="grid grid-cols-7 gap-1 mb-3">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                <div key={index} className="text-center py-2">
                  <span className="text-xs font-bold text-secondary uppercase tracking-wide">
                    {day}
                  </span>
                </div>
              ))}
            </div>

            {/* Grille des jours - prend l'espace restant */}
            <div className="grid grid-cols-7 gap-1 flex-1">
              {/* Cases vides pour le début du mois */}
              {Array(firstDay === 0 ? 6 : firstDay - 1).fill(null).map((_, i) => (
                <div key={`empty-${i}`} className="h-9"></div>
              ))}
              
              {/* Jours du mois */}
              {days.map(({ date, booked }) => {
                const dayNumber = parseInt(date.split('-')[2], 10);
                const isToday = date === new Date().toISOString().slice(0, 10);
                
                return (
                  <div key={date} className="flex items-center justify-center">
                    <div
                      className={`
                        w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-200 cursor-pointer relative overflow-hidden
                        ${isToday ? 
                          'gradient-primary text-white shadow-lg scale-105 ring-2 ring-primary-light' : 
                          booked ? 
                            'bg-red-100 text-red-600 cursor-not-allowed' :
                            'bg-surface text-secondary hover:bg-primary-light hover:text-primary hover:scale-105 border border-light hover:border-primary'
                        }
                      `}
                    >
                      {booked && (
                        <div className="absolute inset-0 bg-red-400/20 flex items-center justify-center">
                          <div className="w-6 h-0.5 bg-red-500 rounded rotate-45"></div>
                        </div>
                      )}
                      <span className={booked ? 'opacity-60' : ''}>{dayNumber}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Légende en bas */}
          <div className="mt-6 pt-4 border-t border-light">
            <div className="flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full gradient-primary"></div>
                <span className="text-secondary font-medium">Aujourd'hui</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-100 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-0.5 bg-red-500 rounded rotate-45"></div>
                  </div>
                </div>
                <span className="text-secondary font-medium">Réservé</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-surface border border-medium"></div>
                <span className="text-secondary font-medium">Libre</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
