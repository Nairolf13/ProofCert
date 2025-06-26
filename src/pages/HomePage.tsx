import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { 
  ShieldCheckIcon, 
  GlobeAltIcon, 
  QrCodeIcon,
  CameraIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';

export const HomePage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Immutable Proof',
      description: 'Generate SHA-256 hashes and store your proofs on IPFS for permanent verification.',
    },
    {
      icon: GlobeAltIcon,
      title: 'Global Access',
      description: 'Share your certified proofs anywhere in the world with secure, verifiable links.',
    },
    {
      icon: QrCodeIcon,
      title: 'QR Code Sharing',
      description: 'Generate QR codes for easy sharing and quick verification of your proofs.',
    },
  ];

  const proofTypes = [
    { icon: CameraIcon, name: 'Photos', description: 'Capture and certify images' },
    { icon: DocumentTextIcon, name: 'Text', description: 'Secure written content' },
    { icon: VideoCameraIcon, name: 'Videos', description: 'Verify video evidence' },
    { icon: MicrophoneIcon, name: 'Audio', description: 'Authenticate voice recordings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Certify Your Digital
              <span className="text-primary-600 block">Evidence</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Create tamper-proof certificates for any digital content. Photos, videos, text, or audio - 
              all secured with blockchain technology and immutable storage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="w-full sm:w-auto" onClick={() => setMode('login')}>
                Login
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => setMode('register')}>
                Register
              </Button>
            </div>
            <div className="max-w-md mx-auto mt-8">
              <Card>
                <CardContent>
                  {mode === 'login' ? <LoginForm /> : <RegisterForm />}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose ProofCert?
            </h2>
            <p className="text-lg text-gray-600">
              Built with the latest technology to ensure your proofs are secure and verifiable.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center">
                  <CardContent>
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Support for All Content Types
            </h2>
            <p className="text-lg text-gray-600">
              Certify any type of digital content with our comprehensive platform.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {proofTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <Card key={index} className="text-center hover:shadow-md transition-shadow">
                  <CardContent>
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-5 h-5 text-primary-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {type.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {type.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <div className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Secure Your Digital Assets?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of users who trust ProofCert for digital evidence certification.
          </p>
          <Link to="/auth">
            <Button variant="secondary" size="lg">
              Start Certifying Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
