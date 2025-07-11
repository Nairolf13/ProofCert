import { API_BASE_URL } from '../config';

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  walletAddress?: string;
  role?: string;
}

export async function register({ 
  email, 
  username, 
  password, 
  confirmPassword,
  firstName,
  lastName,
  phoneNumber,
  walletAddress, 
  role = 'TENANT' 
}: RegisterData) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      email, 
      username, 
      password, 
      confirmPassword,
      firstName,
      lastName,
      phoneNumber,
      walletAddress, 
      role 
    }),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur lors de la création du compte');
  return data;
}

export async function connectWallet(walletAddress: string) {
  const res = await fetch(`${API_BASE_URL}/auth/connect-wallet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress }),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur lors de la connexion avec le wallet');
  return data;
}

export async function login({ emailOrUsername, password }: { emailOrUsername: string; password: string }) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrUsername, password }),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur lors de la connexion');
  return data;
}

export async function logout() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Erreur lors de la déconnexion');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Logout error:', error);
    // En cas d'erreur, on continue quand même la déconnexion côté client
    return { success: true };
  }
}
