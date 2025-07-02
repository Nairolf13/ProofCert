import React from 'react';

interface PropertyDescriptionProps {
  description: string;
}

export const PropertyDescription: React.FC<PropertyDescriptionProps> = ({ description }) => (
  <div className="relative">
    <div className="flex items-center gap-3 mb-6">
     
      <div>
        <h3 className="text-2xl font-extrabold text-primary tracking-tight">
          Description
        </h3>
      </div>
    </div>

    <div className="relative bg-surface rounded-2xl p-6 border-2 border-primary-100 shadow-lg card-shadow">
      <div className="absolute top-4 left-4 text-4xl text-blue-300 font-serif">"</div>
      <div className="absolute bottom-4 right-4 text-4xl text-pink-300 font-serif rotate-180">"</div>
      
      <div className="relative z-10 px-6 py-2">
        <p className="text-gray-800 text-lg leading-relaxed font-medium whitespace-pre-line text-justify">
          {description}
        </p>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-1 gradient-primary rounded-b-2xl"></div>
    </div>
  </div>
);
