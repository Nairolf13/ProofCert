import { QueryClient } from '@tanstack/react-query';

export const queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 15 * 60 * 1000, // 15 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retryDelay: (attemptIndex: number) => 
        Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
};

export const createQueryClient = () => new QueryClient(queryClientConfig);
