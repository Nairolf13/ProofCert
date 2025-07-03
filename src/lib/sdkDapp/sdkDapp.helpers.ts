// Helpers re-exports - simplified version with mock implementations for now

export const addressIsValid = (address: string): boolean => {
  return address.startsWith('erd1') && address.length === 62;
};

export const deleteTransactionToast = (txHash: string) => {
  console.log('deleteTransactionToast:', txHash);
};

export const removeAllSignedTransactions = () => {
  console.log('removeAllSignedTransactions');
};

export const removeAllTransactionsToSign = () => {
  console.log('removeAllTransactionsToSign');
};

export const getInterpretedTransaction = (transaction: Record<string, unknown>) => {
  return transaction;
};

export const getIsProviderEqualTo = (provider: string) => {
  console.log('Checking provider:', provider);
  return false;
};

export const getTransactions = async (address: string): Promise<Record<string, unknown>[]> => {
  console.log('Getting transactions for address:', address);
  return [];
};

export const logout = async (): Promise<boolean> => {
  console.log('logout');
  // Clear any stored auth data
  localStorage.removeItem('demo_wallet_connected');
  localStorage.removeItem('demo_wallet_account');
  return true;
};

export const newTransaction = (transaction: Record<string, unknown>) => {
  return transaction;
};

export const parseAmount = (amount: string, decimals: number = 18) => {
  console.log(`Parsing amount: ${amount} with ${decimals} decimals`);
  return amount;
};

export const refreshAccount = async () => {
  console.log('refreshAccount');
};

export const sendBatchTransactions = async (transactions: Record<string, unknown>[]): Promise<{ sessionId: string }> => {
  console.log('sendBatchTransactions:', transactions);
  return { sessionId: 'mock-session' };
};

export const sendTransactions = async (transactions: Record<string, unknown>[]): Promise<{ sessionId: string }> => {
  console.log('sendTransactions:', transactions);
  return { sessionId: 'mock-session' };
};

export const setTransactionsDisplayInfoState = (info: Record<string, unknown>) => {
  console.log('setTransactionsDisplayInfoState:', info);
};

export const setTransactionsToSignedState = (transactions: Record<string, unknown>[]) => {
  console.log('setTransactionsToSignedState:', transactions);
};

export const signTransactions = async (transactions: Record<string, unknown>[]): Promise<Record<string, unknown>[]> => {
  console.log('signTransactions:', transactions);
  return transactions;
};

export const trimUsernameDomain = (username: string) => {
  return username.replace('.elrond', '');
};

export const verifyMessage = (message: string, signature: string, address: string): boolean => {
  console.log('verifyMessage:', { message, signature, address });
  return true;
};
