import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { propertyApi } from '../api/property';
import { rentalApi } from '../api/rental';
import type { Property, Review, Rental } from '../types';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { PropertyHeader } from '../components/PropertyHeader';
import { PropertyGallery } from '../components/PropertyGallery';
import { PropertyDetailsCard } from '../components/PropertyDetailsCard';
import { PropertyReviewsSection } from '../components/PropertyReviewsSection';
import { Calendar } from '../components/Calendar';

// Type de données pour l'édition d'un bien
interface EditPropertyData {
  title: string;
  address: string;
  country: string;
  region: string;
  city: string;
  area: number | '';
  price: number | '';
  pricePeriod: 'MONTH' | 'WEEK' | 'DAY';
  isAvailable: boolean;
  description: string;
}

const AMENITIES_LABELS: Record<string, string> = {
  Pool: 'Piscine',
  Wifi: 'Wifi',
  TV: 'TV',
  Kitchen: 'Cuisine',
  Washer: 'Lave-linge',
  'Free parking': 'Parking gratuit',
  AirConditioning: 'Climatisation',
  Heating: 'Chauffage',
  Elevator: 'Ascenseur',
  // Ajoute d'autres si besoin
};

export const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<EditPropertyData>({
    title: '',
    address: '',
    country: '',
    region: '',
    city: '',
    area: '',
    price: '',
    pricePeriod: 'MONTH',
    isAvailable: true,
    description: '',
  });
  const [editPhotoFiles, setEditPhotoFiles] = useState<File[]>([]);
  const [editAmenities, setEditAmenities] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [animDirection, setAnimDirection] = useState<'left' | 'right' | null>(null);
  const [zoomed, setZoomed] = React.useState(false);
  const zoomOverlayRef = React.useRef<HTMLDivElement>(null);
  const [calendarMessage, setCalendarMessage] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    propertyApi.getById(id)
      .then((prop) => {
        setProperty(prop);
        setEditData({
          title: prop.title || '',
          address: prop.address || '',
          country: prop.country || '',
          region: prop.region || '',
          city: prop.city || '',
          area: prop.area ?? '',
          price: prop.price ?? '',
          pricePeriod: prop.pricePeriod || 'MONTH',
          isAvailable: prop.isAvailable ?? true,
          description: prop.description || '',
        });
      })
      .catch(() => setError('Erreur lors du chargement du bien'))
      .finally(() => setIsLoading(false));
    // Récupère les avis
    propertyApi.getReviews(id).then(setReviews).catch(() => {});
  }, [id, isEditing, isBooking]);

  useEffect(() => {
    if (property && isEditing) {
      setEditData({
        title: property.title || '',
        address: property.address || '',
        country: property.country || '',
        region: property.region || '',
        city: property.city || '',
        area: property.area ?? '',
        price: property.price ?? '',
        pricePeriod: property.pricePeriod || 'MONTH',
        isAvailable: property.isAvailable ?? true,
        description: property.description || '',
      });
      setEditAmenities(property.amenities || []);
      setEditPhotoFiles([]);
    }
  }, [property, isEditing]);

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    try {
      let photoUrls = property.photos || [];
      if (editPhotoFiles.length > 0) {
        const uploads = await Promise.all(editPhotoFiles.map(async (file) => {
          const hash = await import('../utils/ipfs').then(m => m.uploadToIPFS(file));
          return `https://ipfs.io/ipfs/${hash}`;
        }));
        photoUrls = uploads;
      }
      const updated = await propertyApi.update(property.id, {
        ...editData,
        area: Number(editData.area),
        price: Number(editData.price),
        amenities: editAmenities,
        photos: photoUrls,
      });
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

  // Gestion du zoom plein écran
  useEffect(() => {
    if (!zoomed) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomed(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [zoomed]);

  // Animation slide/fade
  useEffect(() => {
    if (!animDirection) return;
    const timeout = setTimeout(() => setAnimDirection(null), 350);
    return () => clearTimeout(timeout);
  }, [animDirection, currentPhoto]);

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (error) return <div className="text-red-500 text-center font-semibold py-8">{error}</div>;
  if (!property) return <div className="text-center text-gray-400 py-16 text-lg">Bien introuvable</div>;

  const isOwner = user && user.id === property.ownerId;
  // Correction : définir propertyRentals à [] si rentals n'est pas défini
  const propertyRentals: Rental[] = property && Array.isArray(property.rentals) ? property.rentals : [];

  function isRangeAvailable(start: string, end: string) {
    const s = new Date(start);
    const e = new Date(end);
    return !propertyRentals.some((r: Rental) => {
      const rs = new Date(r.startDate);
      const re = r.endDate ? new Date(r.endDate) : rs;
      return (s <= re && e >= rs);
    });
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property || !user) {
      setCalendarMessage("Vous devez être connecté pour réserver.");
      return;
    }
    if (!startDate || !endDate) {
      setCalendarMessage("Veuillez choisir une date de début et de fin.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setCalendarMessage("La date de fin doit être après la date de début.");
      return;
    }
    if (!isRangeAvailable(startDate, endDate)) {
      setCalendarMessage("Ce créneau n'est pas disponible. Veuillez choisir d'autres dates.");
      return;
    }
    setIsBooking(true);
    try {
      const currentUser = user;
      if (user.role !== 'OWNER') {
        await propertyApi.promoteToOwner();
        if (typeof refreshUser === 'function') {
          await refreshUser();
        }
      }
      await rentalApi.create({ propertyId: property.id, tenantId: currentUser.id, startDate, endDate });
      setCalendarMessage("Réservation effectuée avec succès !");
      setStartDate(''); setEndDate('');
      setTimeout(() => setCalendarMessage(null), 3000);
      // Ajout : refetch du bien pour mettre à jour les réservations
      const updatedProperty = await propertyApi.getById(property.id);
      setProperty(updatedProperty);
    } catch (err: unknown) {
      let status: number | undefined;
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const response = (err as { response?: { status?: number } }).response;
        if (response && typeof response.status === 'number') {
          status = response.status;
        }
      }
      if (status === 403) {
        setCalendarMessage("Vous n'avez pas les droits pour réserver ce bien.");
      } else {
        setCalendarMessage("Erreur lors de la réservation.");
      }
    } finally {
      setIsBooking(false);
    }
  };

  // Suppression d'un avis
  const handleDeleteReview = async (reviewId: string) => {
    try {
      await propertyApi.deleteReview(reviewId);
      const updated = await propertyApi.getReviews(property!.id);
      setReviews(updated);
    } catch {
      alert("Erreur lors de la suppression de l'avis.");
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-2 md:px-8 animate-fade-in flex flex-col gap-10">
      {/* HEADER ULTRA VISUEL */}
      <PropertyHeader
        title={property.title || ''}
        isAvailable={!!property.isAvailable}
        price={property.price ?? 0}
        pricePeriod={property.pricePeriod || ''}
        area={property.area ?? 0}
        address={property.address || ''}
        city={property.city || ''}
        region={property.region || ''}
        country={property.country || ''}
        createdAt={property.createdAt || ''}
        owner={property.owner}
      />

      {/* SECTION PRINCIPALE façon "Airbnb premium" : galerie immersive, infos/services/description/actions en dessous */}
      <section className="w-full max-w-5xl flex flex-col gap-10 items-center md:items-start mx-auto">
        {/* GALERIE PHOTOS ENTIÈRE, MODERNE, AVEC MINIATURES */}
        <div className="w-full max-w-5xl flex flex-col items-center justify-start mx-auto">
          <PropertyGallery
            photos={property.photos || []}
            currentPhoto={currentPhoto}
            setCurrentPhoto={setCurrentPhoto}
            animDirection={animDirection}
            zoomed={zoomed}
            setZoomed={setZoomed}
            zoomOverlayRef={zoomOverlayRef as React.RefObject<HTMLDivElement>}
            title={property.title || ''}
          />
        </div>
        {/* SERVICES/AGRÉMENTS + DESCRIPTION + ACTIONS EN DESSOUS DES PHOTOS */}
        <div className="w-full max-w-5xl flex flex-col gap-8 items-stretch justify-start mx-auto">
          <PropertyDetailsCard
            amenities={property.amenities || []}
            amenitiesLabels={AMENITIES_LABELS}
            description={property.description || ''}
            isOwner={!!isOwner}
            isEditing={isEditing}
            isDeleting={isDeleting}
            onEdit={() => setIsEditing(true)}
            onDelete={handleDelete}
          />
        </div>
      </section>

      {/* MODAL EDITION */}
      {isEditing && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white p-8 text-left align-middle shadow-2xl transition-all flex flex-col gap-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-2xl font-bold leading-6 text-primary-700">Modifier le bien</h3>
                <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-primary-500 text-2xl font-bold focus:outline-none">×</button>
              </div>
              <form onSubmit={handleEdit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-primary-700 font-semibold mb-1">Titre</label>
                    <input type="text" className="w-full border-2 border-primary-200 rounded-xl p-3" value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-primary-700 font-semibold mb-1">Adresse</label>
                    <input type="text" className="w-full border-2 border-primary-200 rounded-xl p-3" value={editData.address} onChange={e => setEditData({ ...editData, address: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-primary-700 font-semibold mb-1">Pays</label>
                    <input type="text" className="w-full border-2 border-primary-200 rounded-xl p-3" value={editData.country} onChange={e => setEditData({ ...editData, country: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-primary-700 font-semibold mb-1">Région</label>
                    <input type="text" className="w-full border-2 border-primary-200 rounded-xl p-3" value={editData.region} onChange={e => setEditData({ ...editData, region: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-primary-700 font-semibold mb-1">Ville</label>
                    <input type="text" className="w-full border-2 border-primary-200 rounded-xl p-3" value={editData.city} onChange={e => setEditData({ ...editData, city: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-primary-700 font-semibold mb-1">Surface (m²)</label>
                    <input type="number" min="0" className="w-full border-2 border-primary-200 rounded-xl p-3" value={editData.area} onChange={e => setEditData({ ...editData, area: e.target.value === '' ? '' : Number(e.target.value) })} required />
                  </div>
                  <div>
                    <label className="block text-primary-700 font-semibold mb-1">Prix (€)</label>
                    <input type="number" min="0" className="w-full border-2 border-primary-200 rounded-xl p-3" value={editData.price} onChange={e => setEditData({ ...editData, price: e.target.value === '' ? '' : Number(e.target.value) })} required />
                  </div>
                  <div>
                    <label className="block text-primary-700 font-semibold mb-1">Période de prix</label>
                    <select
                      className="w-full border-2 border-primary-200 rounded-xl p-3"
                      value={editData.pricePeriod}
                      onChange={e =>
                        setEditData({
                          ...editData,
                          pricePeriod: e.target.value as 'DAY' | 'WEEK' | 'MONTH',
                        })
                      }
                    >
                      <option value="DAY">/jour</option>
                      <option value="WEEK">/semaine</option>
                      <option value="MONTH">/mois</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-primary-700 font-semibold mb-1">Statut</label>
                    <select className="w-full border-2 border-primary-200 rounded-xl p-3" value={editData.isAvailable ? '1' : '0'} onChange={e => setEditData({ ...editData, isAvailable: e.target.value === '1' })}>
                      <option value="1">Disponible</option>
                      <option value="0">Non disponible</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-primary-700 font-semibold mb-1">Description</label>
                  <textarea className="w-full border-2 border-primary-200 rounded-xl p-3" value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} rows={3} required />
                </div>
                <div>
                  <label className="block text-primary-700 font-semibold mb-1">Équipements</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Object.keys(AMENITIES_LABELS).map(a => (
                      <label key={a} className={`px-3 py-1 rounded-xl border cursor-pointer select-none ${editAmenities.includes(a) ? 'bg-primary-100 border-primary-400 text-primary-700 font-bold' : 'bg-white border-primary-200 text-primary-400'}`}>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={editAmenities.includes(a)}
                          onChange={() => setEditAmenities(editAmenities.includes(a) ? editAmenities.filter(x => x !== a) : [...editAmenities, a])}
                        />
                        {AMENITIES_LABELS[a]}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-primary-700 font-semibold mb-1">Photos</label>
                  <input type="file" accept="image/*" multiple className="w-full border-2 border-primary-200 rounded-xl p-3" onChange={e => setEditPhotoFiles(e.target.files ? Array.from(e.target.files) : [])} />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editPhotoFiles.length > 0
                      ? editPhotoFiles.map((file, i) => (
                          <img key={i} src={URL.createObjectURL(file)} alt="Prévisualisation" className="w-20 h-20 object-cover rounded-xl border border-primary-200" />
                      ))
                      : property?.photos?.map((url, i) => (
                          <img key={i} src={url} alt="Photo existante" className="w-20 h-20 object-cover rounded-xl border border-primary-200" />
                      ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} className="px-6 py-2">Annuler</Button>
                  <Button type="submit" variant="primary" className="px-6 py-2">Enregistrer</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SECTION RÉSERVATION & CALENDRIER */}
      <div className="w-full max-w-5xl bg-white/90 rounded-3xl shadow-xl border-2 border-white/70 p-6 flex flex-col gap-4 items-center mx-auto">
        <h3 className="text-2xl font-extrabold mb-2 text-primary-700 flex items-center gap-2 justify-center">📅 Réserver ce bien</h3>
        <div className="w-full max-w-md">
          {/* CALENDRIER DES RÉSERVATIONS */}
          <Calendar key={propertyRentals.map(r => r.id).join('-')} bookings={propertyRentals.map(r => ({ start: r.startDate, end: r.endDate || '' }))} />
        </div>
        {/* FORMULAIRE DE RÉSERVATION EN DESSOUS DU CALENDRIER */}
        <div className="w-full max-w-md mt-6">
          <PropertyReservationForm
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onSubmit={handleBooking}
            isBooking={isBooking}
            calendarMessage={calendarMessage}
          />
        </div>
      </div>

      {/* SECTION AVIS */}
      <PropertyReviewsSection
        reviews={reviews}
        user={user}
        onDeleteReview={handleDeleteReview}
        AddReviewForm={user && (
          <AddReviewForm propertyId={property.id} onReviewAdded={async () => {
            const updated = await propertyApi.getReviews(property.id);
            setReviews(updated);
          }} />
        )}
      />
    </div>
  );
};

// Formulaire d'ajout d'avis (composant interne)
const AddReviewForm: React.FC<{ propertyId: string; onReviewAdded: () => void }> = ({ propertyId, onReviewAdded }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !comment.trim()) {
      setError('Merci de donner une note et un commentaire.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await propertyApi.addReview(propertyId, { rating, comment });
      setSuccess(true);
      setComment('');
      setRating(0);
      onReviewAdded();
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      setError("Erreur lors de l'envoi de l'avis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 bg-primary-50 rounded-2xl p-4 border border-primary-100 shadow animate-fade-in">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-primary-700">Votre note :</span>
        {Array.from({ length: 5 }).map((_, i) => (
          <button
            type="button"
            key={i}
            className={`focus:outline-none ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            onClick={() => setRating(i + 1)}
            aria-label={`Donner ${i + 1} étoile${i > 0 ? 's' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill={i < rating ? 'currentColor' : 'none'} viewBox="0 0 24 24">
              <path d="M12 .587l3.668 7.431 8.209 1.188-5.934 5.759 1.398 8.165L12 18.896l-7.341 3.86 1.398-8.165-5.934-5.759 8.209-1.188z" />
            </svg>
          </button>
        ))}
      </div>
      <textarea
        className="w-full border-2 border-primary-200 rounded-xl p-3 text-lg"
        placeholder="Votre commentaire..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={3}
        required
      />
      <div className="flex items-center gap-2">
        <Button type="submit" isLoading={loading} className="bg-primary-500 text-white px-6 py-2 rounded-xl font-bold shadow hover:bg-primary-600 transition">Envoyer</Button>
        {success && <span className="text-green-600 font-semibold animate-fade-in">Merci pour votre avis !</span>}
        {error && <span className="text-red-500 font-semibold animate-fade-in">{error}</span>}
      </div>
    </form>
  );
};

// Nouveau composant PropertyReservationForm
const PropertyReservationForm: React.FC<{
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isBooking: boolean;
  calendarMessage: string | null;
}> = ({ startDate, endDate, onStartDateChange, onEndDateChange, onSubmit, isBooking, calendarMessage }) => {
  return (
    <form onSubmit={onSubmit} className="bg-primary-50 p-6 rounded-2xl shadow-md flex flex-col gap-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-primary-700 font-semibold mb-1">Date de début</label>
          <input
            type="date"
            className="w-full border-2 border-primary-200 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            value={startDate}
            onChange={e => onStartDateChange(e.target.value)}
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-primary-700 font-semibold mb-1">Date de fin</label>
          <input
            type="date"
            className="w-full border-2 border-primary-200 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            value={endDate}
            onChange={e => onEndDateChange(e.target.value)}
            required
          />
        </div>
      </div>
      {calendarMessage && (
        <div className={`text-center py-2 rounded-xl font-semibold ${calendarMessage.includes('succès') ? 'text-green-600' : 'text-red-600'}`}>
          {calendarMessage}
        </div>
      )}
      <Button type="submit" variant="primary" className="w-full py-3 text-lg font-bold flex items-center justify-center gap-2">
        {isBooking ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4zm16 0a8 8 0 01-8 8v-8h8z"></path>
            </svg>
            Chargement...
          </>
        ) : (
          'Réserver maintenant'
        )}
      </Button>
    </form>
  );
};
