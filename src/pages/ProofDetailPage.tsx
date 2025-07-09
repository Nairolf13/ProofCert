import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Proof } from '../types';
import { proofsApi } from '../api/proofs';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { formatDateTime } from '../utils/helpers';
import { generateQRCode, downloadQRCode } from '../utils/qrcode';
import { getIPFSUrl } from '../utils/ipfs';
import {
  ShareIcon,
  QrCodeIcon,
  ClipboardIcon,
  EyeIcon,
  CalendarIcon,
  FingerPrintIcon,
  CloudIcon,
  GlobeAltIcon,
  ArrowTopRightOnSquareIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

export const ProofDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [proof, setProof] = useState<Proof | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState('');
  const [editableContent, setEditableContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [localFileData, setLocalFileData] = useState<string | null>(null);
  const [localFileType, setLocalFileType] = useState<string>('');
  const [localFileName, setLocalFileName] = useState<string>('');

  const loadProof = useCallback(async () => {
    if (!id) return;
    
    try {
      const fetchedProof = await proofsApi.getById(id);
      setProof(fetchedProof);
      setEditableTitle(fetchedProof?.title || '');
      setEditableContent(fetchedProof?.content || '');
      
      // Récupérer le fichier depuis le localStorage s'il existe
      const fileData = localStorage.getItem(`proof_file_${id}`);
      const fileType = localStorage.getItem(`proof_file_type_${id}`);
      const fileName = localStorage.getItem(`proof_file_name_${id}`);
      
      if (fileData) {
        setLocalFileData(fileData);
        setLocalFileType(fileType || '');
        setLocalFileName(fileName || '');
      }
    } catch (error) {
      console.error('Failed to fetch proof:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProof();
  }, [loadProof]);

  const handleSave = async () => {
    if (!proof || !id) return;
    
    try {
      setIsSaving(true);
      console.log('Tentative de mise à jour avec les données:', {
        title: editableTitle,
        content: editableContent
      });
      
      const updatedProof = await proofsApi.update(id, {
        title: editableTitle,
        content: editableContent
      });
      
      console.log('Réponse du serveur:', updatedProof);
      setProof(updatedProof);
      setIsEditing(false);
      alert('Les modifications ont été enregistrées avec succès');
    } catch (error) {
      console.error('Échec de la mise à jour de la preuve:', error);
      alert(`Erreur lors de la mise à jour de la preuve: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (proof) {
      setEditableTitle(proof.title || '');
      setEditableContent(proof.content || '');
    }
    setIsEditing(false);
  };

  const handleGenerateQRCode = async () => {
    if (!proof) return;
    
    const shareUrl = `${window.location.origin}/share/${proof.shareToken}`;
    try {
      const qrUrl = await generateQRCode(shareUrl);
      setQrCodeUrl(qrUrl);
      setShowQRCode(true);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const handleCopyShareLink = () => {
    if (!proof) return;
    
    const shareUrl = `${window.location.origin}/share/${proof.shareToken}`;
    navigator.clipboard.writeText(shareUrl);
  };

  const handleDownloadQRCode = () => {
    if (qrCodeUrl && proof) {
      downloadQRCode(qrCodeUrl, `proof-${proof.id}-qr.png`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!proof) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="text-center">
            <h2 className="text-xl font-semibold mb-2">Proof Not Found</h2>
            <p className="text-gray-600 mb-4">The requested proof could not be found.</p>
            <Link to="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    value={editableTitle}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditableTitle(e.target.value)}
                    placeholder="Titre de la preuve"
                    className="text-3xl font-bold"
                  />
                  <p className="text-gray-600">
                    Created {formatDateTime(proof.timestamp)}
                  </p>
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {proof.title || `${proof.contentType} Proof`}
                  </h1>
                  <p className="text-gray-600">
                    Created {formatDateTime(proof.timestamp)}
                  </p>
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSave}
                    isLoading={isSaving}
                  >
                    Enregistrer
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    leftIcon={<PencilIcon className="w-4 h-4" />}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCopyShareLink}
                    leftIcon={<ShareIcon className="w-4 h-4" />}
                  >
                    Partager
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleGenerateQRCode}
                    leftIcon={<QrCodeIcon className="w-4 h-4" />}
                  >
                    QR Code
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <EyeIcon className="w-5 h-5 mr-2" />
                  Content Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {proof.contentType === 'TEXT' ? (
                  isEditing ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <textarea
                        value={editableContent}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditableContent(e.target.value)}
                        className="w-full h-64 p-2 border rounded"
                        placeholder="Contenu de la preuve"
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800">
                        {proof.content}
                      </pre>
                    </div>
                  )
                ) : proof.contentType === 'IMAGE' && (localFileData || proof.ipfsHash) ? (
                  <div className="bg-gray-50 rounded-lg flex items-center justify-center p-4">
                    <img
                      src={localFileData || getIPFSUrl(proof.ipfsHash!)}
                      alt={proof.title || 'Proof image'}
                      className="max-h-96 max-w-full rounded-lg shadow"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                ) : proof.contentType === 'VIDEO' && (localFileData || proof.ipfsHash) ? (
                  <div className="bg-gray-50 rounded-lg flex items-center justify-center p-4">
                    <video controls className="max-h-96 max-w-full rounded-lg shadow">
                      <source src={localFileData || getIPFSUrl(proof.ipfsHash!)} type={localFileType || undefined} />
                      Votre navigateur ne supporte pas la lecture vidéo.
                    </video>
                  </div>
                ) : proof.contentType === 'AUDIO' && (localFileData || proof.ipfsHash) ? (
                  <div className="bg-gray-50 rounded-lg flex items-center justify-center p-4">
                    <audio controls className="w-full">
                      <source src={localFileData || getIPFSUrl(proof.ipfsHash!)} type={localFileType || undefined} />
                      Votre navigateur ne supporte pas la lecture audio.
                    </audio>
                  </div>
                ) : proof.contentType === 'DOCUMENT' && (localFileData || proof.ipfsHash) ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-800">{localFileName || 'Document certifié'}</p>
                      <p className="text-sm text-gray-600">Document certifié</p>
                    </div>
                    {(localFileType === 'application/pdf' || (!localFileType && proof.ipfsHash)) && (
                      <iframe
                        src={localFileData || getIPFSUrl(proof.ipfsHash!)}
                        title={localFileName || 'Document certifié'}
                        className="w-full h-96 rounded-lg border mt-4"
                      />
                    )}
                    {localFileType && localFileType.startsWith('image/') && (
                      <img
                        src={localFileData || undefined}
                        alt={localFileName}
                        className="max-h-96 max-w-full rounded-lg shadow mt-4 mx-auto"
                        style={{ objectFit: 'contain' }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <div className="text-gray-500">
                      {proof.contentType === 'IMAGE' && 'Image file certified'}
                      {proof.contentType === 'VIDEO' && 'Video file certified'}
                      {proof.contentType === 'AUDIO' && 'Audio file certified'}
                      {proof.contentType === 'DOCUMENT' && 'Document file certified'}
                    </div>
                    {proof.ipfsHash && (
                      <div className="mt-4">
                        <a
                          href={getIPFSUrl(proof.ipfsHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-primary-600 hover:text-primary-700"
                        >
                          View on IPFS
                          <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {showQRCode && qrCodeUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>QR Code</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <img
                    src={qrCodeUrl}
                    alt="Proof QR Code"
                    className="mx-auto mb-4 border rounded-lg"
                  />
                  <div className="space-x-3">
                    <Button
                      variant="outline"
                      onClick={handleDownloadQRCode}
                    >
                      Download QR Code
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setShowQRCode(false)}
                    >
                      Close
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Proof Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm">
                  <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">Created:</span>
                  <span className="ml-2 text-gray-900">
                    {formatDateTime(proof.timestamp)}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <FingerPrintIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">Hash:</span>
                </div>
                <div className="bg-gray-50 rounded p-2 font-mono text-xs break-all">
                  {proof.hash}
                </div>

                {proof.ipfsHash && (
                  <>
                    <div className="flex items-center text-sm">
                      <CloudIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">IPFS Hash:</span>
                    </div>
                    <div className="bg-gray-50 rounded p-2 font-mono text-xs break-all">
                      {proof.ipfsHash}
                    </div>
                  </>
                )}

                <div className="flex items-center text-sm">
                  <GlobeAltIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">Visibility:</span>
                  <span className="ml-2 text-gray-900">
                    {proof.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Hash verified
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Timestamp authentic
                  </div>
                  {proof.ipfsHash && (
                    <div className="flex items-center text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      IPFS storage confirmed
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleCopyShareLink}
                  leftIcon={<ClipboardIcon className="w-4 h-4" />}
                >
                  Copy Share Link
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGenerateQRCode}
                  leftIcon={<QrCodeIcon className="w-4 h-4" />}
                >
                  Generate QR Code
                </Button>
                {proof.transactionHash ? (
                  <a
                    href={`https://explorer.multiversx.com/transactions/${proof.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button
                      variant="outline"
                      className="w-full"
                      leftIcon={<ArrowTopRightOnSquareIcon className="w-4 h-4" />}
                    >
                      View on Blockchain
                    </Button>
                  </a>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
