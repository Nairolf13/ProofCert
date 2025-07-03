import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultiversXAuth } from '../hooks/useMultiversXAuth';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useMultiversXAuth();

  useEffect(() => {
    if (isLoggedIn) {
      onSuccess?.();
      return;
    }
    
    // Redirect to unlock page for wallet authentication
    navigate('/unlock');
  }, [isLoggedIn, navigate, onSuccess]);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
      <p className="text-secondary">Redirecting to MultiversX wallet authentication...</p>
    </div>
  );
};
