import { useContext } from 'react';
import { MultiversXDappContext } from './MultiversXDappContext';

// Hook pour utiliser le contexte MultiversX
export const useMultiversXDapp = () => {
  const context = useContext(MultiversXDappContext);
  if (!context) {
    throw new Error('useMultiversXDapp must be used within MultiversXDappProvider');
  }
  return context;
};
