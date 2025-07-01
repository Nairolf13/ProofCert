import React from 'react';

interface PropertyDescriptionProps {
  description: string;
}

export const PropertyDescription: React.FC<PropertyDescriptionProps> = ({ description }) => (
  <div className="flex flex-col gap-2">
    <h3 className="text-xl font-bold text-primary-700 mb-1 tracking-tight">Description</h3>
    <div className="text-gray-700 text-lg whitespace-pre-line leading-relaxed font-medium">
      {description}
    </div>
  </div>
);
