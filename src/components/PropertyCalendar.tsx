import React from 'react';
import { Calendar } from '../components/Calendar';

interface PropertyCalendarProps {
  bookings: { start: string; end: string }[];
}

export const PropertyCalendar: React.FC<PropertyCalendarProps> = ({ bookings }) => (
  <div className="w-full max-w-2xl mx-auto mb-4">
    <Calendar bookings={bookings} />
  </div>
);
