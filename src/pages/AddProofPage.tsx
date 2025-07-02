import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { MediaCaptureComponent } from '../components/MediaCaptureComponent';
import { MediaPreview } from '../components/MediaPreview';
import { ProofType } from '../types';
import { proofsApi } from '../api/proofs';

export const AddProofPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<ProofType>('TEXT');
  const [file, setFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video' | 'audio' | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMediaCapture = (file: File, type: 'image' | 'video' | 'audio') => {
    setFile(file);
    if (type === 'image') setType('IMAGE');
    if (type === 'video') setType('VIDEO');
    if (type === 'audio') setType('AUDIO');
    setIsMediaModalOpen(false);
  };

  const handleTypeChange = (newType: ProofType) => {
    setType(newType);
    setFile(null);
    setMediaType(null);
  };

  const handleOpenMediaModal = (mode: 'photo' | 'video' | 'audio') => {
    setMediaType(mode);
    setIsMediaModalOpen(true);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setType('TEXT');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validation des champs requis
      if (!title.trim()) {
        throw new Error('Le titre est obligatoire');
      }

      if (type === 'TEXT' && !content.trim()) {
        throw new Error('Le contenu est obligatoire pour une preuve textuelle');
      }

      if ((type === 'IMAGE' || type === 'VIDEO' || type === 'AUDIO' || type === 'DOCUMENT') && !file) {
        throw new Error('Un fichier est requis pour ce type de preuve');
      }

      // Pour les fichiers, on les stocke temporairement en base64
      let fileData: string | null = null;
      if (file && (type === 'IMAGE' || type === 'VIDEO' || type === 'AUDIO' || type === 'DOCUMENT')) {
        fileData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
          reader.readAsDataURL(file);
        });
      }

      // Préparer les données de la preuve
      const proofData = {
        title: title.trim(),
        content: type === 'TEXT' ? content.trim() : `Fichier: ${file?.name || 'Fichier sans nom'}`,
        contentType: type,
        isPublic: false, // Par défaut, les preuves sont privées
      };

      // Créer la preuve via l'API
      const createdProof = await proofsApi.create(proofData);
      
      // Stocker le fichier temporairement avec l'ID de la preuve
      if (fileData && createdProof.id) {
        localStorage.setItem(`proof_file_${createdProof.id}`, fileData);
        localStorage.setItem(`proof_file_type_${createdProof.id}`, file?.type || 'application/octet-stream');
        localStorage.setItem(`proof_file_name_${createdProof.id}`, file?.name || 'fichier');
      }
      
      // Afficher un message de succès et rediriger
      console.log('Preuve créée avec succès:', createdProof);
      navigate(`/proof/${createdProof.id}`);
    } catch (error) {
      console.error('Erreur lors de la création de la preuve:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue lors de la création de la preuve');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col" style={{
      background: `linear-gradient(135deg, var(--color-bg-secondary), var(--color-bg-primary), var(--color-primary-50))`
    }}>
      <div className="flex flex-col items-center justify-center mt-8 mb-2">
        <img
          src="https://assets-global.website-files.com/63e3b7e7e7e7e7e7e7e7e7e7/63e3b7e7e7e7e7e7e7e7e7e7_house-illustration.svg"
          alt="Illustration preuve moderne"
          className="w-64 h-40 object-contain drop-shadow-xl animate-fade-in"
          style={{ animationDelay: '0.2s' }}
        />
        <span className="mt-2 text-lg font-semibold animate-fade-in" style={{ 
          animationDelay: '0.4s',
          color: 'var(--color-primary-600)'
        }}>
          Ajoute une preuve, sécurise ton dossier !
        </span>
      </div>
      <main className="flex-1 flex items-center justify-center px-2 pb-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg bg-white/80 rounded-3xl shadow-2xl p-8 space-y-7 border border-white/40 backdrop-blur-lg animate-fade-in-up"
          style={{ animationDelay: '0.6s' }}
        >
          <div className="space-y-6">
            <FloatingLabelInput
              label="Titre de la preuve *"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              autoFocus
            />
            <div className="flex flex-wrap gap-2 mb-2">
              <ProofTypeButton active={type === 'TEXT'} onClick={() => handleTypeChange('TEXT')}>Texte</ProofTypeButton>
              <ProofTypeButton active={type === 'IMAGE'} onClick={() => handleOpenMediaModal('photo')}>Photo</ProofTypeButton>
              <ProofTypeButton active={type === 'VIDEO'} onClick={() => handleOpenMediaModal('video')}>Vidéo</ProofTypeButton>
              <ProofTypeButton active={type === 'AUDIO'} onClick={() => handleOpenMediaModal('audio')}>Audio</ProofTypeButton>
              <ProofTypeButton active={type === 'DOCUMENT'} onClick={() => handleTypeChange('DOCUMENT')}>Fichier</ProofTypeButton>
            </div>
            {type === 'TEXT' && (
              <FloatingLabelTextarea
                label="Contenu ou description *"
                value={content}
                onChange={e => setContent(e.target.value)}
                required
              />
            )}
            {(file && (type === 'IMAGE' || type === 'VIDEO' || type === 'AUDIO')) && (
              <MediaPreview
                file={file}
                type={type === 'IMAGE' ? 'image' : type === 'VIDEO' ? 'video' : 'audio'}
                onRemove={handleRemoveFile}
              />
            )}
            {/* Zone d'upload drag & drop pour fichiers (PC) */}
            {type === 'DOCUMENT' && !file && (
              <FileDropzone onFile={setFile} />
            )}
            {/* Preview du fichier uploadé (document) */}
            {type === 'DOCUMENT' && file && (
              <div className="relative border-2 border-green-200 bg-green-50 rounded-lg overflow-hidden p-4 flex flex-col items-center">
                <button
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <span className="font-bold text-xs">×</span>
                </button>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-base font-semibold text-gray-800 mb-1 truncate max-w-xs">{file.name}</span>
                <span className="text-xs text-gray-500 mb-2">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                {file.type.startsWith('image/') && (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="max-h-48 rounded-lg border mt-2 object-contain"
                  />
                )}
                {file.type === 'application/pdf' && (
                  <iframe
                    src={URL.createObjectURL(file)}
                    title={file.name}
                    className="w-full max-w-xs h-48 rounded-lg border mt-2 bg-white"
                  />
                )}
                {file.type.startsWith('audio/') && (
                  <audio controls className="w-full mt-2">
                    <source src={URL.createObjectURL(file)} type={file.type} />
                    Votre navigateur ne supporte pas la lecture audio.
                  </audio>
                )}
                {file.type.startsWith('video/') && (
                  <video controls className="w-full max-w-xs h-48 rounded-lg border mt-2 bg-black">
                    <source src={URL.createObjectURL(file)} type={file.type} />
                    Votre navigateur ne supporte pas la lecture vidéo.
                  </video>
                )}
                {/* Pour les autres types, juste le nom et l’icône */}
              </div>
            )}
          </div>
          {error && <div className="text-red-500 text-center font-semibold animate-shake">{error}</div>}
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="w-full py-3 rounded-xl gradient-primary text-white font-bold text-lg shadow-lg hover:scale-[1.03] hover:shadow-2xl active:scale-95 transition-all duration-150"
          >
            {isSubmitting ? 'Ajout en cours...' : 'Ajouter la preuve'}
          </Button>
          <div className="text-center text-xs text-gray-400 mt-2">* Champs obligatoires</div>
        </form>
        {isMediaModalOpen && mediaType && (
          <MediaCaptureComponent
            mode={mediaType}
            onCapture={handleMediaCapture}
            onClose={() => setIsMediaModalOpen(false)}
          />
        )}
      </main>
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

const ProofTypeButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-semibold border transition-all duration-150 text-sm
      ${active ? 'gradient-primary text-white shadow-lg scale-105' : 'bg-white/70 border-gray-200 text-gray-700 hover:bg-primary-light'}`}
  >
    {children}
  </button>
);

const FloatingLabelInput: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoFocus?: boolean;
}> = ({ label, value, onChange, required, autoFocus }) => (
  <div className="relative">
    <input
      className="peer w-full border-2 border-gray-200 rounded-xl bg-white/70 px-4 pt-6 pb-2 text-base font-medium focus:outline-none focus:border-purple-400 transition placeholder-transparent shadow-sm"
      value={value}
      onChange={onChange}
      required={required}
      autoFocus={autoFocus}
      placeholder=" "
    />
    <label className="absolute left-4 top-2 text-gray-400 text-sm font-semibold pointer-events-none transition-all duration-200 peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-300 peer-focus:top-2 peer-focus:text-sm peer-focus:text-purple-500">
      {label}
    </label>
  </div>
);

const FloatingLabelTextarea: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
}> = ({ label, value, onChange, required }) => (
  <div className="relative">
    <textarea
      className="peer w-full border-2 border-gray-200 rounded-xl bg-white/70 px-4 pt-6 pb-2 text-base font-medium focus:outline-none focus:border-purple-400 transition placeholder-transparent shadow-sm min-h-[80px] resize-none"
      value={value}
      onChange={onChange}
      required={required}
      placeholder=" "
      rows={3}
    />
    <label className="absolute left-4 top-2 text-gray-400 text-sm font-semibold pointer-events-none transition-all duration-200 peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-300 peer-focus:top-2 peer-focus:text-sm peer-focus:text-purple-500">
      {label}
    </label>
  </div>
);

const FileDropzone: React.FC<{ onFile: (file: File) => void }> = ({ onFile }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFile(e.target.files[0]);
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 transition-all duration-150 cursor-pointer ${dragActive ? 'border-primary-500 bg-primary-light' : 'border-gray-300 bg-white/60'}`}
      onDragOver={e => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
      />
      <span className="text-2xl mb-2">📄</span>
      <span className="text-sm text-gray-700 font-medium">Glissez-déposez un fichier ici ou cliquez pour sélectionner</span>
      <span className="text-xs text-gray-400 mt-1">PDF, images, etc.</span>
    </div>
  );
};
