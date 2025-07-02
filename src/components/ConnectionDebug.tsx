import React, { useState, useEffect } from 'react';
import axios from 'axios';

const getApiBaseUrl = () => {
  if (import.meta.env.DEV) {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:3001/api`;
    }
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
};

export const ConnectionDebug: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [error, setError] = useState<string>('');
  const [showDebug, setShowDebug] = useState(false);
  
  const apiUrl = getApiBaseUrl();
  const hostname = window.location.hostname;
  const currentUrl = window.location.href;

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setApiStatus('checking');
        const response = await axios.get(`${apiUrl}/health`, { timeout: 5000 });
        if (response.status === 200) {
          setApiStatus('connected');
          setError('');
        }
      } catch (err: unknown) {
        setApiStatus('error');
        if (err instanceof Error) {
          setError(err.message || 'Connexion échouée');
        } else {
          setError('Connexion échouée');
        }
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000); // Vérifier toutes les 10s
    return () => clearInterval(interval);
  }, [apiUrl]);

  if (!import.meta.env.DEV) return null; // Ne pas afficher en production

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
          apiStatus === 'connected' ? 'bg-green-100 text-green-700' :
          apiStatus === 'error' ? 'bg-red-100 text-red-700' :
          'bg-yellow-100 text-yellow-700'
        }`}
      >
        API: {apiStatus === 'connected' ? '✓' : apiStatus === 'error' ? '✗' : '...'}
      </button>

      {showDebug && (
        <div className="absolute bottom-12 right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-xs">
          <h4 className="font-bold mb-2">Debug Info</h4>
          
          <div className="space-y-2">
            <div>
              <strong>Status:</strong>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                apiStatus === 'connected' ? 'bg-green-100 text-green-700' :
                apiStatus === 'error' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {apiStatus === 'connected' ? 'Connecté' : 
                 apiStatus === 'error' ? 'Erreur' : 'Vérification...'}
              </span>
            </div>
            
            <div><strong>URL actuelle:</strong> {currentUrl}</div>
            <div><strong>Hostname:</strong> {hostname}</div>
            <div><strong>API URL:</strong> {apiUrl}</div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
                <strong>Erreur:</strong> {error}
              </div>
            )}
            
            <div className="mt-3 pt-2 border-t border-gray-200">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
              >
                Recharger la page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};