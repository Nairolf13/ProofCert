import React, { type ReactNode } from 'react';
import { 
  DappProvider, 
  EnvironmentsEnum 
} from '../lib/sdkDapp/real-components';
import {
  MultiversXDappProvider as InternalProvider
} from './MultiversXDappProvider';

interface RealMultiversXProviderProps {
  children: ReactNode;
}

export const RealMultiversXProvider: React.FC<RealMultiversXProviderProps> = ({ children }) => {
  return (
    <DappProvider
      environment={EnvironmentsEnum.devnet}
      customNetworkConfig={{
        name: 'customConfig',
        apiTimeout: 6000,
        walletConnectV2ProjectId: 'your-wallet-connect-project-id' // Remplacez par votre project ID
      }}
      dappConfig={{
        shouldUseWebViewProvider: true,
      }}
    >
      <InternalProvider>
        {children}
      </InternalProvider>
    </DappProvider>
  );
};
