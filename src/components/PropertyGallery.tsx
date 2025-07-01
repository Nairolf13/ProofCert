import React from 'react';

interface PropertyGalleryProps {
  photos: string[];
  currentPhoto: number;
  setCurrentPhoto: (i: number) => void;
  animDirection: 'left' | 'right' | null;
  zoomed: boolean;
  setZoomed: (z: boolean) => void;
  zoomOverlayRef: React.RefObject<HTMLDivElement>;
  title: string;
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({
  photos,
  currentPhoto,
  setCurrentPhoto,
  animDirection,
  zoomed,
  setZoomed,
  zoomOverlayRef,
  title,
}) => (
  <div className="relative w-full max-w-5xl mx-auto">
    {zoomed && (
      <div
        ref={zoomOverlayRef}
        className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center animate-fade-in-fast"
        onClick={e => { if (e.target === zoomOverlayRef.current) setZoomed(false); }}
      >
        <button
          className="absolute top-6 right-8 bg-white/90 rounded-full p-3 shadow-xl hover:bg-primary-100 focus:outline-none"
          onClick={() => setZoomed(false)}
          aria-label="Fermer le zoom"
        >✕</button>
        <img
          src={photos[currentPhoto]}
          alt={title}
          className="w-full max-w-5xl max-h-[80vh] object-contain rounded-2xl shadow-2xl bg-black"
          draggable={false}
        />
      </div>
    )}
    <div className="w-full aspect-[2/0.7] md:aspect-[2.5/1] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/70 bg-gradient-to-br from-primary-50 via-white to-primary-100 relative">
      {photos && photos.length > 0 && (
        <>
          <img
            src={photos[currentPhoto]}
            alt={title}
            className={`object-cover w-full h-full transition-all duration-300 cursor-zoom-in ${animDirection === 'left' ? 'animate-slide-left' : ''} ${animDirection === 'right' ? 'animate-slide-right' : ''}`}
            onClick={() => setZoomed(true)}
            draggable={false}
            style={{ objectFit: 'cover', height: '100%', width: '100%' }}
          />
          {photos.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-3 shadow-xl hover:bg-primary-100 focus:outline-none text-3xl font-bold"
                onClick={() => setCurrentPhoto(currentPhoto === 0 ? photos.length - 1 : currentPhoto - 1)}
                aria-label="Photo précédente"
              >‹</button>
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-3 shadow-xl hover:bg-primary-100 focus:outline-none text-3xl font-bold"
                onClick={() => setCurrentPhoto(currentPhoto === photos.length - 1 ? 0 : currentPhoto + 1)}
                aria-label="Photo suivante"
              >›</button>
            </>
          )}
          {photos.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 bg-white/80 rounded-xl px-3 py-2 shadow-lg">
              {photos.map((url: string, i: number) => (
                <img
                  key={i}
                  src={url}
                  alt={`Miniature ${i + 1}`}
                  className={`w-16 h-12 object-cover rounded-lg border-2 cursor-pointer transition-all duration-150 ${i === currentPhoto ? 'border-primary-500 scale-110 shadow' : 'border-white/70 opacity-70'}`}
                  onClick={() => setCurrentPhoto(i)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  </div>
);
