import React, { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMultiversXAuth } from '../hooks/useMultiversXAuth';
import { AuthContext } from '../hooks/AuthContext';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useMultiversXAuth();
  const auth = useContext(AuthContext);
  const isClassicLoggedIn = auth?.isAuthenticated;

  useEffect(() => {
    // Si déjà authentifié, rediriger vers le tableau de bord
    if (isLoggedIn || isClassicLoggedIn) {
      // Vérifier s'il y a une redirection prévue
      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
      sessionStorage.removeItem('redirectAfterLogin');
      
      navigate(redirectPath, { replace: true });
      return;
    }
    
    // Rediriger vers la page de déverrouillage pour l'authentification par wallet
    navigate('/unlock', { 
      state: { from: location.state?.from || '/' },
      replace: true 
    });
  }, [isLoggedIn, isClassicLoggedIn, navigate, location]);

  // Afficher un état de chargement pendant la redirection
  return (
    <div className="min-h-screen w-full bg-surface-secondary flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-secondary">Redirection en cours...</p>
      </div>
    </div>
  );
};
