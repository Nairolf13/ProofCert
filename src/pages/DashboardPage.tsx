import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProofs } from '../hooks/useProofs';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { ProofType } from '../types';
import { formatRelativeTime } from '../utils/helpers';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PhotoIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  ShareIcon,
  EyeIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';

export const DashboardPage: React.FC = () => {
  const { user, isAuthenticated, isAuthLoading, connectWallet } = useAuth();
  const { proofs, isLoading, refreshProofs, filterProofs } = useProofs();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ProofType | undefined>();
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('Authenticated, fetching proofs for user:', user.id);
      refreshProofs();
    }
  }, [isAuthenticated, user, refreshProofs]);

  useEffect(() => {
    console.log('[DashboardPage] isAuthLoading:', isAuthLoading, 'isAuthenticated:', isAuthenticated);
  }, [isAuthLoading, isAuthenticated]);

  const handleConnectWallet = async () => {
    try {
      setIsConnectingWallet(true);
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnectingWallet(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="text-center">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please connect your wallet to access the dashboard.</p>
            <Link to="/auth">
              <Button>Connect Wallet</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredProofs = filterProofs(selectedType, searchTerm);

  const getProofIcon = (type: ProofType) => {
    switch (type) {
      case ProofType.IMAGE:
        return PhotoIcon;
      case ProofType.TEXT:
        return DocumentTextIcon;
      case ProofType.VIDEO:
        return VideoCameraIcon;
      case ProofType.AUDIO:
        return MicrophoneIcon;
      default:
        return DocumentTextIcon;
    }
  };

  const proofTypeOptions = [
    { value: undefined, label: 'All Types' },
    { value: ProofType.TEXT, label: 'Text' },
    { value: ProofType.IMAGE, label: 'Images' },
    { value: ProofType.VIDEO, label: 'Videos' },
    { value: ProofType.AUDIO, label: 'Audio' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 truncate max-w-xs md:max-w-md lg:max-w-lg">Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {user?.username || user?.email}
                {user?.walletAddress && (
                  <span className="ml-2 text-xs text-green-600">
                    • Wallet connected ({user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)})
                  </span>
                )}
              </p>
            </div>
            <Link to="/add-proof">
              <Button leftIcon={<PlusIcon className="w-4 h-4" />}>
                Add New Proof
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-gray-900">{proofs.length}</div>
              <div className="text-sm text-gray-600">Total Proofs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {proofs.filter(p => p.isPublic).length}
              </div>
              <div className="text-sm text-gray-600">Public Proofs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {proofs.filter(p => p.contentType === ProofType.IMAGE).length}
              </div>
              <div className="text-sm text-gray-600">Images</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {proofs.filter(p => p.ipfsHash).length}
              </div>
              <div className="text-sm text-gray-600">On IPFS</div>
            </CardContent>
          </Card>
        </div>

        {!user?.walletAddress && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <WalletIcon className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-amber-900">Connect Your Wallet</h3>
                    <p className="text-sm text-amber-700">
                      Link your xPortal wallet to enable blockchain features and enhanced security
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleConnectWallet}
                  disabled={isConnectingWallet}
                  isLoading={isConnectingWallet}
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  {isConnectingWallet ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search proofs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
                <select
                  value={selectedType || ''}
                  onChange={(e) => setSelectedType(e.target.value as ProofType || undefined)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {proofTypeOptions.map((option) => (
                    <option key={option.label} value={option.value || ''}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading proofs...</p>
          </div>
        ) : filteredProofs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No proofs found</h3>
              <p className="text-gray-600 mb-6">
                {proofs.length === 0 
                  ? "You haven't created any proofs yet. Get started by adding your first proof!"
                  : "No proofs match your current filters. Try adjusting your search."
                }
              </p>
              {proofs.length === 0 && (
                <Link to="/add-proof">
                  <Button leftIcon={<PlusIcon className="w-4 h-4" />}>
                    Create Your First Proof
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProofs.map((proof) => {
              const IconComponent = getProofIcon(proof.contentType);
              return (
                <Card key={proof.id} className="hover:shadow-md transition-shadow">
                  <CardContent>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="max-w-[12rem] sm:max-w-[16rem] md:max-w-[20rem]">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {proof.title || `${proof.contentType.toLowerCase()} Proof`}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatRelativeTime(proof.timestamp)}
                          </p>
                        </div>
                      </div>
                      {proof.isPublic && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" title="Public" />
                      )}
                    </div>

                    {proof.contentType === ProofType.IMAGE && proof.ipfsHash && (
                      <div className="w-full max-h-40 mb-3 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100">
                        <img
                          src={proof.ipfsHash.startsWith('http') ? proof.ipfsHash : `https://ipfs.io/ipfs/${proof.ipfsHash}`}
                          alt={proof.title || 'Proof image'}
                          className="object-cover w-full h-full max-h-40"
                          style={{ display: 'block' }}
                          loading="lazy"
                        />
                      </div>
                    )}

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      Hash: {proof.hash.slice(0, 16)}...
                    </p>
                    <div className="flex justify-between items-center">
                      <Link to={`/proof/${proof.id}`}>
                        <Button variant="outline" size="sm" leftIcon={<EyeIcon className="w-4 h-4" />}>
                          View
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" leftIcon={<ShareIcon className="w-4 h-4" />}>
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
