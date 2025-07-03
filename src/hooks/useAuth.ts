
// Temporary authentication stubs for legacy components
// TODO: Refactor these components to use MultiversX wallet-based authentication

export const useAuth = () => ({
  login: async (credentials: Record<string, unknown>) => { 
    console.warn('Legacy login disabled. Use MultiversX wallet connection.', credentials);
    throw new Error('Use MultiversX wallet connection instead');
  },
  register: async (userData: Record<string, unknown>) => { 
    console.warn('Legacy registration disabled. Use MultiversX wallet connection.', userData);
    throw new Error('Use MultiversX wallet connection instead');
  },
  user: null,
  isAuthenticated: false,
  disconnect: async () => console.log('Use MultiversX logout'),
  updateUser: async (data: Record<string, unknown>) => console.log('User update needs MultiversX integration', data),
  refreshUser: async () => console.log('User refresh needs MultiversX integration'),
  connectWallet: async () => console.log('Use MultiversX wallet connection')
});

