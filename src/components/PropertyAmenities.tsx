import React from 'react';

interface PropertyAmenitiesProps {
  amenities: string[];
  labels: Record<string, string>;
}

export const PropertyAmenities: React.FC<PropertyAmenitiesProps> = ({ amenities, labels }) => (
  amenities && amenities.length > 0 ? (
    <div className="relative">
      <div className="flex items-center gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-primary tracking-tight">
            Équipements & services inclus
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {amenities.map((a: string) => (
          <div key={a} className="group relative">
            <div className="bg-surface border-2 border-primary-100 rounded-2xl p-4 hover:shadow-xl hover:scale-105 transition-all duration-300 hover:border-primary-300 card-shadow">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md">
                  •
                </div>
                <span className="text-gray-800 font-semibold text-sm group-hover:text-pink-700 transition-colors">
                  {labels[a] || a}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : null
);
