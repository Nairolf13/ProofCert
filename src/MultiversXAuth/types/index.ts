import { EnvironmentsEnum } from '@multiversx/sdk-dapp/types/enums.types';

export interface MultiversXAccount {
  address: string;
  balance: string;
  nonce: number;
  username?: string;
  shard?: number;
}

export interface MultiversXLoginInfo {
  nativeAuthToken?: string;
  signature?: string;
  loginToken?: string;
}

export interface MultiversXNetworkConfig {
  name: string;
  apiTimeout: number;
  walletConnectV2ProjectId: string;
}

export interface MultiversXDappConfig {
  shouldUseWebViewProvider: boolean;
  logoutRoute: string;
}

// Types supplémentaires pour les boutons de connexion
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';

export interface LoginButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onError'> {
  loginButtonText?: string;
  className?: string;
  callbackRoute?: string;
  onLoginRedirect?: () => void;
  onError?: (error: Error) => void;
  buttonClassName?: string;
  shouldRenderDefaultCss?: boolean;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  nativeAuth?: boolean;
}

export interface MultiversXAuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  account: MultiversXAccount | null;
  address: string;
  loginInfo: MultiversXLoginInfo | null;
}

export const WalletProvider = {
  EXTENSION: 'extension',
  WALLET_CONNECT: 'walletconnect',
  WEB_WALLET: 'webwallet'
} as const;

export type WalletProvider = typeof WalletProvider[keyof typeof WalletProvider];

// Re-export du SDK
export { EnvironmentsEnum };
export type Environment = typeof EnvironmentsEnum[keyof typeof EnvironmentsEnum];
