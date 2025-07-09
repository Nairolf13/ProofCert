import React, { useState, useContext } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../hooks/AuthContext';
import { SocialAuthButtons } from './SocialAuthButtons';
import { PasswordInput } from './PasswordInput';

interface ClassicLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export const ClassicLoginModal: React.FC<ClassicLoginModalProps> = ({ isOpen, onClose, onSwitchToRegister }) => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await auth?.login({ emailOrUsername, password });
      onClose();
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erreur lors de la connexion');
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Connexion classique</h2>
        <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmit}>
          <input
            type="text"
            className="border rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email ou nom d'utilisateur"
            value={emailOrUsername}
            onChange={e => setEmailOrUsername(e.target.value)}
            required
            autoComplete="username"
          />
          <PasswordInput
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            error={error}
          />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-xl py-3 font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <div className="my-4 flex items-center justify-center gap-2">
          <span className="h-px w-8 bg-gray-200" />
          <span className="text-gray-400 text-sm">ou</span>
          <span className="h-px w-8 bg-gray-200" />
        </div>
        <SocialAuthButtons variant="login" />
        <div className="mt-6 text-center text-sm text-gray-500">
          Pas encore de compte ?{' '}
          <button onClick={onSwitchToRegister} className="text-blue-600 hover:underline font-semibold">Créer un compte</button>
        </div>
      </div>
    </div>
  );
};
