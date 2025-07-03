import React from 'react';
import { ImmersiveLayout } from '../components/ImmersiveLayout';
import { Button } from '../components/Button';
import { useMultiversXAuth } from '../hooks/useMultiversXAuth';
import { Link } from 'react-router-dom';
import { 
  ShieldCheckIcon, 
  CubeTransparentIcon, 
  ClockIcon, 
  GlobeAltIcon,
  BuildingOffice2Icon,
  HeartIcon,
  ChartBarIcon,
  LockClosedIcon,
  CheckBadgeIcon,
  ArrowRightIcon,
  UserIcon,
  HomeIcon,
  
} from '@heroicons/react/24/outline';

export const HomePage: React.FC = () => {
  const { isLoggedIn } = useMultiversXAuth();

  // Redirect to dashboard if authenticated
  
  return (
    <ImmersiveLayout>
      <div className="w-full max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center py-20 px-4">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 -z-10 rounded-3xl"></div>
          
          <div className="text-center space-y-8 max-w-4xl">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-tight">
                ProofEstate
              </h1>
              <p className="text-2xl md:text-3xl font-medium text-gray-700 max-w-3xl mx-auto leading-relaxed">
                La plateforme de <span className="text-blue-600 font-semibold">location immobilière</span> avec certification des états des lieux
              </p>
            </div>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Réservez des logements, documentez l'état des biens avec des preuves certifiées et évitez les conflits grâce à notre technologie blockchain.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
              {isLoggedIn ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 no-underline"
                  >
                    Accéder au tableau de bord
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    to="/dashboard" 
                    className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 no-underline"
                  >
                    Voir les locations
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/auth?mode=register" 
                    className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 no-underline"
                  >
                    Commencer gratuitement
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    to="/auth?mode=login" 
                    className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 no-underline"
                  >
                    Se connecter
                  </Link>
                </>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckBadgeIcon className="w-5 h-5 text-green-500" />
                <span>100% Sécurisé</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-blue-500" />
                <span>Blockchain Certifiée</span>
              </div>
              <div className="flex items-center gap-2">
                <GlobeAltIcon className="w-5 h-5 text-purple-500" />
                <span>International</span>
              </div>
            </div>
            
            {/* Hero Illustration */}
            <div className="mt-16 max-w-2xl mx-auto">
              <img 
                src="/hero-illustration.svg" 
                alt="ProofEstate - Certification immobilière blockchain" 
                className="w-full h-auto opacity-80 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Pourquoi choisir ProofEstate ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une plateforme révolutionnaire qui transforme la location immobilière en éliminant les conflits grâce à la certification blockchain.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">États des Lieux Certifiés</h3>
              <p className="text-gray-600 leading-relaxed">
                Chaque preuve d'état des lieux est cryptographiquement sécurisée et horodatée sur la blockchain, garantissant une authenticité inviolable pour éviter tout conflit.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BuildingOffice2Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Logements Vérifiés</h3>
              <p className="text-gray-600 leading-relaxed">
                Accédez à un catalogue de logements soigneusement sélectionnés et vérifiés par nos propriétaires partenaires de confiance.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <HeartIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Favoris Intelligents</h3>
              <p className="text-gray-600 leading-relaxed">
                Sauvegardez et organisez vos logements préférés avec notre système de favoris intelligent qui apprend de vos préférences.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ClockIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Historique Complet</h3>
              <p className="text-gray-600 leading-relaxed">
                Consultez l'historique complet de chaque logement et réservation, stocké de manière permanente et transparente.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CubeTransparentIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Transparence Totale</h3>
              <p className="text-gray-600 leading-relaxed">
                Toutes les informations sont vérifiables publiquement grâce à notre système décentralisé, éliminant les intermédiaires.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ChartBarIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Résolution de Conflits</h3>
              <p className="text-gray-600 leading-relaxed">
                Éliminez les disputes liées à l'état des lieux grâce à nos preuves certifiées et notre système de médiation intégré.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Avantages pour tous
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez comment ProofEstate peut simplifier et sécuriser votre expérience locative.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Pour les Locataires */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-100">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">Pour les Locataires</h3>
                  <p className="text-blue-600">Protégez vos droits et simplifiez vos démarches</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-gray-600">
                    <strong>Récupération de caution facilitée</strong> : États des lieux certifiés blockchain pour éviter les contestations
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-gray-600">
                    <strong>Transparence totale</strong> : Historique complet et vérifiable de chaque propriété
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-gray-600">
                    <strong>Processus simplifié</strong> : Réservation en ligne sécurisée avec documentation automatique
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-gray-600">
                    <strong>Protection juridique</strong> : Preuves incontestables en cas de litige
                  </p>
                </div>
              </div>
            </div>

            {/* Pour les Propriétaires */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-3xl border border-green-100">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <HomeIcon className="w-8 h-8 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">Pour les Propriétaires</h3>
                  <p className="text-green-600">Gérez vos biens en toute sérénité</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-gray-600">
                    <strong>Réduction des conflits</strong> : Documentation automatique qui élimine 90% des disputes
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-gray-600">
                    <strong>Gestion facilitée</strong> : Tableau de bord centralisé pour tous vos biens
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-gray-600">
                    <strong>Valorisation du patrimoine</strong> : Historique transparent qui rassure les futurs locataires
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-gray-600">
                    <strong>Économies de temps</strong> : Automatisation des tâches administratives répétitives
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Call-to-action en bas de la section */}
          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-3xl text-white max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Prêt à révolutionner votre expérience locative ?</h3>
              <p className="text-blue-100 mb-6">
                Rejoignez la plateforme qui met la technologie blockchain au service de l'immobilier locatif.
              </p>
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                Commencer maintenant
              </Button>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="py-20 px-4 bg-gray-50 rounded-3xl mx-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Technologie de pointe
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              ProofEstate s'appuie sur les technologies les plus avancées pour vous offrir une expérience immobilière révolutionnaire.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto">
                <LockClosedIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Blockchain</h3>
              <p className="text-gray-600">Sécurité et transparence garanties</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mx-auto">
                <CubeTransparentIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Smart Contracts</h3>
              <p className="text-gray-600">Automatisation des transactions</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mx-auto">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Cryptographie</h3>
              <p className="text-gray-600">Chiffrement de niveau militaire</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center mx-auto">
                <GlobeAltIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">IPFS</h3>
              <p className="text-gray-600">Stockage décentralisé permanent</p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Comment ça fonctionne ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Un processus simple et sécurisé en quelques étapes pour réserver un logement et certifier l'état des lieux.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Trouvez votre logement</h3>
              <p className="text-gray-600 leading-relaxed">
                Parcourez notre sélection de logements vérifiés et réservez celui qui vous convient en quelques clics.
              </p>
            </div>
            
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Documentez l'état des lieux</h3>
              <p className="text-gray-600 leading-relaxed">
                Prenez des photos et créez des preuves certifiées de l'état du logement à l'entrée et à la sortie.
              </p>
            </div>
            
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Profitez en toute sérénité</h3>
              <p className="text-gray-600 leading-relaxed">
                Vivez votre location l'esprit tranquille, vos preuves sont sécurisées et incontestables.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!isLoggedIn && (
          <section className="py-20 px-4">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-700 rounded-3xl p-12 text-center shadow-2xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Prêt à révolutionner votre approche immobilière ?
              </h2>
              <p className="text-xl text-blue-50 mb-8 max-w-2xl mx-auto leading-relaxed">
                Rejoignez les utilisateurs qui font confiance à ProofEstate pour sécuriser leurs locations et éviter les conflits.
              </p>
              <div className="flex justify-center">
                <Link 
                  to="/auth?mode=register" 
                  className="bg-white text-indigo-700 px-8 py-4 rounded-2xl text-lg font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Commencer maintenant
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </ImmersiveLayout>
  );
};
