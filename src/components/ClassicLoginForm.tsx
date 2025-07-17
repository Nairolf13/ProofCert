import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { useMultiversXAuth } from '../hooks/useMultiversXAuth';

export const ClassicLoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { loadUserData } = useMultiversXAuth();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login({ emailOrUsername, password });
      // Debug temporaire : log la structure de la réponse
      console.log('[ClassicLoginForm] login response:', data);
      localStorage.setItem('token', data.accessToken);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        // Log le contenu du localStorage après écriture
        console.log('[ClassicLoginForm] localStorage user après login:', localStorage.getItem('user'));
      } else {
        console.warn('[ClassicLoginForm] Pas de clé user dans la réponse login:', data);
      }
      await loadUserData();
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('Erreur lors de la connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Connexion classique</h2>
      <input
        type="text"
        className="w-full mb-2 p-2 border rounded"
        placeholder="Email ou nom d'utilisateur"
        value={emailOrUsername}
        onChange={e => setEmailOrUsername(e.target.value)}
        required
      />
      <input
        type="password"
        className="w-full mb-4 p-2 border rounded"
        placeholder="Mot de passe"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <button
        type="submit"
        className="w-full bg-primary text-white py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  );
};
