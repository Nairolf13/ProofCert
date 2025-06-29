import React, { useState } from 'react';
import { propertyProofApi } from '../api/propertyProof';
import { useParams } from 'react-router-dom';
import { Button } from '../components/Button';

export const AddPropertyProofPage: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState('IMAGE');
  const [hash, setHash] = useState('');
  const [ipfsHash, setIpfsHash] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await propertyProofApi.create({
        title,
        description,
        contentType,
        hash,
        ipfsHash,
        propertyId,
        isPublic,
      });
      window.location.href = `/properties/${propertyId}`;
    } catch {
      alert('Erreur lors de l\'ajout de la preuve');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-gradient-to-br from-blue-50 via-white to-purple-100 animate-fade-in">
      <div className="w-full max-w-lg bg-white/80 rounded-3xl shadow-2xl p-8 space-y-7 border border-white/40 backdrop-blur-lg">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 drop-shadow-sm">Ajouter une preuve au bien</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Titre</label>
            <input className="w-full border rounded p-2" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="block mb-1">Description</label>
            <textarea className="w-full border rounded p-2" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1">Type de contenu</label>
            <select className="w-full border rounded p-2" value={contentType} onChange={e => setContentType(e.target.value)}>
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Vidéo</option>
              <option value="DOCUMENT">Document</option>
              <option value="TEXT">Texte</option>
              <option value="AUDIO">Audio</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Hash</label>
            <input className="w-full border rounded p-2" value={hash} onChange={e => setHash(e.target.value)} required />
          </div>
          <div>
            <label className="block mb-1">IPFS Hash</label>
            <input className="w-full border rounded p-2" value={ipfsHash} onChange={e => setIpfsHash(e.target.value)} />
          </div>
          <div>
            <label className="inline-flex items-center">
              <input type="checkbox" className="mr-2" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
              Preuve publique
            </label>
          </div>
          <Button type="submit" isLoading={isSubmitting}>Ajouter la preuve</Button>
        </form>
      </div>
    </div>
  );
};
