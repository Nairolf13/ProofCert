import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultiversX } from '../hooks/useMultiversX';

const WalletCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useMultiversX();

  useEffect(() => {
    // Cette page sera utilisée pour traiter le retour du Web Wallet
    // Le Web Wallet redirige ici après une connexion réussie
    
    const handleCallback = async () => {
      // Vérifier si nous avons des paramètres d'URL ou des tokens
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('accessToken');
      const address = urlParams.get('address');
      
      if (accessToken && address) {
        // Sauvegarder les informations de connexion
        localStorage.setItem('wallet_access_token', accessToken);
        localStorage.setItem('wallet_address', address);
        
        // Rediriger vers le dashboard
        navigate('/dashboard');
      } else if (isConnected) {
        // Si déjà connecté, rediriger vers le dashboard
        navigate('/dashboard');
      } else {
        // Si pas de token ou d'adresse, rediriger vers l'accueil
        navigate('/');
      }
    };

    // Délai pour permettre au provider de se mettre à jour
    const timeout = setTimeout(handleCallback, 1000);
    
    return () => clearTimeout(timeout);
  }, [navigate, isConnected]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Connexion en cours...
        </h1>
        
        <p className="text-gray-600 mb-6">
          Finalisation de la connexion avec votre wallet MultiversX.
        </p>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
        </div>
        
        <p className="text-sm text-gray-500 mt-4">
          Vous serez redirigé automatiquement...
        </p>
      </div>
    </div>
  );
};

export default WalletCallbackPage;
