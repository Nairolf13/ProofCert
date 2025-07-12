import { useQuery } from '@tanstack/react-query';
import { userApi } from '../../api/user';
import { userKeys } from '../../utils/query-keys';
import { useMultiversX } from '../useMultiversX';

interface User {
  id: string;
  walletAddress: string;
  role?: 'ADMIN' | 'USER' | string;
  email?: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface MultiversXAccount {
  address: string;
  balance: string;
  nonce: number;
  code?: string;
  codeHash?: string | null;
  rootHash?: string | null;
  txCount: number;
  scrCount: number;
  username?: string;
  shard?: number;
  ownerAddress?: string;
  developerReward?: string;
}


export const useUserByWallet = (walletAddress?: string) => {
  return useQuery<User | null, Error>({
    queryKey: userKeys.wallet(walletAddress || ''),
    queryFn: async (): Promise<User | null> => {
      if (!walletAddress) return null;
      const response = await userApi.getByWallet(walletAddress);
      return response.user;
    },
    enabled: !!walletAddress,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (cacheTime renommé en gcTime dans les versions récentes de React Query)
  });
};

export const useCurrentUser = () => {
  const { account } = useMultiversX();
  const walletAddress = (account as MultiversXAccount | undefined)?.address;
  const { data: user, ...queryInfo } = useUserByWallet(walletAddress);
  
  return {
    user,
    isAdmin: user?.role === 'ADMIN',
    ...queryInfo,
  } as const;
};
