import { API_BASE_URL } from '../config';

export async function register({ email, username, password }: { email: string; username: string; password: string }) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur lors de la création du compte');
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

export async function getCurrentUser() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include'
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        // Token invalide ou expiré
        localStorage.removeItem('token');
      }
      throw new Error('Erreur lors de la récupération des informations utilisateur');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Erreur dans getCurrentUser:', error);
    throw error;
  }
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
