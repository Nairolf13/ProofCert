// Types re-exports - simplified version for now
export interface AccountType {
  address: string;
  balance: string;
  nonce: number;
}

export const EnvironmentsEnum = {
  devnet: 'devnet',
  testnet: 'testnet',
  mainnet: 'mainnet'
} as const;

export type EnvironmentsEnum = typeof EnvironmentsEnum[keyof typeof EnvironmentsEnum];

export const LoginMethodsEnum = {
  extension: 'extension',
  walletconnect: 'walletconnect',
  webwallet: 'webwallet',
  ledger: 'ledger'
} as const;

export type LoginMethodsEnum = typeof LoginMethodsEnum[keyof typeof LoginMethodsEnum];

export const SignedMessageStatusesEnum = {
  pending: 'pending',
  signed: 'signed',
  cancelled: 'cancelled'
} as const;

export type SignedMessageStatusesEnum = typeof SignedMessageStatusesEnum[keyof typeof SignedMessageStatusesEnum];

export interface RawTransactionType {
  nonce: number;
  value: string;
  receiver: string;
  sender: string;
  gasPrice: number;
  gasLimit: number;
  data?: string;
  chainID: string;
  version: number;
}

export interface SignedTransactionType extends RawTransactionType {
  signature: string;
}

export interface TransactionsDisplayInfoType {
  errorMessage?: string;
  successMessage?: string;
  processingMessage?: string;
  transactionDisplayInfo: {
    title?: string;
    description?: string;
  };
}

export interface RouteType {
  path: string;
  component: React.ComponentType;
  authenticatedRoute?: boolean;
}

export interface ServerTransactionType {
  hash: string;
  status: string;
  sender: string;
  receiver: string;
  value: string;
  fee: string;
  timestamp: number;
}

export const TransactionBatchStatusesEnum = {
  success: 'success',
  fail: 'fail',
  cancelled: 'cancelled',
  timedOut: 'timedOut',
  invalid: 'invalid'
} as const;

export type TransactionBatchStatusesEnum = typeof TransactionBatchStatusesEnum[keyof typeof TransactionBatchStatusesEnum];
