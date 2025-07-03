// Hooks personnalisés pour simuler les hooks MultiversX
import { useState, useEffect } from 'react';

// Hook personnalisé pour simuler les hooks MultiversX
export const useGetAccountInfo = () => {
  const [account, setAccount] = useState({
    address: '',
    balance: '0',
    nonce: 0
  });

  useEffect(() => {
    // Charger l'adresse depuis le localStorage si elle existe
    const savedAddress = localStorage.getItem('multiversx_address');
    if (savedAddress) {
      setAccount({
        address: savedAddress,
        balance: (Math.random() * 1000).toFixed(4),
        nonce: Math.floor(Math.random() * 100)
      });
    }
  }, []);

  return { account };
};

export const useGetIsLoggedIn = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      const address = localStorage.getItem('multiversx_address');
      setIsLoggedIn(!!address);
    };

    checkLoginStatus();
    
    // Écouter les changements de localStorage
    const handleStorageChange = () => checkLoginStatus();
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return isLoggedIn;
};
