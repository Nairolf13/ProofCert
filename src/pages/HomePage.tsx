import React from 'react';
import { ImmersiveLayout } from '../components/ImmersiveLayout';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <ImmersiveLayout>
      <section className="w-full max-w-4xl flex flex-col items-center gap-10 animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-extrabold text-center text-primary drop-shadow-lg leading-tight mb-4">
          Explorez, <span className="text-accent">certifiez</span>, <span className="text-warning">partagez</span> vos preuves
        </h1>
        <p className="text-xl md:text-2xl text-center text-secondary max-w-2xl mb-8">
          Un magazine interactif pour découvrir, réserver et certifier des biens d'exception. Naviguez comme dans un livre, laissez-vous surprendre par chaque page.
        </p>
        
        {/* Boutons d'action selon l'état d'authentification */}
        <div className="flex flex-wrap gap-8 justify-center">
          {isAuthenticated ? (
            // Utilisateur connecté - Boutons vers les fonctionnalités
            <>
              <Link to="/properties" className="gradient-primary text-white px-8 py-4 rounded-3xl shadow-xl text-2xl font-bold hover:scale-105 hover:shadow-2xl transition-all duration-200">
                Découvrir les biens
              </Link>
              <Link to="/dashboard" className="bg-surface border-2 border-light text-primary px-8 py-4 rounded-3xl shadow-xl text-2xl font-bold hover:bg-surface-secondary hover:scale-105 transition-all duration-200">
                Mon tableau de bord
              </Link>
            </>
          ) : (
            // Utilisateur non connecté - Boutons d'inscription/connexion
            <>
              <Link to="/auth?mode=register" className="gradient-primary text-white px-8 py-4 rounded-3xl shadow-xl text-2xl font-bold hover:scale-105 hover:shadow-2xl transition-all duration-200">
                S'inscrire
              </Link>
              <Link to="/auth?mode=login" className="bg-surface border-2 border-light text-primary px-8 py-4 rounded-3xl shadow-xl text-2xl font-bold hover:bg-surface-secondary hover:scale-105 transition-all duration-200">
                Se connecter
              </Link>
            </>
          )}
        </div>
        
        <div className="w-full flex flex-col md:flex-row gap-8 mt-12 items-center justify-center">
          <img src="/vite.svg" alt="Magazine" className="w-64 h-64 object-contain rounded-3xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-300" />
          <div className="flex flex-col gap-4 max-w-md">
            <div className="bg-primary-light rounded-2xl p-6 shadow-lg text-lg font-medium text-primary border-l-4 border-primary">
              <span className="font-bold text-primary">Nouveau :</span> Naviguez horizontalement pour une expérience immersive !
            </div>
            <div className="bg-accent-light rounded-2xl p-6 shadow-lg text-lg font-medium text-accent border-l-4 border-accent">
              <span className="font-bold text-accent">Astuce :</span> Ajoutez vos preuves en un clic, tout est certifié et stocké de façon immuable.
            </div>
            {!isAuthenticated && (
              <div className="bg-yellow-100/80 rounded-2xl p-6 shadow-lg text-lg font-medium text-warning border-l-4 border-warning">
                <span className="font-bold text-warning">Bienvenue :</span> Créez votre compte pour commencer à certifier vos preuves et découvrir des biens exceptionnels !
              </div>
            )}
          </div>
        </div>
      </section>
    </ImmersiveLayout>
  );
};
