import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './Button';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login({ emailOrUsername, password });
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMsg = (err instanceof Error && err.message) ? err.message : 'Invalid credentials';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <input
        type="text"
        placeholder="Email or Username"
        value={emailOrUsername}
        onChange={e => setEmailOrUsername(e.target.value)}
        className="w-full border rounded px-3 py-2"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full border rounded px-3 py-2"
        required
      />
      <Button type="submit" isLoading={isLoading} className="w-full">Login</Button>
    </form>
  );
};
