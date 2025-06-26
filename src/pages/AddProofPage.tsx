import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { MediaCaptureComponent } from '../components/MediaCaptureComponent';
import { MediaPreview } from '../components/MediaPreview';
import { ProofType } from '../types';
import type { CreateProofRequest } from '../types';
import { proofsApi } from '../api/proofs';
import { generateFileHash, generateSHA256, hashLocation } from '../utils/crypto';
import { uploadToIPFS, uploadTextToIPFS } from '../utils/ipfs';
import {
  PhotoIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  CameraIcon,
  FolderOpenIcon,
} from '@heroicons/react/24/outline';

export const AddProofPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedType, setSelectedType] = useState<ProofType>(ProofType.TEXT);
  const [title, setTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'input' | 'processing' | 'complete'>('input');
  const [showMediaCapture, setShowMediaCapture] = useState(false);
  const [captureMode, setCaptureMode] = useState<'photo' | 'video' | 'audio'>('photo');

  const proofTypes = [
    { type: ProofType.TEXT, label: 'Text', icon: DocumentTextIcon, description: 'Secure written content' },
    { type: ProofType.IMAGE, label: 'Image', icon: PhotoIcon, description: 'Certify photos and images' },
    { type: ProofType.VIDEO, label: 'Video', icon: VideoCameraIcon, description: 'Verify video content' },
    { type: ProofType.AUDIO, label: 'Audio', icon: MicrophoneIcon, description: 'Authenticate audio recordings' },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="text-center">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please connect your wallet to create proofs.</p>
            <Button onClick={() => navigate('/auth')}>Connect Wallet</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name);
      }
    }
  };

  const handleCaptureMedia = (type: 'photo' | 'video' | 'audio') => {
    setCaptureMode(type);
    setShowMediaCapture(true);
  };

  const handleMediaCaptured = (file: File, type: 'image' | 'video' | 'audio') => {
    setSelectedFile(file);
    if (!title) {
      const timestamp = new Date().toLocaleString();
      setTitle(`${type}-${timestamp}`);
    }
    setShowMediaCapture(false);
    
    // Set the appropriate proof type based on captured media
    if (type === 'image') setSelectedType(ProofType.IMAGE);
    else if (type === 'video') setSelectedType(ProofType.VIDEO);
    else if (type === 'audio') setSelectedType(ProofType.AUDIO);
  };

  const handleCloseMediaCapture = () => {
    setShowMediaCapture(false);
  };

  async function convertImageToWebP(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('WebP conversion failed'));
            const webpFile = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' });
            resolve(webpFile);
          },
          'image/webp',
          0.92
        );
        URL.revokeObjectURL(url);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || (selectedType === ProofType.TEXT && !textContent.trim()) || 
        (selectedType !== ProofType.TEXT && !selectedFile)) {
      return;
    }

    setIsSubmitting(true);
    setCurrentStep('processing');

    try {
      let contentHash: string;
      let contentIPFS: string | undefined;
      let fileToUpload = selectedFile;

      if (selectedType === ProofType.IMAGE && selectedFile) {
        fileToUpload = await convertImageToWebP(selectedFile);
      }

      if (selectedType === ProofType.TEXT) {
        contentHash = generateSHA256(textContent);
        contentIPFS = await uploadTextToIPFS(textContent);
      } else if (fileToUpload) {
        contentHash = await generateFileHash(fileToUpload);
        contentIPFS = await uploadToIPFS(fileToUpload);
      } else {
        throw new Error('No content to process');
      }

      let location: string | undefined;
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          location = hashLocation(position.coords.latitude, position.coords.longitude);
        } catch {
          console.log('Location access denied or unavailable');
        }
      }

      const proofData: CreateProofRequest = {
        title: title.trim(),
        content: selectedType === ProofType.TEXT ? textContent : undefined,
        contentType: selectedType,
        file: fileToUpload || undefined,
        location,
        isPublic,
      };

  
      console.log('Generated hash:', contentHash);
      console.log('IPFS hash:', contentIPFS);

      await proofsApi.create(proofData);
      
      setCurrentStep('complete');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Failed to create proof:', error);
      setCurrentStep('input');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentStep === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Processing Your Proof</h2>
            <p className="text-gray-600">
              Generating hash, uploading to IPFS, and creating certificate...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Proof Created Successfully!</h2>
            <p className="text-gray-600 mb-4">
              Your proof has been certified and stored securely.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Proof</h1>
          <p className="text-gray-600">
            Certify your digital content with immutable proof of existence.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Choose Content Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {proofTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.type}
                      type="button"
                      onClick={() => setSelectedType(type.type)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedType === type.type
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                      <div className="text-sm font-medium text-gray-900">{type.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Proof Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a descriptive title for your proof"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              {selectedType === ProofType.TEXT ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Content *
                  </label>
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Enter the text content you want to certify"
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add File *
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Capture Live</p>
                      <div className="flex gap-2">
                        {selectedType === ProofType.IMAGE && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCaptureMedia('photo')}
                            leftIcon={<CameraIcon className="w-4 h-4" />}
                          >
                            Take Photo
                          </Button>
                        )}
                        {selectedType === ProofType.VIDEO && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCaptureMedia('video')}
                            leftIcon={<VideoCameraIcon className="w-4 h-4" />}
                          >
                            Record Video
                          </Button>
                        )}
                        {selectedType === ProofType.AUDIO && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCaptureMedia('audio')}
                            leftIcon={<MicrophoneIcon className="w-4 h-4" />}
                          >
                            Record Audio
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Upload File</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        leftIcon={<FolderOpenIcon className="w-4 h-4" />}
                      >
                        Choose File
                      </Button>
                    </div>
                  </div>

                  {selectedFile ? (
                    <MediaPreview
                      file={selectedFile}
                      type={
                        selectedType === ProofType.IMAGE ? 'image' :
                        selectedType === ProofType.VIDEO ? 'video' : 'audio'
                      }
                      onRemove={() => setSelectedFile(null)}
                    />
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <CloudArrowUpIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-sm text-gray-600">No file selected</p>
                      <p className="text-xs text-gray-500">
                        {selectedType === ProofType.IMAGE && 'Capture photo or upload PNG, JPG, GIF up to 10MB'}
                        {selectedType === ProofType.VIDEO && 'Record video or upload MP4, MOV, AVI up to 100MB'}
                        {selectedType === ProofType.AUDIO && 'Record audio or upload MP3, WAV, M4A up to 50MB'}
                      </p>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept={
                      selectedType === ProofType.IMAGE ? 'image/*' :
                      selectedType === ProofType.VIDEO ? 'video/*' :
                      selectedType === ProofType.AUDIO ? 'audio/*' : '*'
                    }
                  />
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                  Make this proof publicly shareable
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={
                !title.trim() || 
                (selectedType === ProofType.TEXT && !textContent.trim()) || 
                (selectedType !== ProofType.TEXT && !selectedFile)
              }
            >
              Create Proof
            </Button>
          </div>
        </form>

        {showMediaCapture && (
          <MediaCaptureComponent
            mode={captureMode}
            onCapture={handleMediaCaptured}
            onClose={handleCloseMediaCapture}
          />
        )}
      </div>
    </div>
  );
};
