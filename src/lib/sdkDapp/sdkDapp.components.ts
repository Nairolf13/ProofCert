// Components re-exports - simplified version with mock implementations for now
import React from 'react';

// Mock components for development
export const ACCOUNTS_ENDPOINT = '/accounts';

export const AxiosInterceptorContext = React.createContext({});

export const CopyButton: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => 
  React.createElement('button', { 
    className: `copy-button ${className}`,
    onClick: () => navigator.clipboard?.writeText(text)
  }, 'Copy');

export const CrossWindowLoginButton: React.FC<{ 
  loginButtonText: string; 
  className?: string;
  callbackRoute?: string;
  onLoginRedirect?: () => void;
}> = ({ loginButtonText, className = '', onLoginRedirect }) => 
  React.createElement('button', { 
    className: `cross-window-login-button ${className}`,
    onClick: onLoginRedirect
  }, loginButtonText);

export const DappProvider: React.FC<{
  children: React.ReactNode;
  environment: string;
  customNetworkConfig?: Record<string, unknown>;
  dappConfig?: Record<string, unknown>;
}> = ({ children }) => React.createElement(React.Fragment, {}, children);

export const ExplorerLink: React.FC<{ 
  page: string; 
  text: string; 
  className?: string 
}> = ({ text, className = '' }) => 
  React.createElement('a', { className: `explorer-link ${className}` }, text);

export const ExtensionLoginButton: React.FC<{ 
  loginButtonText: string; 
  className?: string;
  callbackRoute?: string;
  onLoginRedirect?: () => void;
}> = ({ loginButtonText, className = '', onLoginRedirect }) => 
  React.createElement('button', { 
    className: `extension-login-button ${className}`,
    onClick: onLoginRedirect
  }, loginButtonText);

export const FormatAmount: React.FC<{ 
  value: string; 
  egldLabel?: string; 
  showLastNonZeroDecimal?: boolean 
}> = ({ value, egldLabel = 'EGLD' }) => 
  React.createElement('span', {}, `${value} ${egldLabel}`);

export const IframeButton: React.FC<{ 
  loginButtonText: string; 
  className?: string;
  onClick?: () => void;
}> = ({ loginButtonText, className = '', onClick }) => 
  React.createElement('button', { 
    className: `iframe-button ${className}`,
    onClick
  }, loginButtonText);

export const LedgerLoginButton: React.FC<{ 
  loginButtonText: string; 
  className?: string;
  callbackRoute?: string;
  onLoginRedirect?: () => void;
}> = ({ loginButtonText, className = '', onLoginRedirect }) => 
  React.createElement('button', { 
    className: `ledger-login-button ${className}`,
    onClick: onLoginRedirect
  }, loginButtonText);

export const Loader: React.FC<{ className?: string }> = ({ className = '' }) => 
  React.createElement('div', { className: `loader ${className}` }, 'Loading...');

export const NotificationModal: React.FC = () => 
  React.createElement('div', { className: 'notification-modal' });

export const OperaWalletLoginButton: React.FC<{ 
  loginButtonText: string; 
  className?: string;
  callbackRoute?: string;
  onLoginRedirect?: () => void;
}> = ({ loginButtonText, className = '', onLoginRedirect }) => 
  React.createElement('button', { 
    className: `opera-wallet-login-button ${className}`,
    onClick: onLoginRedirect
  }, loginButtonText);

export const PageState: React.FC<{ 
  icon?: React.ReactNode; 
  title: string; 
  description?: string 
}> = ({ title, description }) => 
  React.createElement('div', { className: 'page-state' }, 
    React.createElement('h2', {}, title),
    description && React.createElement('p', {}, description)
  );

export const SignTransactionsModals: React.FC = () => 
  React.createElement('div', { className: 'sign-transactions-modals' });

export const TransactionRow: React.FC<{ transaction: Record<string, unknown> }> = () => 
  React.createElement('div', { className: 'transaction-row' }, 'Transaction');

export const TransactionsTable: React.FC<{ transactions: Record<string, unknown>[] }> = () => 
  React.createElement('div', { className: 'transactions-table' }, 'Transactions Table');

export const TransactionsToastList: React.FC = () => 
  React.createElement('div', { className: 'transactions-toast-list' });

export const WalletConnectLoginButton: React.FC<{ 
  loginButtonText: string; 
  className?: string;
  callbackRoute?: string;
  onLoginRedirect?: () => void;
}> = ({ loginButtonText, className = '', onLoginRedirect }) => 
  React.createElement('button', { 
    className: `wallet-connect-login-button ${className}`,
    onClick: onLoginRedirect
  }, loginButtonText);

export const WebWalletLoginButton: React.FC<{ 
  loginButtonText: string; 
  className?: string;
  callbackRoute?: string;
  onLoginRedirect?: () => void;
}> = ({ loginButtonText, className = '', onLoginRedirect }) => 
  React.createElement('button', { 
    className: `web-wallet-login-button ${className}`,
    onClick: onLoginRedirect
  }, loginButtonText);

export const XaliasCrossWindowLoginButton: React.FC<{ 
  loginButtonText: string; 
  className?: string;
  callbackRoute?: string;
  onLoginRedirect?: () => void;
}> = ({ loginButtonText, className = '', onLoginRedirect }) => 
  React.createElement('button', { 
    className: `xalias-cross-window-login-button ${className}`,
    onClick: onLoginRedirect
  }, loginButtonText);

export const XaliasLoginButton: React.FC<{ 
  loginButtonText: string; 
  className?: string;
  callbackRoute?: string;
  onLoginRedirect?: () => void;
}> = ({ loginButtonText, className = '', onLoginRedirect }) => 
  React.createElement('button', { 
    className: `xalias-login-button ${className}`,
    onClick: onLoginRedirect
  }, loginButtonText);
