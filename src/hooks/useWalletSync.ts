import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useMultiversX } from '../hooks/useMultiversX';
/**
 * Hook pour synchroniser l'authentification avec le wallet MultiversX
 * À utiliser dans les composants qui ont besoin de cette synchronisation
 */
export const useWalletSync = () => {
  const { user, updateUser } = useAuth();
  const { account: multiversXAccount, isConnected: isWalletConnected } = useMultiversX();

  // Synchroniser l'adresse wallet avec l'utilisateur authentifié
  useEffect(() => {
    if (isWalletConnected && multiversXAccount && user) {
      // Mettre à jour l'utilisateur avec l'adresse wallet si elle a changé
      if (user.walletAddress !== multiversXAccount.address) {
        const updatedUser = { ...user, walletAddress: multiversXAccount.address };
        updateUser(updatedUser);
      }
    }
  }, [isWalletConnected, multiversXAccount, user, updateUser]);

  return {
    isWalletConnected,
    walletAddress: multiversXAccount?.address || null,
    walletBalance: multiversXAccount?.balance || '0'
  };
};
