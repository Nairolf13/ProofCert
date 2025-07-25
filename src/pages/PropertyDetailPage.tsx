import React, { useEffect, useState } from 'react';
const ReservationSuccessModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
 
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl">×</button>
        <div className="flex flex-col items-center gap-4">
          <svg className="h-16 w-16 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h2 className="text-2xl font-bold text-green-700">Réservation réussie !</h2>
          <p className="text-gray-700">Votre réservation a bien été enregistrée.<br />Vous pouvez la retrouver dans votre espace "Mes réservations".</p>
          <div className="flex flex-col gap-2 w-full mt-4">
            <button onClick={onClose} className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition">Fermer</button>
            <Link to="/app/my-reservations" onClick={onClose} className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition text-center">Voir mes réservations</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
import { useParams} from 'react-router-dom';
import { Link } from 'react-router-dom';
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
  const [showReservationSuccess, setShowReservationSuccess] = useState(false);
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [animDirection, setAnimDirection] = useState<'left' | 'right' | null>(null);
  const [zoomed, setZoomed] = React.useState(false);
  const zoomOverlayRef = React.useRef<HTMLDivElement>(null);
  const [calendarMessage, setCalendarMessage] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  // const navigate = useNavigate();
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
    propertyApi.getReviews(id).then(setReviews).catch(() => {});
    proofsApi.getByPropertyId(id).then(setProofs).catch(() => setProofs([]));
  }, [id, isEditing]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setEditData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Préparer les URLs des photos
      let photoUrls = property.photos || [];
      if (editPhotoFiles.length > 0) {
        try {
          const uploads = await Promise.all(editPhotoFiles.map(async (file) => {
            const hash = await import('../utils/ipfs').then(m => m.uploadToIPFS(file));
            return `https://ipfs.io/ipfs/${hash}`;
          }));
          photoUrls = uploads;
        } catch (uploadError) {
          console.error('Erreur lors du téléchargement des photos:', uploadError);
          throw new Error('Échec du téléchargement des photos. Veuillez réessayer.');
        }
      }
      
      // Préparer les données à envoyer
      const updateData = {
        ...editData,
        area: Number(editData.area),
        price: Number(editData.price),
        amenities: editAmenities,
        photos: photoUrls,
      };
      
      console.log('Envoi des données de mise à jour:', updateData);
      
      // Appel API pour mettre à jour la propriété
      const updated = await propertyApi.update(property.id, updateData);
      
      // Vérifier que la réponse contient bien les données mises à jour
      if (!updated || !updated.id) {
        throw new Error('Réponse du serveur invalide');
      }
      
      console.log('Réponse du serveur:', updated);
      
      // Récupérer les données fraîches du serveur pour vérification
      const serverData = await propertyApi.getById(property.id);
      
      // Fonction utilitaire pour comparer des tableaux de type générique
      const arraysEqual = <T,>(a: T[] = [], b: T[] = []): boolean => {
        if (a.length !== b.length) return false;
        const aSorted = [...a].sort();
        const bSorted = [...b].sort();
        return aSorted.every((val, i) => val === bSorted[i]);
      };

      // Vérifier que les données ont bien été mises à jour sur le serveur
      // On est plus tolérant sur les types (ex: '175' vs 175)
      const isUpdateSuccessful = (
        String(serverData.title).trim() === String(updateData.title).trim() &&
        String(serverData.description).trim() === String(updateData.description).trim() &&
        Number(serverData.area) === Number(updateData.area) &&
        Number(serverData.price) === Number(updateData.price) &&
        serverData.pricePeriod === updateData.pricePeriod &&
        Boolean(serverData.isAvailable) === Boolean(updateData.isAvailable) &&
        arraysEqual(serverData.amenities || [], updateData.amenities || [])
      );
      
      // Vérification des photos (on vérifie seulement le nombre et l'existence)
      const photosMatch = 
        (!serverData.photos && !updateData.photos) || 
        (serverData.photos?.length === updateData.photos?.length && 
         updateData.photos.every(photo => 
           serverData.photos?.some(sp => sp.includes(photo.split('/').pop()!))
         ));
      
      if (!isUpdateSuccessful || !photosMatch) {
        console.error('Les données sur le serveur ne correspondent pas aux mises à jour');
        console.log('Données attendues:', updateData);
        console.log('Données reçues:', serverData);
        
        // Si c'est juste la surface qui diffère, on accepte quand même
        const onlyAreaDiffers = 
          String(serverData.title).trim() === String(updateData.title).trim() &&
          String(serverData.description).trim() === String(updateData.description).trim() &&
          serverData.pricePeriod === updateData.pricePeriod &&
          Boolean(serverData.isAvailable) === Boolean(updateData.isAvailable) &&
          arraysEqual(serverData.amenities || [], updateData.amenities || []) &&
          photosMatch;
          
        if (onlyAreaDiffers) {
          console.warn('Seule la surface diffère, mise à jour acceptée');
        } else {
          throw new Error('La mise à jour des données a échoué. Veuillez réessayer.');
        }
      }
      
      // Mettre à jour l'état local avec les nouvelles données
      setProperty(prev => ({
        ...prev!,
        ...serverData,  // Utiliser les données fraîches du serveur
        amenities: editAmenities,
        photos: photoUrls
      }));
      
      // Afficher le message de succès uniquement si tout est OK
      setSuccessMessage('Les modifications ont été enregistrées avec succès !');
      setShowSuccess(true);
      
      // Fermer le formulaire d'édition
      setIsEditing(false);
      
      // Masquer le message de succès après 5 secondes
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      
      // Nettoyer le timer si le composant est démonté
      return () => clearTimeout(timer);
      
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      setError(`Erreur lors de la modification: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      
      // Forcer le rechargement des données depuis le serveur
      if (property?.id) {
        try {
          const freshData = await propertyApi.getById(property.id);
          setProperty(freshData);
        } catch (fetchError) {
          console.error('Erreur lors de la récupération des données:', fetchError);
        }
      }
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

  // Log pour déboguer
  console.log('User:', user);
  console.log('Property:', property);
  
  // Vérifie si l'utilisateur est le propriétaire
  let isOwner = false;
  
  // Vérification pour les utilisateurs connectés via wallet
  const userWalletAddress = user?.walletAddress || user?.address;
  if (userWalletAddress && property.ownerWalletAddress) {
    isOwner = userWalletAddress.toLowerCase() === property.ownerWalletAddress.toLowerCase();
    console.log('Wallet owner check:', isOwner, 'user.walletAddress:', userWalletAddress, 'property.ownerWalletAddress:', property.ownerWalletAddress);
  }
  
  // Si pas encore propriétaire, vérifier via l'ID utilisateur (pour l'authentification classique)
  if (!isOwner && user?.id && property.ownerId) {
    isOwner = user.id === property.ownerId;
    console.log('Classic auth owner check:', isOwner, 'user.id:', user.id, 'property.ownerId:', property.ownerId);
  }
    
  // Vérifie si l'utilisateur est administrateur
  const adminAddresses = [
    'erd1as0x08wsc7zje3lhu8p9l2y4m5v853m73a7mzgk2fuqpsn0tt79qlcpwwa', // Adresse admin wallet
  ];
  
  const isAdmin = (userWalletAddress && adminAddresses.includes(userWalletAddress.toLowerCase())) || 
                 (user?.role === 'ADMIN');
  
  console.log('isAdmin:', isAdmin, 'adminAddresses:', adminAddresses, 'user.role:', user?.role);
  
  // Afficher les contrôles d'administration si l'utilisateur est propriétaire ou administrateur
  const showAdminControls = isOwner || isAdmin;
  
  console.log('showAdminControls:', showAdminControls, 'isOwner:', isOwner, 'isAdmin:', isAdmin);
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
    setCalendarMessage(null);
    try {
      const userAddress = user.address || user.walletAddress;
      if (!userAddress) {
        setCalendarMessage("Erreur: impossible de déterminer votre adresse de portefeuille.");
        return;
      }
      const newRental = await rentalApi.create({ 
        propertyId: property.id, 
        tenantId: userAddress, 
        startDate, 
        endDate 
      });
      setCalendarMessage("Réservation effectuée avec succès !");
      setStartDate(''); 
      setEndDate('');
      const updatedProperty = await propertyApi.getById(property.id);
      setProperty(updatedProperty);
      if (updatedProperty.rentals) {
        setProperty(prev => ({
          ...prev!,
          rentals: [...(prev?.rentals || []), newRental]
        }));
      }
      setShowReservationSuccess(true);
    } catch (err: unknown) {
      console.error('Erreur lors de la réservation:', err);
      let errorMessage = "Erreur lors de la réservation.";
      if (typeof err === 'object' && err !== null) {
        if ('response' in err) {
          const response = (err as { response?: { status?: number; data?: { error?: string } } }).response;
          if (response?.status === 403) {
            errorMessage = "Vous n'avez pas les droits pour réserver ce bien.";
          } else if (response?.data?.error) {
            errorMessage = response.data.error;
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
      }
      setCalendarMessage(errorMessage);
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
          isOwner={showAdminControls}
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
              isOwner={showAdminControls}
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
      <ReservationSuccessModal open={showReservationSuccess} onClose={() => setShowReservationSuccess(false)} />
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
                      <div 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const targetPath = `/app/proof/${proof.id}`;
                          if (window.location.pathname !== targetPath) {
                            window.location.href = targetPath;
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <CardHeader>
                          <CardTitle className="truncate text-base font-semibold">{proof.title || proof.contentType}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xs text-gray-500 mb-1 truncate">
                            <span className="font-semibold">Hash SHA-256 :</span> {proof.hash}
                          </div>
                          <div className="text-xs text-gray-700 mb-1">{proof.contentType}</div>
                          {proof.transactionHash && (
                            <div className="text-xs text-blue-600 mb-1 truncate">
                              <span className="font-semibold">Tx MultiversX :</span> 
                              <a
                                href={`https://explorer.multiversx.com/transactions/${proof.transactionHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-blue-800"
                              >
                                {proof.transactionHash}
                              </a>
                            </div>
                          )}
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

      {/* Notification de succès améliorée */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-6 pointer-events-none">
          <div className="bg-white rounded-lg shadow-xl border border-green-200 max-w-md w-full transform transition-all duration-300 ease-in-out animate-slide-in-right pointer-events-auto">
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900">Opération réussie</p>
                  <p className="mt-1 text-sm text-gray-500">{successMessage}</p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    onClick={() => setShowSuccess(false)}
                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <span className="sr-only">Fermer</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            {/* Barre de progression */}
            <div className="bg-green-100 h-1 w-full overflow-hidden">
              <div className="bg-green-500 h-full w-full animate-progress"></div>
            </div>
          </div>
        </div>
      )}
      
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
                  <input 
                    type="text" 
                    name="title"
                    className="input-focus-glow w-full border-2 border-light rounded-xl p-3 transition-colors" 
                    value={editData.title} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-primary font-semibold mb-1">Adresse</label>
                  <input 
                    type="text" 
                    name="address"
                    className="w-full border-2 border-purple-200 rounded-xl p-3 focus:border-purple-400 focus:outline-none transition-colors" 
                    value={editData.address} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-purple-700 font-semibold mb-1">Ville</label>
                  <input 
                    type="text" 
                    name="city"
                    className="w-full border-2 border-purple-200 rounded-xl p-3 focus:border-purple-400 focus:outline-none transition-colors" 
                    value={editData.city} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-purple-700 font-semibold mb-1">Région</label>
                  <input 
                    type="text" 
                    name="region"
                    className="w-full border-2 border-purple-200 rounded-xl p-3 focus:border-purple-400 focus:outline-none transition-colors" 
                    value={editData.region} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-purple-700 font-semibold mb-1">Surface (m²)</label>
                  <input 
                    type="number" 
                    name="area"
                    min="0" 
                    className="w-full border-2 border-purple-200 rounded-xl p-3 focus:border-purple-400 focus:outline-none transition-colors" 
                    value={editData.area} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-purple-700 font-semibold mb-1">Prix (€)</label>
                  <input 
                    type="number" 
                    name="price"
                    min="0" 
                    className="w-full border-2 border-purple-200 rounded-xl p-3 focus:border-purple-400 focus:outline-none transition-colors" 
                    value={editData.price} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-purple-700 font-semibold mb-1">Période de prix</label>
                  <select
                    name="pricePeriod"
                    className="w-full border-2 border-purple-200 rounded-xl p-3 focus:border-purple-400 focus:outline-none transition-colors"
                    value={editData.pricePeriod}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="DAY">Par jour</option>
                    <option value="WEEK">Par semaine</option>
                    <option value="MONTH">Par mois</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    name="isAvailable"
                    checked={editData.isAvailable}
                    onChange={handleCheckboxChange}
                    className="h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="isAvailable" className="ml-2 block text-purple-700 font-semibold">
                    Disponible à la location
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-purple-700 font-semibold mb-1">Description</label>
                <textarea 
                  name="description"
                  className="w-full border-2 border-purple-200 rounded-xl p-3 focus:border-purple-400 focus:outline-none transition-colors h-24 resize-none" 
                  value={editData.description} 
                  onChange={handleInputChange} 
                  placeholder="Décrivez votre propriété..." 
                  required 
                />
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
