export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown> = {}) => 
    [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  wallet: (address: string) => 
    [...userKeys.all, 'wallet', { address }] as const,
};

export const proofKeys = {
  all: ['proofs'] as const,
  lists: () => [...proofKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown> = {}) => 
    [...proofKeys.lists(), { filters }] as const,
  details: () => [...proofKeys.all, 'detail'] as const,
  detail: (id: string) => [...proofKeys.details(), id] as const,
};
