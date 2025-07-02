import { MULTIVERSX_CONFIG } from '../config/multiversx';
import type { MultiversXTransaction, MultiversXAccount } from '../config/multiversx';

export class MultiversXService {
  private static instance: MultiversXService;

  static getInstance(): MultiversXService {
    if (!MultiversXService.instance) {
      MultiversXService.instance = new MultiversXService();
    }
    return MultiversXService.instance;
  }

  async createProofCertificationTransaction(
    sender: string,
    proofHash: string,
    metadata: string
  ): Promise<MultiversXTransaction> {
    // Pour l'instant, nous créons une transaction mock
    // Dans une vraie implémentation, cela appellerait un smart contract
    return {
      hash: '',
      sender,
      receiver: MULTIVERSX_CONFIG.contracts.proofEstate || 'erd1...',
      value: '0', // Pas de transfert d'EGLD
      gasLimit: 50000000,
      gasPrice: 1000000000,
      data: this.encodeTransactionData('certifyProof', [proofHash, metadata]),
    };
  }

  // Créer une transaction pour un paiement de location
  async createRentalPaymentTransaction(
    sender: string,
    receiver: string,
    amount: string,
    propertyId: string
  ): Promise<MultiversXTransaction> {
    return {
      hash: '',
      sender,
      receiver,
      value: amount,
      gasLimit: 50000,
      gasPrice: 1000000000,
      data: this.encodeTransactionData('rentalPayment', [propertyId]),
    };
  }

  // Encoder les données de transaction
  private encodeTransactionData(functionName: string, args: string[]): string {
    // Simulation de l'encodage des données de transaction
    // En réalité, cela utiliserait l'encodage ABI approprié
    const encodedFunction = Buffer.from(functionName).toString('hex');
    const encodedArgs = args.map(arg => Buffer.from(arg).toString('hex')).join('@');
    return encodedArgs ? `${encodedFunction}@${encodedArgs}` : encodedFunction;
  }

  // Vérifier une transaction sur la blockchain
  async verifyTransaction(txHash: string): Promise<boolean> {
    try {
      const response = await fetch(`${MULTIVERSX_CONFIG.apiUrl}/transactions/${txHash}`);
      const transaction = await response.json();
      return transaction.status === 'success';
    } catch (error) {
      console.error('Error verifying transaction:', error);
      return false;
    }
  }

  // Obtenir le solde d'un compte
  async getAccountBalance(address: string): Promise<string> {
    try {
      const response = await fetch(`${MULTIVERSX_CONFIG.apiUrl}/accounts/${address}`);
      const account = await response.json();
      return account.balance || '0';
    } catch (error) {
      console.error('Error fetching account balance:', error);
      return '0';
    }
  }

  // Obtenir les informations d'un compte
  async getAccountInfo(address: string): Promise<MultiversXAccount | null> {
    try {
      const response = await fetch(`${MULTIVERSX_CONFIG.apiUrl}/accounts/${address}`);
      const accountData = await response.json();
      
      return {
        address,
        balance: accountData.balance || '0',
        nonce: accountData.nonce || 0,
      };
    } catch (error) {
      console.error('Error fetching account info:', error);
      return null;
    }
  }

  // Calculer les frais de gas pour une transaction
  calculateGasFee(gasLimit: number, gasPrice: number): string {
    return (gasLimit * gasPrice).toString();
  }

  // Formater un montant EGLD
  formatEGLD(amount: string, decimals: number = 4): string {
    const amountInEGLD = parseFloat(amount) / Math.pow(10, 18);
    return amountInEGLD.toFixed(decimals);
  }

  // Convertir EGLD en wei (la plus petite unité)
  egldToWei(egldAmount: string): string {
    const wei = parseFloat(egldAmount) * Math.pow(10, 18);
    return Math.floor(wei).toString();
  }

  // Convertir wei en EGLD
  weiToEGLD(weiAmount: string): string {
    const egld = parseFloat(weiAmount) / Math.pow(10, 18);
    return egld.toString();
  }

  // Générer un lien vers l'explorateur de bloc
  getExplorerTransactionUrl(txHash: string): string {
    return `${MULTIVERSX_CONFIG.explorerUrl}/transactions/${txHash}`;
  }

  // Générer un lien vers l'explorateur pour un compte
  getExplorerAccountUrl(address: string): string {
    return `${MULTIVERSX_CONFIG.explorerUrl}/accounts/${address}`;
  }

  // Valider une adresse MultiversX
  isValidAddress(address: string): boolean {
    // Validation basique d'une adresse MultiversX
    return /^erd1[a-z0-9]{58}$/.test(address);
  }
}

// Export d'une instance singleton
export const multiversXService = MultiversXService.getInstance();
