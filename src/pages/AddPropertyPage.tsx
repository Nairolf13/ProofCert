import React, { useState, useEffect } from 'react';
import { propertyApi } from '../api/property';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { AutocompleteInput } from '../components/AutocompleteInput';
import { ISO_COUNTRIES, fetchCountries, fetchRegions, fetchCities } from '../utils/geodata';

// ConfirmationModal component remains the same
const ConfirmationModal: React.FC<{ open: boolean; onClose: () => void; onGoToProperty: () => void; }> = ({ open, onClose, onGoToProperty }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-fade-in">
        <h2 className="text-2xl font-bold mb-2 text-primary-700">Bien ajouté !</h2>
        <p className="text-gray-600 mb-6">Votre propriété a bien été créée. Vous pouvez la consulter ou revenir au dashboard.</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={onGoToProperty} className="flex-1">Voir le bien</Button>
          <Button variant="secondary" onClick={onClose} className="flex-1">Dashboard</Button>
        </div>
      </div>
    </div>
  );
};

export const AddPropertyPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(null);
  const [country, setCountry] = useState<{ name: string; code: string } | null>(null);
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState<number | ''>('');
  const [price, setPrice] = useState<number | ''>('');
  const [pricePeriod, setPricePeriod] = useState<'MONTH' | 'WEEK' | 'DAY'>('MONTH');
  const [isAvailable, setIsAvailable] = useState(true);
  const [countryOptions, setCountryOptions] = useState<{ name: string; code: string }[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  // Gestion de l’upload et preview des images
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const MAX_PHOTOS = 5;

  // Génère les previews à chaque changement de photoFiles
  useEffect(() => {
    // Révoque les anciennes URLs
    photoPreviews.forEach(url => URL.revokeObjectURL(url));
    const newPreviews = photoFiles.map(file => URL.createObjectURL(file));
    setPhotoPreviews(newPreviews);
    // eslint-disable-next-line
  }, [photoFiles]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const files = Array.from(e.target.files || []);
    if (files.length + photoFiles.length > MAX_PHOTOS) {
      setPhotoError(`Vous pouvez ajouter jusqu'à ${MAX_PHOTOS} images maximum.`);
      return;
    }
    const newFiles = files.filter(f => !photoFiles.some(pf => pf.name === f.name && pf.size === f.size));
    setPhotoFiles(prev => [...prev, ...newFiles]);
  };

  // Drag & drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setPhotoError(null);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length + photoFiles.length > MAX_PHOTOS) {
      setPhotoError(`Vous pouvez ajouter jusqu'à ${MAX_PHOTOS} images maximum.`);
      return;
    }
    const newFiles = files.filter(f => !photoFiles.some(pf => pf.name === f.name && pf.size === f.size));
    setPhotoFiles(prev => [...prev, ...newFiles]);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleRemovePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      // Promotion automatique au rôle OWNER si ce n'est pas déjà le cas
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user && user.role !== 'OWNER') {
        await propertyApi.promoteToOwner();
        await refreshUser?.();
      }
      // Upload réel sur IPFS
      let photoUrls: string[] = [];
      if (photoFiles.length > 0) {
        const uploads = await Promise.all(photoFiles.map(async (file) => {
          try {
            const hash = await import('../utils/ipfs').then(m => m.uploadToIPFS(file));
            return `https://ipfs.io/ipfs/${hash}`;
          } catch (err) {
            console.error('Erreur uploadToIPFS:', err);
            throw err;
          }
        }));
        photoUrls = uploads;
      }
      const property = await propertyApi.create({
        title,
        address,
        country: country?.code || '',
        region,
        city,
        area: Number(area),
        price: Number(price),
        pricePeriod,
        isAvailable,
        photos: photoUrls,
        ...(description ? { description } : {})
      });
      setCreatedPropertyId(property.id);
      setConfirmationOpen(true);
    } catch (err) {
      let errorMsg = 'Erreur lors de la création du bien';
      if (err && typeof err === 'object') {
        const response = (err as Record<string, unknown>)['response'];
        if (response && typeof response === 'object') {
          const data = (response as Record<string, unknown>)['data'];
          if (data && typeof data === 'object') {
            const message = (data as Record<string, unknown>)['message'];
            if (typeof message === 'string') {
              errorMsg += ` : ${message}`;
            } else {
              errorMsg += ` : ${JSON.stringify(data)}`;
            }
          }
        } else if ((err as Record<string, unknown>)['message']) {
          errorMsg += ` : ${(err as Record<string, unknown>)['message']}`;
        } else {
          errorMsg += ` : ${JSON.stringify(err)}`;
        }
      } else if (typeof err === 'string') {
        errorMsg += ` : ${err}`;
      }
      setError(errorMsg);
      try { console.error('Erreur lors de la création du bien:', err, JSON.stringify(err)); } catch { console.error('Erreur lors de la création du bien:', err); }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToProperty = () => {
    if (createdPropertyId) {
      navigate(`/properties/${createdPropertyId}`);
    } else {
      navigate('/dashboard');
    }
  };

  // Pays dynamique
  useEffect(() => {
    fetchCountries(country?.name || '').then(setCountryOptions);
  }, [country?.name]);

  // Région dynamique
  useEffect(() => {
    if (country && region) {
      fetchRegions(country.code, region).then(setRegionOptions);
    } else {
      setRegionOptions([]);
    }
  }, [country, region]);

  // Ville dynamique
  useEffect(() => {
    if (country && region && city) {
      fetchCities(country.code, region, city).then(setCityOptions);
    } else {
      setCityOptions([]);
    }
  }, [country, region, city]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 flex flex-col">
      {/* Illustration immersive */}
      <div className="flex flex-col items-center justify-center mt-8 mb-2">
        <h2 className="text-2xl font-bold text-primary-700 mb-2">Ajouter un nouveau bien immobilier</h2>
        <span className="mt-2 text-lg text-purple-500 font-semibold animate-fade-in" style={{ animationDelay: '0.4s' }}>
          Un nouveau bien, une nouvelle aventure !
        </span>
      </div>

      {/* Form card */}
      <main className="flex-1 flex items-center justify-center px-2 pb-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-3xl bg-white/80 rounded-3xl shadow-2xl p-8 space-y-7 border border-white/40 backdrop-blur-lg animate-fade-in-up"
          style={{ animationDelay: '0.6s' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FloatingLabelInput
              label="Titre du bien *"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              autoFocus
            />
            <FloatingLabelInput
              label="Adresse *"
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
            />
            <AutocompleteInput
              label="Pays *"
              value={country?.name || ''}
              onChange={val => {
                const found = ISO_COUNTRIES.find(c => c.name === val);
                setCountry(found ? found : { name: val, code: val });
                setRegion('');
                setCity('');
              }}
              options={countryOptions.map(c => c.name)}
              required
              autoFocus
              placeholder="Saisir ou sélectionner un pays"
            />
            <AutocompleteInput
              label="Région *"
              value={region}
              onChange={setRegion}
              options={regionOptions}
              required
              placeholder="Saisir ou sélectionner une région"
            />
            <AutocompleteInput
              label="Ville *"
              value={city}
              onChange={setCity}
              options={cityOptions}
              required
              placeholder="Saisir ou sélectionner une ville"
            />
            <FloatingLabelInput
              label="Superficie (m²) *"
              type="number"
              value={area === '' ? '' : String(area)}
              onChange={e => setArea(e.target.value === '' ? '' : Number(e.target.value))}
              min={0}
              required
            />
            <FloatingLabelInput
              label="Prix de la location (€) *"
              type="number"
              value={price === '' ? '' : String(price)}
              onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
              min={0}
              required
            />
            <div className="flex items-center gap-2">
              <label htmlFor="pricePeriod" className="text-sm text-gray-700 font-semibold">Période</label>
              <select
                id="pricePeriod"
                className="border-2 border-gray-200 rounded-xl px-3 py-2 text-base font-medium focus:outline-none focus:border-purple-400 transition bg-white"
                value={pricePeriod}
                onChange={e => setPricePeriod(e.target.value as 'MONTH' | 'WEEK' | 'DAY')}
                required
              >
                <option value="MONTH">par mois</option>
                <option value="WEEK">par semaine</option>
                <option value="DAY">par jour</option>
              </select>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                id="isAvailable"
                type="checkbox"
                checked={isAvailable}
                onChange={e => setIsAvailable(e.target.checked)}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="isAvailable" className="text-sm text-gray-700">Disponible à la location</label>
            </div>
            <FloatingLabelTextarea
              label="Description (optionnelle)"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            {/* Upload photos du bien */}
            <div className="col-span-1 md:col-span-2">
              <label className="block mb-1 font-semibold">Photos du bien</label>
              <div
                className="flex flex-col items-center justify-center border-2 border-dashed border-purple-300 rounded-xl bg-purple-50/40 p-4 cursor-pointer hover:bg-purple-100 transition group"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById('property-photos-input')?.click()}
                tabIndex={0}
                role="button"
                aria-label="Ajouter des photos"
              >
                <input
                  id="property-photos-input"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <span className="text-purple-500 font-medium mb-2">Glissez-déposez ou cliquez pour ajouter des photos</span>
                <span className="text-xs text-gray-400">(Jusqu’à 5 images, JPEG/PNG)</span>
                <div className="flex flex-wrap gap-2 mt-3 justify-center">
                  {photoPreviews.map((src, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={src}
                        alt={`Photo ${i + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm hover:scale-105 transition"
                      />
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); handleRemovePhoto(i); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow hover:bg-red-600 focus:outline-none"
                        aria-label="Supprimer la photo"
                        tabIndex={0}
                      >×</button>
                    </div>
                  ))}
                </div>
                {photoError && <div className="text-xs text-red-500 mt-2 text-center">{photoError}</div>}
              </div>
            </div>
          </div>
          {error && <div className="text-red-500 text-center font-semibold animate-shake">{error}</div>}
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-tr from-purple-500 via-pink-500 to-blue-500 text-white font-bold text-lg shadow-lg hover:scale-[1.03] hover:shadow-2xl active:scale-95 transition-all duration-150"
          >
            {isSubmitting ? 'Création en cours...' : 'Créer le bien'}
          </Button>
          <div className="text-center text-xs text-gray-400 mt-2">* Champs obligatoires</div>
        </form>
      </main>

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={confirmationOpen}
        onClose={() => navigate('/dashboard')}
        onGoToProperty={handleGoToProperty}
      />

      {/* Animations CSS */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
        .animate-fade-in-up { animation: fade-in 0.9s cubic-bezier(.4,0,.2,1) both; }
        @keyframes shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.4s; }
      `}</style>
    </div>
  );
};

// Floating label input component
const FloatingLabelInput: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoFocus?: boolean;
  type?: string;
  min?: number;
}> = ({ label, value, onChange, required, autoFocus, type = 'text', min }) => (
  <div className="relative">
    <input
      className="peer w-full border-2 border-gray-200 rounded-xl bg-white/70 px-4 pt-6 pb-2 text-base font-medium focus:outline-none focus:border-purple-400 transition placeholder-transparent shadow-sm"
      value={value}
      onChange={onChange}
      required={required}
      autoFocus={autoFocus}
      placeholder=" "
      type={type}
      min={min}
    />
    <label className="absolute left-4 top-2 text-gray-400 text-sm font-semibold pointer-events-none transition-all duration-200 peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-300 peer-focus:top-2 peer-focus:text-sm peer-focus:text-purple-500">
      {label}
    </label>
  </div>
);

// Floating label textarea component
const FloatingLabelTextarea: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}> = ({ label, value, onChange }) => (
  <div className="relative">
    <textarea
      className="peer w-full border-2 border-gray-200 rounded-xl bg-white/70 px-4 pt-6 pb-2 text-base font-medium focus:outline-none focus:border-purple-400 transition placeholder-transparent shadow-sm min-h-[80px] resize-none"
      value={value}
      onChange={onChange}
      placeholder=" "
      rows={3}
    />
    <label className="absolute left-4 top-2 text-gray-400 text-sm font-semibold pointer-events-none transition-all duration-200 peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-300 peer-focus:top-2 peer-focus:text-sm peer-focus:text-purple-500">
      {label}
    </label>
  </div>
);
