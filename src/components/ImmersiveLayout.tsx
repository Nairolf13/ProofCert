import React from 'react';

export const ImmersiveLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen w-full bg-app-background font-serif text-gray-900 overflow-x-hidden">
    <main className="w-full flex flex-col items-center justify-center px-2 md:px-0 py-8">
      {children}
    </main>
  </div>
);
