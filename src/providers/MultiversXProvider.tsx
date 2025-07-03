import React, { type PropsWithChildren } from 'react';
import { environment, appConfig, sampleAuthenticatedDomains } from '../config/environments';
import {
  DappProvider,
  AxiosInterceptorContext,
  SignTransactionsModals,
  NotificationModal,
  TransactionsToastList
} from '../lib/multiversx';

interface MultiversXProviderProps extends PropsWithChildren {
  // Props optionnelles pour la configuration
  customNetworkConfig?: Record<string, unknown>;
  dappConfig?: Record<string, unknown>;
}

export const MultiversXProvider: React.FC<MultiversXProviderProps> = ({
  children,
  customNetworkConfig = {},
  dappConfig = {}
}) => {
  const defaultNetworkConfig = {
    name: 'customConfig',
    apiTimeout: appConfig.apiTimeout,
    walletConnectV2ProjectId: appConfig.walletConnectV2ProjectId,
    ...customNetworkConfig
  };

  const defaultDappConfig = {
    shouldUseWebViewProvider: true,
    logoutRoute: '/',
    ...dappConfig
  };

  return (
    <AxiosInterceptorContext.Provider>
      <AxiosInterceptorContext.Interceptor
        authenticatedDomains={sampleAuthenticatedDomains}
      >
        <DappProvider
          environment={environment}
          customNetworkConfig={defaultNetworkConfig}
          dappConfig={defaultDappConfig}
        >
          <AxiosInterceptorContext.Listener>
            {/* Modals et toasts pour les transactions */}
            <TransactionsToastList />
            <NotificationModal />
            <SignTransactionsModals />
            
            {children}
          </AxiosInterceptorContext.Listener>
        </DappProvider>
      </AxiosInterceptorContext.Interceptor>
    </AxiosInterceptorContext.Provider>
  );
};
