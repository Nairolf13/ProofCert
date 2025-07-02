import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { UserIcon, EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { validatePassword } from '../utils/auth';

type AuthMode = 'login' | 'register';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlMode = searchParams.get('mode') as AuthMode;
  const [mode, setMode] = useState<AuthMode>(urlMode || 'login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { register, login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !hasNavigated.current) {
      hasNavigated.current = true;
      navigate('/dashboard', { replace: true });
    }
    if (!isAuthenticated) {
      hasNavigated.current = false;
    }
  }, [isAuthenticated, navigate]);

  // Surveiller les changements d'URL pour mettre à jour le mode
  useEffect(() => {
    const urlMode = searchParams.get('mode') as AuthMode;
    if (urlMode && (urlMode === 'login' || urlMode === 'register')) {
      setMode(urlMode);
      resetForm();
    }
  }, [searchParams]);

  const resetForm = () => {
    setEmail('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'register') {
        if (!email || !username || !password || !confirmPassword) {
          throw new Error('Veuillez remplir tous les champs');
        }
        
        if (password !== confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas');
        }
        
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
          throw new Error(passwordValidation.errors[0]);
        }
        
        await register({ email, username, password, confirmPassword });
      } else {
        if (!email || !password) {
          throw new Error('Veuillez remplir tous les champs');
        }
        
        await login({ emailOrUsername: email, password });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValidation = validatePassword(password);
  const isFormValid = mode === 'register' 
    ? email && username && password && confirmPassword && passwordValidation.isValid && password === confirmPassword
    : email && password;

  return (
    <div className="min-h-screen w-full bg-surface-secondary flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Éléments décoratifs en arrière-plan */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-secondary rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="form-modern">
          {/* En-tête avec design moderne */}
          <div className="gradient-primary px-8 py-10 text-center relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-lg border border-white/30">
                <UserIcon className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
              <h1 className="text-3xl font-black text-white drop-shadow-lg">
                {mode === 'register' ? 'Rejoignez-nous' : 'Bon retour !'}
              </h1>
              <p className="text-white/90 mt-2 text-lg font-medium">
                {mode === 'register' 
                  ? 'Créez votre compte pour certifier vos preuves' 
                  : 'Connectez-vous à votre espace sécurisé'}
              </p>
            </div>
          </div>
          
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">              {error && (
                <div className="bg-red-50/80 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium backdrop-blur-sm animate-shake">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    {error}
                  </div>
                </div>
              )}

              {/* Champ Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-bold text-secondary">
                  {mode === 'login' ? 'Email ou nom d\'utilisateur' : 'Adresse email'}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <EnvelopeIcon className="h-5 w-5 text-secondary group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    id="email"
                    type={mode === 'register' ? 'email' : 'text'}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-focus-glow block w-full pl-12 pr-4 py-4 border-2 border-light rounded-2xl leading-5 bg-surface backdrop-blur-sm placeholder-gray-400 focus:outline-none focus:ring-0 transition-all duration-200 text-lg font-medium"
                    placeholder={mode === 'register' ? 'votre@email.com' : 'Email ou nom d\'utilisateur'}
                  />
                </div>
              </div>

              {/* Champ Username (inscription seulement) */}
              {mode === 'register' && (
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-sm font-bold text-secondary">
                    Nom d'utilisateur
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <UserIcon className="h-5 w-5 text-secondary group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      id="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="input-focus-glow block w-full pl-12 pr-4 py-4 border-2 border-light rounded-2xl leading-5 bg-surface backdrop-blur-sm placeholder-gray-400 focus:outline-none focus:ring-0 transition-all duration-200 text-lg font-medium"
                      placeholder="Choisissez un nom d'utilisateur"
                    />
                  </div>
                </div>
              )}

              {/* Champ Mot de passe */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-bold text-secondary">
                  Mot de passe
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <LockClosedIcon className="h-5 w-5 text-secondary group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-focus-glow block w-full pl-12 pr-12 py-4 border-2 border-light rounded-2xl leading-5 bg-surface backdrop-blur-sm placeholder-gray-400 focus:outline-none focus:ring-0 transition-all duration-200 text-lg font-medium"
                    placeholder="Entrez votre mot de passe"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 hover:bg-gray-100 rounded-r-2xl transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                
                {/* Validation du mot de passe (inscription) */}
                {mode === 'register' && password && (
                  <div className="mt-3 p-4 bg-surface-secondary rounded-2xl backdrop-blur-sm border border-light">
                    <div className="space-y-2">
                      {passwordValidation.errors.map((error, index) => (
                        <div key={index} className="text-error flex items-center text-sm font-medium">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-3"></div>
                          {error}
                        </div>
                      ))}
                      {passwordValidation.isValid && (
                        <div className="text-success flex items-center text-sm font-medium">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></div>
                          Mot de passe conforme à tous les critères
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmation mot de passe (inscription seulement) */}
              {mode === 'register' && (
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-bold text-secondary">
                    Confirmez le mot de passe
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <LockClosedIcon className="h-5 w-5 text-secondary group-focus-within:text-success transition-colors" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-focus-glow block w-full pl-12 pr-12 py-4 border-2 border-light rounded-2xl leading-5 bg-surface backdrop-blur-sm placeholder-gray-400 focus:outline-none focus:ring-0 transition-all duration-200 text-lg font-medium"
                      placeholder="Confirmez votre mot de passe"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 hover:bg-gray-100 rounded-r-2xl transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  
                  {/* Validation de la confirmation */}
                  {confirmPassword && (
                    <div className="mt-2">
                      {password === confirmPassword ? (
                        <div className="text-success flex items-center text-sm font-medium">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></div>
                          Les mots de passe correspondent
                        </div>
                      ) : (
                        <div className="text-error flex items-center text-sm font-medium">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-3"></div>
                          Les mots de passe ne correspondent pas
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Bouton de soumission */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className={`w-full py-4 text-lg font-bold rounded-2xl shadow-xl transition-all duration-200 ${
                    !isFormValid || isLoading 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'gradient-primary text-white hover:scale-105 hover:shadow-2xl active:scale-95'
                  }`}
                  disabled={!isFormValid || isLoading}
                  isLoading={isLoading}
                >
                  {mode === 'register' ? 'Créer mon compte' : 'Se connecter'}
                </Button>
              </div>
            </form>

            {/* Lien de changement de mode */}
            <div className="mt-8 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-light"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-surface text-secondary font-medium">ou</span>
                </div>
              </div>
              <button
                onClick={() => switchMode(mode === 'register' ? 'login' : 'register')}
                className="mt-4 text-lg font-bold text-primary hover:scale-105 transition-transform duration-200"
              >
                {mode === 'register' 
                  ? 'J\'ai déjà un compte' 
                  : 'Créer un nouveau compte'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
