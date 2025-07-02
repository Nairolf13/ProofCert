import { useState, useCallback } from 'react';
import { useMultiversX } from '../hooks/useMultiversX';
import { multiversXService } from '../services/multiversx';

export const useBlockchain = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { account, signTransaction, isConnected } = useMultiversX();

  // Certifier une preuve sur la blockchain
  const certifyProof = useCallback(async (proofHash: string, metadata: string) => {
    if (!isConnected || !account) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Créer la transaction
      const transaction = await multiversXService.createProofCertificationTransaction(
        account.address,
        proofHash,
        metadata
      );

      // Signer la transaction
      const signedTransaction = await signTransaction(transaction);

      // Dans une vraie implémentation, on enverrait la transaction au réseau ici
      console.log('Signed transaction:', signedTransaction);

      // Simuler un hash de transaction basé sur la signature
      const mockTxHash = 'tx_' + signedTransaction.hash || Math.random().toString(36).substring(7);
      
      return {
        txHash: mockTxHash,
        explorerUrl: multiversXService.getExplorerTransactionUrl(mockTxHash)
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [account, signTransaction, isConnected]);

  // Effectuer un paiement de location
  const makeRentalPayment = useCallback(async (
    receiverAddress: string,
    amount: string,
    propertyId: string
  ) => {
    if (!isConnected || !account) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Vérifier que l'adresse est valide
      if (!multiversXService.isValidAddress(receiverAddress)) {
        throw new Error('Invalid receiver address');
      }

      // Créer la transaction de paiement
      const transaction = await multiversXService.createRentalPaymentTransaction(
        account.address,
        receiverAddress,
        multiversXService.egldToWei(amount),
        propertyId
      );

      // Signer la transaction
      await signTransaction(transaction);

      // Simuler un hash de transaction
      const mockTxHash = 'tx_' + Math.random().toString(36).substring(7);
      
      return {
        txHash: mockTxHash,
        explorerUrl: multiversXService.getExplorerTransactionUrl(mockTxHash),
        amount: amount,
        receiver: receiverAddress
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [account, signTransaction, isConnected]);

  // Vérifier le statut d'une transaction
  const verifyTransaction = useCallback(async (txHash: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const isValid = await multiversXService.verifyTransaction(txHash);
      return isValid;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtenir le solde du compte connecté
  const getBalance = useCallback(async () => {
    if (!account) {
      return '0';
    }

    try {
      const balance = await multiversXService.getAccountBalance(account.address);
      return multiversXService.formatEGLD(balance);
    } catch (err) {
      console.error('Error fetching balance:', err);
      return '0';
    }
  }, [account]);

  // Calculer les frais estimés pour une transaction
  const estimateTransactionFees = useCallback((gasLimit: number) => {
    const gasPrice = 1000000000; // Prix du gas par défaut
    const feeInWei = multiversXService.calculateGasFee(gasLimit, gasPrice);
    return multiversXService.formatEGLD(feeInWei, 6);
  }, []);

  return {
    // État
    isLoading,
    error,
    isConnected,
    account,

    // Actions
    certifyProof,
    makeRentalPayment,
    verifyTransaction,
    getBalance,
    estimateTransactionFees,

    // Utilitaires
    formatEGLD: multiversXService.formatEGLD,
    egldToWei: multiversXService.egldToWei,
    weiToEGLD: multiversXService.weiToEGLD,
    isValidAddress: multiversXService.isValidAddress,
    getExplorerUrl: multiversXService.getExplorerTransactionUrl,
  };
};
