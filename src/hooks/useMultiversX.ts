import { useGetAccountInfo, useGetIsLoggedIn } from '@multiversx/sdk-dapp/hooks';

export const useMultiversX = () => {
  // Utilise les hooks du SDK officiel
  const { account } = useGetAccountInfo();
  const isLoggedIn = useGetIsLoggedIn();

  return {
    account,
    isLoggedIn
  };
};
