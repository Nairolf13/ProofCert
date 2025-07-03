import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyApi } from '../api/property';
import { rentalApi } from '../api/rental';
import { proofsApi } from '../api/proofs';
import type { Property, Review, Rental, Proof } from '../types';
import { Button } from '../components/Button';
import { useMultiversXAuth } from '../hooks/useMultiversXAuth';

import { useFavorites } from '../hooks/useFavorites';
import { PropertyGallery } from '../components/PropertyGallery';
import { PropertyHeader } from '../components/PropertyHeader';
import { PropertyDetailsCard } from '../components/PropertyDetailsCard';
import { PropertyReviewsSection } from '../components/PropertyReviewsSection';
import { Calendar } from '../components/Calendar';
import { PropertyReservationForm } from '../components/PropertyReservationForm';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { getIPFSUrl } from '../utils/ipfs';
import { AddProofPage } from './AddProofPage';

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
  // Équipements de base
  Pool: 'Piscine',
  Wifi: 'Wi-Fi',
  TV: 'Télévision',
  Kitchen: 'Cuisine équipée',
  Washer: 'Lave-linge',
  'Free parking': 'Parking gratuit',
  AirConditioning: 'Climatisation',
  Heating: 'Chauffage',
  Elevator: 'Ascenseur',
  Dryer: 'Sèche-linge',
  Dishwasher: 'Lave-vaisselle',
  Microwave: 'Micro-ondes',
  Oven: 'Four',
  Refrigerator: 'Réfrigérateur',
  Freezer: 'Congélateur',
  CoffeeMachine: 'Machine à café',
  Balcony: 'Balcon',
  Terrace: 'Terrasse',
  Garden: 'Jardin',
  Fireplace: 'Cheminée',
  Alarm: 'Système d\'alarme',
  VideoSurveillance: 'Vidéosurveillance',
  SafeBox: 'Coffre-fort',
  Garage: 'Garage',
  BBQ: 'Barbecue',
  GardenFurniture: 'Mobilier de jardin',
  AutomaticGate: 'Portail automatique',
  SmartHome: 'Domotique',
  HomeTheater: 'Home cinéma',
  Sauna: 'Sauna',
  Jacuzzi: 'Jacuzzi',
  GymEquipment: 'Équipement de sport',
  LibraryOffice: 'Bureau/Bibliothèque',
  GameRoom: 'Salle de jeux',
  WheelchairAccess: 'Accès handicapés',
  StairLift: 'Monte-escalier',
  PrivateEntrance: 'Entrée privée',
  WineCell: 'Cave à vin',
  ChargingStation: 'Borne de recharge électrique'
};

