import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultiversXAuth } from '../hooks/useMultiversXAuth';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useMultiversXAuth();

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isLoggedIn) {
      navigate('/dashboard', { replace: true });
      return;
    }
    
    // Otherwise redirect to unlock page for wallet authentication
    navigate('/unlock', { replace: true });
  }, [isLoggedIn, navigate]);

  // Show a loading state while redirecting
  return (
    <div className="min-h-screen w-full bg-surface-secondary flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-secondary">Redirecting to wallet authentication...</p>
      </div>
    </div>
  );
};
