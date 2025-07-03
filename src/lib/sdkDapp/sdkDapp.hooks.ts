// Hooks re-exports - simplified version with mock implementations for now
import { useState } from 'react';
import type { AccountType } from './sdkDapp.types';

// Mock implementations for development
export const useBatchTransactionsTracker = () => ({ batchTransactions: [] });
export const useCheckBatch = () => ({ isChecking: false });

export const useGetAccount = (): AccountType => {
  const [account] = useState<AccountType>({
    address: '',
    balance: '0',
    nonce: 0
  });
  return account;
};

export const useGetAccountInfo = () => ({
  account: {
    address: '',
    balance: '0',
    nonce: 0
  }
});

export const useGetAccountProvider = () => ({ providerType: 'none' });
export const useGetActiveTransactionsStatus = () => ({ isPending: false });
export const useGetBatches = () => ({ batches: [] });

export const useGetIsLoggedIn = () => {
  const [isLoggedIn] = useState(false);
  return isLoggedIn;
};

export const useGetLastSignedMessageSession = () => ({ session: null });
export const useGetLoginInfo = () => ({ loginInfo: null });
export const useGetNetworkConfig = () => ({ 
  network: { 
    id: 'devnet', 
    name: 'Devnet',
    egldLabel: 'EGLD',
    apiUrl: 'https://devnet-api.multiversx.com'
  } 
});

export const useGetPendingTransactions = () => ({ pendingTransactions: [] });
export const useGetSignMessageInfoStatus = () => ({ status: 'idle' });
export const useGetSignMessageSession = () => ({ session: null });
export const useGetSignedTransactions = () => ({ signedTransactions: [] });
export const useParseSignedTransactions = () => ({ parsedTransactions: [] });
export const useSendBatchTransactions = () => ({ sendBatchTransactions: () => {} });
export const useSignMessage = () => ({ signMessage: () => {} });
export const useSignTransactions = () => ({ signTransactions: () => {} });
export const useTrackTransactionStatus = () => ({ trackTransactionStatus: () => {} });
export const useTransactionsTracker = () => ({ transactionsTracker: [] });
