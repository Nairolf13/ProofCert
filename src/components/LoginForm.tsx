import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultiversXAuth } from '../hooks/useMultiversXAuth';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { isLoggedIn, isLoading } = useMultiversXAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Éviter les redirections multiples
    if (hasRedirected) return;
    
    if (isLoggedIn) {
      console.log('User is already logged in, calling onSuccess');
      onSuccess?.();
      setHasRedirected(true);
      return;
    }
    
    // Ne rediriger que si pas en cours de chargement et pas encore redirigé
    if (!isLoading && !hasRedirected) {
      console.log('Redirecting to unlock page');
      setHasRedirected(true);
      navigate('/unlock');
    }
  }, [isLoggedIn, isLoading, navigate, onSuccess, hasRedirected]);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
      <p className="text-secondary">
        {isLoggedIn ? 'Authentification réussie...' : 'Redirection vers l\'authentification MultiversX...'}
      </p>
    </div>
  );
};

