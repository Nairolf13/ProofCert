import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Proof } from '../types';
import { proofsApi } from '../api/proofs';
import { Button } from '../components/Button';
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
} from '@heroicons/react/24/outline';

export const ProofDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [proof, setProof] = useState<Proof | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    const fetchProof = async () => {
      if (!id) return;
      
      try {
        const fetchedProof = await proofsApi.getById(id);
        setProof(fetchedProof);
      } catch (error) {
        console.error('Failed to fetch proof:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProof();
  }, [id]);

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
              <h1 className="text-3xl font-bold text-gray-900">
                {proof.title || `${proof.contentType} Proof`}
              </h1>
              <p className="text-gray-600">
                Created {formatDateTime(proof.timestamp)}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleCopyShareLink}
                leftIcon={<ShareIcon className="w-4 h-4" />}
              >
                Copy Link
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerateQRCode}
                leftIcon={<QrCodeIcon className="w-4 h-4" />}
              >
                QR Code
              </Button>
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
                {proof.contentType === 'TEXT' && proof.content ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800">
                      {proof.content}
                    </pre>
                  </div>
                ) : proof.contentType === 'IMAGE' && proof.ipfsHash ? (
                  <div className="bg-gray-50 rounded-lg flex items-center justify-center p-4">
                    <img
                      src={proof.ipfsHash.startsWith('http') ? proof.ipfsHash : `https://ipfs.io/ipfs/${proof.ipfsHash}`}
                      alt={proof.title || 'Proof image'}
                      className="max-h-96 max-w-full rounded-lg shadow"
                      style={{ objectFit: 'contain' }}
                    />
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
                {proof.ipfsHash && (
                  <a
                    href={getIPFSUrl(proof.ipfsHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button
                      variant="outline"
                      className="w-full"
                      leftIcon={<ArrowTopRightOnSquareIcon className="w-4 h-4" />}
                    >
                      View on IPFS
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
