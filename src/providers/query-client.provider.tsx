import { QueryClientProvider as BaseQueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from 'react';
import { createQueryClient } from '../config/query-client.config';

const queryClient = createQueryClient();

interface QueryClientProviderProps {
  children: ReactNode;
  enableDevTools?: boolean;
}

export const QueryClientProvider = ({ 
  children, 
  enableDevTools = process.env.NODE_ENV === 'development' 
}: QueryClientProviderProps) => (
  <BaseQueryClientProvider client={queryClient}>
    {children}
    {enableDevTools && <ReactQueryDevtools position="bottom" />}
  </BaseQueryClientProvider>
);
