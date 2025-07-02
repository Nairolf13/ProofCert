import { useContext } from 'react';
import { MultiversXContext } from './MultiversXProvider';

export const useMultiversX = () => {
  const context = useContext(MultiversXContext);
  if (context === undefined) {
    throw new Error('useMultiversX must be used within a MultiversXProvider');
  }
  return context;
};
