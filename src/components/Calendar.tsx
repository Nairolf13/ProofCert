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

  // Responsive grid: 7 cols desktop, 7 cols mobile, padding et taille adaptative
  return (
    <div className="w-full max-w-lg mx-auto bg-white/90 rounded-3xl shadow-2xl border-2 border-white/70 p-4 md:p-8 flex flex-col items-center gap-4 animate-fade-in">
      {/* Header navigation mois */}
      <div className="flex items-center justify-between w-full mb-2 gap-2">
        <button onClick={prevMonth} className="p-2 md:p-3 rounded-full bg-white shadow hover:bg-primary-100 text-primary-500 text-2xl font-bold transition active:scale-90" aria-label="Mois précédent">‹</button>
        <span className="font-extrabold text-xl md:text-2xl text-primary-700 drop-shadow-sm select-none">
          {new Date(year, month).toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={nextMonth} className="p-2 md:p-3 rounded-full bg-white shadow hover:bg-primary-100 text-primary-500 text-2xl font-bold transition active:scale-90" aria-label="Mois suivant">›</button>
      </div>
      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-xs md:text-base font-bold text-primary-400 mb-1 select-none w-full">
        {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(d => <div key={d}>{d}</div>)}
      </div>
      {/* Jours du mois */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 w-full">
        {Array(firstDay === 0 ? 6 : firstDay - 1).fill(null).map((_, i) => <div key={i}></div>)}
        {days.map(({ date, booked }) => {
          const isToday = date === new Date().toISOString().slice(0, 10);
          return (
            <div key={date} className="flex items-center justify-center">
              <span
                className={`aspect-square w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-xs md:text-base font-bold
                  border-2 transition-all duration-150
                  ${booked ? 'bg-red-200 text-red-400 border-red-300 line-through cursor-not-allowed' : ''}
                  ${isToday && !booked ? 'border-primary-400 bg-primary-50 text-primary-700 shadow' : ''}
                  ${!booked ? 'bg-white hover:bg-primary-100 active:scale-95 cursor-pointer' : ''}
                  select-none`}
                aria-label={booked ? 'Jour réservé' : 'Jour disponible'}
                tabIndex={-1}
              >
                {parseInt(date.split('-')[2], 10)}
              </span>
            </div>
          );
        })}
      </div>
      {/* Légende et explication */}
      <div className="flex flex-col items-center gap-2 mt-2 w-full">
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm">
          <span className="inline-flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-red-200 border border-red-400 inline-block"></span> <span className="text-red-500 font-semibold">Réservé</span></span>
          <span className="inline-flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-primary-400 border border-primary-500 inline-block"></span> <span className="text-primary-700 font-semibold">Aujourd’hui</span></span>
          <span className="inline-flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-white border border-gray-300 inline-block"></span> <span className="text-gray-500 font-semibold">Libre</span></span>
        </div>
        <div className="text-xs text-gray-400 mt-1 text-center">Les jours barrés sont déjà réservés. <span className="hidden md:inline">Sur mobile, glisse pour voir tout le mois.</span></div>
      </div>
      {/* Animation douce */}
      <style>{`
        @media (max-width: 640px) {
          .calendar-scroll { overflow-x: auto; }
        }
      `}</style>
    </div>
  );
};
