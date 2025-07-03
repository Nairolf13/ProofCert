import React, { type PropsWithChildren } from 'react';
import { DappProvider } from '@multiversx/sdk-dapp/wrappers/DappProvider';
import { AxiosInterceptorContext } from '@multiversx/sdk-dapp/wrappers/AxiosInterceptorContext';
import { SignTransactionsModals } from '@multiversx/sdk-dapp/UI/SignTransactionsModals';
import { NotificationModal } from '@multiversx/sdk-dapp/UI/NotificationModal';
import { TransactionsToastList } from '@multiversx/sdk-dapp/UI/TransactionsToastList';
import { WalletConnectErrorHandler } from '../components/WalletConnectErrorHandler';
import {
  MULTIVERSX_ENVIRONMENT,
  MULTIVERSX_NETWORK_CONFIG,
  MULTIVERSX_DAPP_CONFIG,
  AUTHENTICATED_DOMAINS
} from '../config';

interface MultiversXProviderProps extends PropsWithChildren {
  customNetworkConfig?: Record<string, unknown>;
  dappConfig?: Record<string, unknown>;
}

export const MultiversXProvider: React.FC<MultiversXProviderProps> = ({
  children,
  customNetworkConfig = {},
  dappConfig = {}
}) => {
  const finalNetworkConfig = {
    ...MULTIVERSX_NETWORK_CONFIG,
    ...customNetworkConfig
  };

  const finalDappConfig = {
    ...MULTIVERSX_DAPP_CONFIG,
    ...dappConfig
  };

  return (
    <WalletConnectErrorHandler>
      <AxiosInterceptorContext.Provider>
        <AxiosInterceptorContext.Interceptor
          authenticatedDomains={AUTHENTICATED_DOMAINS}
        >
          <DappProvider
            environment={MULTIVERSX_ENVIRONMENT}
            customNetworkConfig={finalNetworkConfig}
            dappConfig={finalDappConfig}
          >
            <AxiosInterceptorContext.Listener>
              <TransactionsToastList />
              <NotificationModal />
              <SignTransactionsModals />
              {children}
            </AxiosInterceptorContext.Listener>
          </DappProvider>
        </AxiosInterceptorContext.Interceptor>
      </AxiosInterceptorContext.Provider>
    </WalletConnectErrorHandler>
  );
};
