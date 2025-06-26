import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { ShareableProof } from '../types';
import { proofsApi } from '../api/proofs';
import { Button } from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { formatDateTime } from '../utils/helpers';
import { generateQRCode, downloadQRCode } from '../utils/qrcode';
import { getIPFSUrl } from '../utils/ipfs';
import {
  ShieldCheckIcon,
  CalendarIcon,
  FingerPrintIcon,
  CloudIcon,
  EyeIcon,
  QrCodeIcon,
  ArrowTopRightOnSquareIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';

export const SharePage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [proof, setProof] = useState<ShareableProof | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    const fetchSharedProof = async () => {
      if (!shareToken) return;
      
      try {
        const fetchedProof = await proofsApi.getByShareToken(shareToken);
        setProof(fetchedProof);
      } catch (error) {
        console.error('Failed to fetch shared proof:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedProof();
  }, [shareToken]);

  const handleGenerateQRCode = async () => {
    if (!proof) return;
    
    const shareUrl = window.location.href;
    try {
      const qrUrl = await generateQRCode(shareUrl);
      setQrCodeUrl(qrUrl);
      setShowQRCode(true);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const handleDownloadQRCode = () => {
    if (qrCodeUrl && proof) {
      downloadQRCode(qrCodeUrl, `shared-proof-${proof.id}-qr.png`);
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
        <Card className="max-w-md w-full">
          <CardContent className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheckIcon className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Proof Not Found</h2>
            <p className="text-gray-600 mb-6">
              This proof does not exist, is private, or the link has expired.
            </p>
            <Link to="/">
              <Button leftIcon={<HomeIcon className="w-4 h-4" />}>
                Go to Homepage
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Certified Proof</h1>
                <p className="text-sm text-gray-600">Verified digital evidence</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline" leftIcon={<HomeIcon className="w-4 h-4" />}>
                ProofCert
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <EyeIcon className="w-5 h-5 mr-2" />
                  {proof.title || `${proof.contentType} Proof`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Created {formatDateTime(proof.timestamp)}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Verified
                    </div>
                    <div className="flex items-center text-sm text-blue-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      Public
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Proof Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <div className="text-gray-500">
                    <ShieldCheckIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {proof.contentType} Content Certified
                    </h3>
                    <p className="text-gray-600 mb-4">
                      This {proof.contentType.toLowerCase()} has been cryptographically verified and stored immutably.
                    </p>
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
                </div>
              </CardContent>
            </Card>

            {showQRCode && qrCodeUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>QR Code for This Proof</CardTitle>
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
                <CardTitle>Verification Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
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
                <CardTitle>Share This Proof</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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

            <Card>
              <CardHeader>
                <CardTitle>About ProofCert</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  This proof was created using ProofCert, a digital evidence certification platform that uses blockchain technology for immutable verification.
                </p>
                <Link to="/">
                  <Button variant="outline" className="w-full" leftIcon={<HomeIcon className="w-4 h-4" />}>
                    Create Your Own Proofs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
