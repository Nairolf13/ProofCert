import React from 'react';

interface PropertyAmenitiesProps {
  amenities: string[];
  labels: Record<string, string>;
}

export const PropertyAmenities: React.FC<PropertyAmenitiesProps> = ({ amenities, labels }) => (
  amenities && amenities.length > 0 ? (
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl font-bold text-primary-700 mb-1 tracking-tight">Ce que ce bien offre</h2>
      <div className="flex flex-wrap gap-3">
        {amenities.map((a: string) => (
          <span key={a} className="px-4 py-2 rounded-xl bg-primary-50 border border-primary-200 text-primary-700 font-semibold text-base shadow-sm">
            {labels[a] || a}
          </span>
        ))}
      </div>
    </div>
  ) : null
);
