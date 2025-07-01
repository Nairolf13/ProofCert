import React from 'react';
import { Button } from './Button';

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
  <form onSubmit={onSubmit} className="flex flex-col gap-4 w-full max-w-md mx-auto">
    <div>
      <label className="block mb-1 font-medium text-primary-700">Date de début</label>
      <input type="date" className="w-full border-2 border-primary-200 rounded-xl p-3 text-lg" value={startDate} onChange={e => onStartDateChange(e.target.value)} required />
    </div>
    <div>
      <label className="block mb-1 font-medium text-primary-700">Date de fin</label>
      <input type="date" className="w-full border-2 border-primary-200 rounded-xl p-3 text-lg" value={endDate} onChange={e => onEndDateChange(e.target.value)} required />
    </div>
    <Button type="submit" isLoading={isBooking} className="w-full text-lg py-3 bg-gradient-to-tr from-primary-400 via-pink-400 to-blue-400 text-white font-bold shadow-lg hover:scale-[1.03] hover:shadow-2xl active:scale-95 transition-all duration-150">Réserver</Button>
    {calendarMessage && (
      <div className="mt-2 text-center text-base font-semibold text-primary-600 animate-fade-in">
        {calendarMessage}
      </div>
    )}
  </form>
);
