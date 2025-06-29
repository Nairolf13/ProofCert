import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { propertyApi } from '../api/property';
import type { Property } from '../types';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { UserIcon, HomeIcon, CheckCircleIcon, XCircleIcon, CalendarIcon, CurrencyEuroIcon, MapPinIcon, Squares2X2Icon } from '@heroicons/react/24/outline';

export const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<{ title: string; description?: string; address: string }>({ title: '', address: '', description: '' });
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [animDirection, setAnimDirection] = useState<'left' | 'right' | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const zoomOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    propertyApi.getById(id)
      .then((prop) => {
        setProperty(prop);
        setEditData({ title: prop.title, address: prop.address, description: prop.description });
      })
      .catch(() => setError('Erreur lors du chargement du bien'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    try {
      const updated = await propertyApi.update(property.id, editData);
      setProperty(updated);
      setIsEditing(false);
    } catch {
      setError('Erreur lors de la modification');
    }
  };

  const handleDelete = async () => {
    if (!property) return;
    setIsDeleting(true);
    try {
      await propertyApi.delete(property.id);
      window.location.href = '/properties';
    } catch {
      setError('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  // Gestion swipe tactile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const delta = touchEndX.current - touchStartX.current;
      if (Math.abs(delta) > 50) {
        if (delta < 0) {
          // Swipe gauche → image suivante
          setAnimDirection('left');
          setCurrentPhoto((prev) => prev === property!.photos.length - 1 ? 0 : prev + 1);
        } else {
          // Swipe droite → image précédente
          setAnimDirection('right');
          setCurrentPhoto((prev) => prev === 0 ? property!.photos.length - 1 : prev - 1);
        }
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Fermer le zoom plein écran (clic fond ou Echap)
  useEffect(() => {
    if (!zoomed) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomed(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [zoomed]);

  // Swipe dans le zoom overlay (mobile)
  const zoomTouchStartX = useRef<number | null>(null);
  const zoomTouchEndX = useRef<number | null>(null);
  const handleZoomTouchStart = (e: React.TouchEvent) => {
    zoomTouchStartX.current = e.touches[0].clientX;
  };
  const handleZoomTouchMove = (e: React.TouchEvent) => {
    zoomTouchEndX.current = e.touches[0].clientX;
  };
  const handleZoomTouchEnd = () => {
    if (zoomTouchStartX.current !== null && zoomTouchEndX.current !== null) {
      const delta = zoomTouchEndX.current - zoomTouchStartX.current;
      if (Math.abs(delta) > 50) {
        if (delta < 0) {
          setCurrentPhoto((prev) => prev === property!.photos.length - 1 ? 0 : prev + 1);
        } else {
          setCurrentPhoto((prev) => prev === 0 ? property!.photos.length - 1 : prev - 1);
        }
      }
    }
    zoomTouchStartX.current = null;
    zoomTouchEndX.current = null;
  };

  // Animation slide/fade
  useEffect(() => {
    if (animDirection) {
      const timeout = setTimeout(() => setAnimDirection(null), 350);
      return () => clearTimeout(timeout);
    }
  }, [animDirection, currentPhoto]);

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (error) return <div className="text-red-500 text-center font-semibold py-8">{error}</div>;
  if (!property) return <div className="text-center text-gray-400 py-16 text-lg">Bien introuvable</div>;

  const isOwner = user && user.id === property.ownerId;

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-2 md:px-8 animate-fade-in">
      {/* Header visuel */}
      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
        <div className="flex-1 min-w-0">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 drop-shadow-sm flex items-center gap-4 mb-2">
            <HomeIcon className="w-10 h-10 text-primary-500" />
            <span className="truncate">{property.title}</span>
          </h1>
          <div className="flex flex-wrap gap-2 items-center mb-2">
            <span className={`inline-flex items-center gap-1 px-4 py-1 rounded-full text-sm font-semibold shadow border ${property.isAvailable ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-600 border-red-200'}`}>{property.isAvailable ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />} {property.isAvailable ? 'Disponible' : 'Non disponible'}</span>
            <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium shadow border border-primary-100">
              <CalendarIcon className="w-5 h-5" />
              Ajouté le {new Date(property.createdAt).toLocaleDateString()}
            </span>
            <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium shadow border border-blue-100">
              <CurrencyEuroIcon className="w-5 h-5" />
              <span className="font-bold">{property.price} €</span>
            </span>
            <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-purple-50 text-purple-700 text-sm font-medium shadow border border-purple-100">
              <Squares2X2Icon className="w-5 h-5" />
              <span className="font-bold">{property.area} m²</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2 items-center text-gray-500 text-base mb-1">
            <MapPinIcon className="w-5 h-5 text-primary-400" />
            <span className="font-medium">{property.address}</span>
            <span className="text-gray-400">{property.city}</span>
            <span className="text-gray-400">{property.region}</span>
            <span className="text-gray-400">{property.country}</span>
          </div>
        </div>
        {/* Propriétaire */}
        {property.owner && (
          <div className="flex flex-col items-end gap-2 min-w-[180px]">
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur rounded-xl px-4 py-2 shadow border border-gray-100">
              <UserIcon className="w-7 h-7 text-primary-400" />
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">{property.owner.username || property.owner.email}</span>
                <span className="text-xs text-gray-500">Propriétaire</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Carrousel immersif */}
      {property.photos && property.photos.length > 0 && (
        <div className="mb-10">
          <div
            className="relative w-full max-h-[420px] flex items-center justify-center select-none rounded-3xl overflow-hidden shadow-2xl border border-white/40 bg-gradient-to-br from-primary-50 via-white to-primary-100"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={property.photos[currentPhoto]}
              alt={property.title}
              className={`w-full max-h-[420px] object-cover rounded-3xl transition-all duration-300 bg-gray-100
                ${animDirection === 'left' ? 'animate-slide-left' : ''}
                ${animDirection === 'right' ? 'animate-slide-right' : ''}
                cursor-zoom-in`
              }
              style={{ aspectRatio: '16/9' }}
              onClick={() => setZoomed(true)}
            />
            {property.photos.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-3 shadow-xl hover:bg-primary-100 focus:outline-none"
                  onClick={() => setCurrentPhoto((prev) => prev === 0 ? property.photos.length - 1 : prev - 1)}
                  aria-label="Photo précédente"
                >
                  <span className="text-3xl">‹</span>
                </button>
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-3 shadow-xl hover:bg-primary-100 focus:outline-none"
                  onClick={() => setCurrentPhoto((prev) => prev === property.photos.length - 1 ? 0 : prev + 1)}
                  aria-label="Photo suivante"
                >
                  <span className="text-3xl">›</span>
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {property.photos.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`w-3 h-3 rounded-full border border-primary-400 transition-all duration-150 ${i === currentPhoto ? 'bg-primary-500 scale-125 shadow' : 'bg-white/80'}`}
                      onClick={() => setCurrentPhoto(i)}
                      aria-label={`Aller à la photo ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Overlay plein écran pour le zoom */}
      {zoomed && property.photos && (
        <div
          ref={zoomOverlayRef}
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center animate-fade-in-fast"
          onClick={e => {
            if (e.target === zoomOverlayRef.current) setZoomed(false);
          }}
          onTouchStart={handleZoomTouchStart}
          onTouchMove={handleZoomTouchMove}
          onTouchEnd={handleZoomTouchEnd}
        >
          <button
            className="absolute top-6 right-8 bg-white/90 rounded-full p-3 shadow-xl hover:bg-primary-100 focus:outline-none"
            onClick={() => setZoomed(false)}
            aria-label="Fermer le zoom"
          >
            <span className="text-3xl">✕</span>
          </button>
          <div className="relative w-full max-w-4xl flex items-center justify-center">
            <img
              src={property.photos[currentPhoto]}
              alt={property.title}
              className="w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl bg-black"
              style={{ aspectRatio: '16/9' }}
              draggable={false}
            />
            {property.photos.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-4 shadow-xl hover:bg-primary-100 focus:outline-none"
                  onClick={e => { e.stopPropagation(); setCurrentPhoto((prev) => prev === 0 ? property.photos.length - 1 : prev - 1); }}
                  aria-label="Photo précédente"
                >
                  <span className="text-4xl">‹</span>
                </button>
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-4 shadow-xl hover:bg-primary-100 focus:outline-none"
                  onClick={e => { e.stopPropagation(); setCurrentPhoto((prev) => prev === property.photos.length - 1 ? 0 : prev + 1); }}
                  aria-label="Photo suivante"
                >
                  <span className="text-4xl">›</span>
                </button>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                  {property.photos.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`w-3.5 h-3.5 rounded-full border border-primary-400 transition-all duration-150 ${i === currentPhoto ? 'bg-primary-500 scale-125 shadow' : 'bg-white/80'}`}
                      onClick={e => { e.stopPropagation(); setCurrentPhoto(i); }}
                      aria-label={`Aller à la photo ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Description & actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
        <div className="md:col-span-2 bg-white/80 rounded-3xl shadow-xl border border-white/40 backdrop-blur-lg p-8 flex flex-col gap-6">
          <div className="text-gray-700 text-lg whitespace-pre-line leading-relaxed">
            {property.description}
          </div>
        </div>
        <div className="flex flex-col gap-4 items-stretch justify-start">
          {isOwner && !isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="primary" className="w-full text-lg py-3 shadow-lg">Modifier</Button>
          )}
          {isOwner && isEditing && (
            <form onSubmit={handleEdit} className="space-y-4 mb-6">
              <input className="w-full border rounded-xl p-3 text-lg" value={editData.title} onChange={e => setEditData(d => ({ ...d, title: e.target.value }))} required />
              <input className="w-full border rounded-xl p-3 text-lg" value={editData.address} onChange={e => setEditData(d => ({ ...d, address: e.target.value }))} required />
              <textarea className="w-full border rounded-xl p-3 text-lg" value={editData.description || ''} onChange={e => setEditData(d => ({ ...d, description: e.target.value }))} />
              <div className="flex gap-2">
                <Button type="submit" variant="primary" className="flex-1 py-3">Enregistrer</Button>
                <Button type="button" variant="secondary" className="flex-1 py-3" onClick={() => setIsEditing(false)}>Annuler</Button>
              </div>
            </form>
          )}
          {isOwner && !isEditing && (
            <Button onClick={handleDelete} variant="secondary" isLoading={isDeleting} className="w-full bg-red-500 hover:bg-red-600 text-white text-lg py-3 shadow-lg">Supprimer</Button>
          )}
          <Link to="/properties">
            <Button variant="secondary" className="w-full text-lg py-3">Retour à la liste</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Ajout des animations CSS (slide left/right)
// À placer dans App.css ou dans un fichier global CSS
//
// .animate-slide-left {
//   animation: slideLeft 0.35s cubic-bezier(0.4,0,0.2,1);
// }
// .animate-slide-right {
//   animation: slideRight 0.35s cubic-bezier(0.4,0,0.2,1);
// }
// @keyframes slideLeft {
//   from { transform: translateX(100%); opacity: 0.7; }
//   to { transform: translateX(0); opacity: 1; }
// }
// @keyframes slideRight {
//   from { transform: translateX(-100%); opacity: 0.7; }
//   to { transform: translateX(0); opacity: 1; }
// }
//
// Pour le zoom, la classe scale-110 et cursor-zoom-out sont déjà gérées par Tailwind.
