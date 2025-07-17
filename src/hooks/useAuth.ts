import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  
  // Add any additional functionality from the legacy implementation if needed
  return {
    ...context,
    disconnect: async () => console.log('Use MultiversX logout'),
    updateUser: async (data: Record<string, unknown>) => console.log('User update needs MultiversX integration', data),
    refreshUser: async () => console.log('User refresh needs MultiversX integration'),
    connectWallet: async () => console.log('Connect wallet needs MultiversX integration')
  };
};
