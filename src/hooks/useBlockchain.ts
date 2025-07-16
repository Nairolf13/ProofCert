import { useState, useCallback } from 'react';
import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks';
import { sendTransactions } from '@multiversx/sdk-dapp/services/transactions/sendTransactions';

export const useBlockchain = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { account } = useGetAccountInfo();

  // Certifier une preuve sur la blockchain
  const certifyProof = useCallback(async (proofHash: string, metadata: string) => {
    console.log('[certifyProof] account:', account);
    if (!account?.address) {
      throw new Error('Wallet not connected');
    }
    setIsLoading(true);
    setError(null);
    try {
      // Transaction simple : ancrage du hash dans le champ data, receiver = soi-même
      const tx = {
        value: '0',
        data: `proofHash@${proofHash}@${metadata}`,
        receiver: account.address,
        gasLimit: 50000, // suffisant pour une data simple
      };
      const { sessionId } = await sendTransactions({
        transactions: [tx],
        signWithoutSending: false,
      });
      return {
        txHash: sessionId,
        explorerUrl: `https://explorer.multiversx.com/transactions/${sessionId}`
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [account]);

  // Effectuer un paiement de location
  const makeRentalPayment = useCallback(async (
    receiverAddress: string,
    amount: string,
    propertyId: string
  ) => {
    if (!account?.address) {
      throw new Error('Wallet not connected');
    }
    setIsLoading(true);
    setError(null);
    try {
      // À adapter selon ton smart contract
      const tx = {
        value: amount, // en wei
        data: `rent@${propertyId}`,
        receiver: receiverAddress,
        gasLimit: 60000000,
      };
      const { sessionId } = await sendTransactions({
        transactions: [tx],
        signWithoutSending: false,
      });
      return {
        txHash: sessionId,
        explorerUrl: `https://explorer.multiversx.com/transactions/${sessionId}`,
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
  }, [account]);

  // Vérifier le statut d'une transaction
  const verifyTransaction = useCallback(async (txHash: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://api.multiversx.com/transactions/${txHash}`);
      const data = await res.json();
      return data.status === 'success';
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
    if (!account?.address) {
      return '0';
    }
    try {
      const res = await fetch(`https://api.multiversx.com/accounts/${account.address}`);
      const data = await res.json();
      return (parseInt(data.balance, 10) / 1e18).toFixed(4); // EGLD
    } catch (err) {
      console.error('Error fetching balance:', err);
      return '0';
    }
  }, [account]);

  // Calculer les frais estimés pour une transaction
  const estimateTransactionFees = useCallback((gasLimit: number) => {
    const gasPrice = 1000000000; // Prix du gas par défaut
    const feeInWei = gasLimit * gasPrice;
    return (feeInWei / 1e18).toFixed(6); // EGLD
  }, []);

  return {
    isLoading,
    error,
    account,
    certifyProof,
    makeRentalPayment,
    verifyTransaction,
    getBalance,
    estimateTransactionFees,
    // Utilitaires simples
    formatEGLD: (wei: string | number, decimals = 4) => (Number(wei) / 1e18).toFixed(decimals),
    egldToWei: (egld: string | number) => (Number(egld) * 1e18).toString(),
    weiToEGLD: (wei: string | number, decimals = 4) => (Number(wei) / 1e18).toFixed(decimals),
    isValidAddress: (address: string) => /^erd1[0-9a-z]{58}$/.test(address),
    getExplorerUrl: (txHash: string) => `https://explorer.multiversx.com/transactions/${txHash}`,
  };
};