export const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useMultiversXAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
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
  const navigate = useNavigate();
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [showAddProof, setShowAddProof] = useState(false);

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
    // Récupère les preuves
    proofsApi.getByPropertyId(id).then(setProofs).catch(() => setProofs([]));
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

  if (isLoading) return <div className="min-h-screen w-full bg-surface-secondary flex justify-center items-center"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div></div>;
  if (error) return <div className="min-h-screen w-full bg-surface-secondary flex justify-center items-center"><div className="text-error text-center font-bold text-2xl">{error}</div></div>;
  if (!property) return <div className="min-h-screen w-full bg-surface-secondary flex justify-center items-center"><div className="text-center text-secondary text-2xl">Bien introuvable</div></div>;

  const isOwner = user?.address === property.ownerId;
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
      // Avec MultiversX, on utilise l'adresse du wallet comme identifiant
      if (user?.address) {
        await rentalApi.create({ 
          propertyId: property.id, 
          tenantId: user.address, 
          startDate, 
          endDate 
        });
        setCalendarMessage("Réservation effectuée avec succès !");
        setStartDate(''); 
        setEndDate('');
        setTimeout(() => setCalendarMessage(null), 3000);
        const updatedProperty = await propertyApi.getById(property.id);
        setProperty(updatedProperty);
      } else {
        setCalendarMessage("Erreur: adresse wallet non trouvée.");
      }
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
    <div className="min-h-screen w-full bg-surface-secondary font-serif text-primary">
      <section className="w-full max-w-6xl mx-auto py-8 px-4 md:px-8 animate-fade-in">

        {/* Property Header with title, price, area, and details */}
        <PropertyHeader
          title={property.title || 'Sans titre'}
          isAvailable={property.isAvailable || false}
          price={property.price || 0}
          pricePeriod={property.pricePeriod || 'MONTH'}
          area={property.area || 0}
          address={property.address || ''}
          city={property.city || ''}
          region={property.region || ''}
          country={property.country || ''}
          createdAt={property.createdAt || new Date().toISOString()}
          owner={property.owner}
          isOwner={!!isOwner}
          isEditing={isEditing}
          isDeleting={isDeleting}
          onEdit={() => setIsEditing(true)}
          onDelete={handleDelete}
          propertyId={property.id}
          isFavorite={isFavorite(property.id)}
          onToggleFavorite={toggleFavorite}
        />

        <section className="mb-12">
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
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-12">
          
          <div>
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
        </div>

        <section className="space-y-12">
          <div className="relative overflow-hidden">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                <h2 className="text-3xl md:text-4xl font-black text-primary">
                  Disponibilités & Réservation
                </h2>
              </div>
              <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
            </div>
            <div className="relative card-shadow rounded-3xl overflow-hidden">
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-secondary rounded-full blur-2xl"></div>
              </div>
              <div className="relative p-8 md:p-12">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-stretch">
                  <div className="flex flex-col space-y-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-primary mb-2">Calendrier des disponibilités</h3>
                      <p className="text-secondary font-medium">Consultez les créneaux libres</p>
                      <div className="w-16 h-0.5 bg-accent mx-auto mt-3 rounded-full"></div>
                    </div>
                    
                    <div className="flex-1 flex">
                      <Calendar 
                        key={propertyRentals.map(r => r.id).join('-')} 
                        bookings={propertyRentals.map(r => ({ start: r.startDate, end: r.endDate || '' }))} 
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Réserver ce bien</h3>
                      <p className="text-gray-600 font-medium">Sélectionnez vos dates de séjour</p>
                      <div className="w-16 h-0.5 gradient-primary mx-auto mt-3 rounded-full"></div>
                    </div>
                    
                    <div className="flex-1 flex">
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
                </div>

                <div className="flex items-center justify-center mt-12 mb-8">
                  <div className="flex-1 h-px bg-primary-light"></div>
                  <div className="px-4">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                  </div>
                  <div className="flex-1 h-px bg-primary-light"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Preuves associées */}
          <section className="my-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Preuves associées à ce bien</h2>
              <Button onClick={() => setShowAddProof(true)} variant="primary">Ajouter une preuve</Button>
            </div>
            <div className="bg-white/80 rounded-2xl shadow p-4 md:p-6 border border-primary/10">
              {proofs.length === 0 ? (
                <div className="text-gray-500">Aucune preuve associée à ce bien.</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {proofs.map((proof) => (
                    <Card key={proof.id} className="cursor-pointer hover:shadow-lg transition min-h-[180px] max-w-xs mx-auto">
                      <div onClick={() => navigate(`/proof/${proof.id}`)}>
                        <CardHeader>
                          <CardTitle className="truncate text-base font-semibold">{proof.title || proof.contentType}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xs text-gray-500 mb-1 truncate">{proof.hash}</div>
                          <div className="text-xs text-gray-700 mb-1">{proof.contentType}</div>
                          {proof.ipfsHash && proof.contentType === 'IMAGE' && (
                            <img src={getIPFSUrl(proof.ipfsHash)} alt={proof.title || 'Preuve'} className="w-full h-24 object-contain rounded border my-1" />
                          )}
                          {proof.ipfsHash && proof.contentType === 'DOCUMENT' && (
                            <a href={getIPFSUrl(proof.ipfsHash)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">Voir le document</a>
                          )}
                          <div className="text-[10px] text-gray-400 mt-1">{new Date(proof.timestamp).toLocaleString()}</div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>

          <PropertyReviewsSection
            reviews={reviews}
            user={user ? {
              id: user.address,
              email: user.username || user.address,
              username: user.username || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              walletAddress: user.address
            } : null}
            onDeleteReview={handleDeleteReview}
            AddReviewForm={user && (
              <AddReviewForm propertyId={property.id} onReviewAdded={async () => {
                const updated = await propertyApi.getReviews(property.id);
                setReviews(updated);
              }} />
            )}
          />
        </section>
      </section>

      {isEditing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 backdrop-blur-sm flex items-center justify-center animate-fade-in">
          <div className="form-modern w-full max-w-4xl mx-4 transform overflow-hidden text-left align-middle transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">Modifier le bien</h3>
              <button onClick={() => setIsEditing(false)} className="text-secondary hover:text-primary text-2xl font-bold focus:outline-none transition-colors">×</button>
            </div>
            <form onSubmit={handleEdit} className="space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-primary font-semibold mb-1">Titre</label>
                  <input type="text" className="input-focus-glow w-full border-2 border-light rounded-xl p-3 transition-colors" value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-primary font-semibold mb-1">Adresse</label>
                  <input type="text" className="w-full border-2 border-purple-200 rounded-xl p-3 focus:border-purple-400 focus:outline-none transition-colors" value={editData.address} onChange={e => setEditData({ ...editData, address: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-purple-700 font-semibold mb-1">Ville</label>
                  <input type="text" className="w-full border-2 border-purple-200 rounded-xl p-3 focus:border-purple-400 focus:outline-none transition-colors" value={editData.city} onChange={e => setEditData({ ...editData, city: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-purple-700 font-semibold mb-1">Région</label>
                  <input type="text" className="w-full border-2 border-purple-200 rounded-xl p-3 focus:border-purple-400 focus:outline-none transition-colors" value={editData.region} onChange={e => setEditData({ ...editData, region: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-purple-700 font-semibold mb-1">Surface (m²)</label>
                  <input type="number" min="0" className="w-full border-2 border-purple-200 rounded-xl p-3 focus:border-purple-400 focus:outline-none transition-colors" value={editData.area} onChange={e => setEditData({ ...editData, area: e.target.value === '' ? '' : Number(e.target.value) })} required />
                </div>
                <div>
                  <label className="block text-purple-700 font-semibold mb-1">Prix (€)</label>
                  <input type="number" min="0" className="w-full border-2 border-purple-200 rounded-xl p-3 focus:border-purple-400 focus:outline-none transition-colors" value={editData.price} onChange={e => setEditData({ ...editData, price: e.target.value === '' ? '' : Number(e.target.value) })} required />
                </div>
              </div>
              <div>
                <label className="block text-purple-700 font-semibold mb-1">Description</label>
                <textarea className="w-full border-2 border-purple-200 rounded-xl p-3 focus:border-purple-400 focus:outline-none transition-colors h-24 resize-none" value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} placeholder="Décrivez votre propriété..." required />
              </div>
              <div>
                <label className="block text-purple-700 font-semibold mb-3">Équipements</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.keys(AMENITIES_LABELS).map(a => (
                    <label key={a} className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      editAmenities.includes(a) 
                        ? 'bg-purple-100 border-purple-400 text-purple-700' 
                        : 'bg-white border-purple-200 text-purple-600 hover:border-purple-300'
                    }`}>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={editAmenities.includes(a)}
                        onChange={() => setEditAmenities(editAmenities.includes(a) ? editAmenities.filter(x => x !== a) : [...editAmenities, a])}
                      />
                      <span className="text-sm font-medium">{AMENITIES_LABELS[a]}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-purple-700 font-semibold mb-1">Photos</label>
                <input type="file" accept="image/*" multiple className="w-full border-2 border-purple-200 rounded-xl p-3 focus:border-purple-400 focus:outline-none transition-colors" onChange={e => setEditPhotoFiles(e.target.files ? Array.from(e.target.files) : [])} />
                <div className="grid grid-cols-6 gap-2 mt-3">
                  {editPhotoFiles.length > 0
                    ? editPhotoFiles.map((file, i) => (
                        <img key={i} src={URL.createObjectURL(file)} alt="Aperçu" className="w-full h-16 object-cover rounded-lg border border-purple-200" />
                    ))
                    : property?.photos?.map((url, i) => (
                        <img key={i} src={url} alt="Photo" className="w-full h-16 object-cover rounded-lg border border-purple-200" />
                    ))}
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t border-primary-200">
                <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} className="px-6 py-2 text-primary-600 border-primary-200 hover:bg-primary-light transition-colors">Annuler</Button>
                <Button type="submit" variant="primary" className="px-8 py-2 btn-primary text-white font-semibold transition-colors">Enregistrer</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Section des preuves associées */}
      {showAddProof && id && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xl relative">
            <button onClick={() => setShowAddProof(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl">×</button>
            <AddProofPage propertyId={id} onSuccess={() => { setShowAddProof(false); proofsApi.getByPropertyId(id).then(setProofs); }} />
          </div>
        </div>
      )}
    </div>
  );
};

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
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4 bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-purple-100 shadow-xl animate-fade-in">
      <div className="flex items-center gap-3">
        <span className="font-semibold text-purple-700 text-lg">Votre note :</span>
        {Array.from({ length: 5 }).map((_, i) => (
          <button
            type="button"
            key={i}
            className={`focus:outline-none transition-all duration-150 ${
              i < rating 
                ? 'text-yellow-400 scale-110 drop-shadow-lg' 
                : 'text-gray-200 hover:text-yellow-300 hover:scale-105'
            }`}
            onClick={() => setRating(i + 1)}
            aria-label={`Donner ${i + 1} étoile${i > 0 ? 's' : ''}`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-8 h-8" 
              fill={i < rating ? 'currentColor' : 'none'} 
              stroke={i < rating ? 'none' : '#FCD34D'} 
              strokeWidth={i < rating ? '0' : '2'} 
              viewBox="0 0 24 24"
            >
              <path d="M12 .587l3.668 7.431 8.209 1.188-5.934 5.759 1.398 8.165L12 18.896l-7.341 3.86 1.398-8.165-5.934-5.759 8.209-1.188z" />
            </svg>
          </button>
        ))}
      </div>
      <textarea
        className="input-focus-glow w-full border-2 border-light rounded-xl p-4 text-lg bg-surface transition-colors h-24 resize-none"
        placeholder="Votre commentaire..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        required
      />
      <div className="flex items-center gap-3 mt-2">
        <Button type="submit" isLoading={loading} className="gradient-primary text-white px-8 py-2 rounded-xl font-bold shadow hover:scale-105 transition">Envoyer</Button>
        {success && <span className="text-success font-semibold animate-fade-in">Merci pour votre avis !</span>}
        {error && <span className="text-error font-semibold animate-fade-in">{error}</span>}
      </div>
    </form>
  );
};
