import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { register as registerApi } from '../api/auth';

interface ClassicRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const ClassicRegisterModal: React.FC<ClassicRegisterModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!username.trim()) {
      setError('Le nom d\'utilisateur est requis.');
      return;
    }
    setLoading(true);
    try {
      await registerApi({ email, username, password });
      setSuccess(true);
      setEmail('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erreur lors de la création du compte');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
      <div className="relative w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Fermer la modal"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Créer un compte</h2>
        <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmit}>
          <input
            type="email"
            className="border rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            type="text"
            className="border rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
          <input
            type="password"
            className="border rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <input
            type="password"
            className="border rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center">Compte créé avec succès !</div>}
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-xl py-3 font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Création du compte...' : 'Créer un compte'}
          </button>
        </form>
        <div className="my-4 flex items-center justify-center gap-2">
          <span className="h-px w-8 bg-gray-200" />
          <span className="text-gray-400 text-sm">ou</span>
          <span className="h-px w-8 bg-gray-200" />
        </div>
        <div className="flex flex-col gap-3">
          <button className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 font-semibold hover:bg-gray-50 transition-colors">
            <img src="/google.svg" alt="Google" className="w-5 h-5" />
            S'inscrire avec Google
          </button>
          <button className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 font-semibold hover:bg-gray-50 transition-colors">
            <img src="/apple.svg" alt="Apple" className="w-5 h-5" />
            S'inscrire avec Apple
          </button>
        </div>
        <div className="mt-6 text-center text-sm text-gray-500">
          Déjà un compte ?{' '}
          <button onClick={onSwitchToLogin} className="text-blue-600 hover:underline font-semibold">Se connecter</button>
        </div>
      </div>
    </div>
  );
};
