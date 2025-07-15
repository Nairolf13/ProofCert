import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMultiversXAuth } from '../hooks/useMultiversXAuth';
import { useAuthContext } from '../hooks/AuthContext';
import { Button } from './Button';
import { WalletInfo } from './WalletInfo';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Tableau de bord', href: '/app/dashboard', icon: HomeIcon },
  { name: 'Propriétés', href: '/app/properties', icon: ClipboardDocumentListIcon },
  { name: 'Ajouter propriété', href: '/app/add-property', icon: PlusIcon },
  { name: 'Locations', href: '/app/rentals', icon: ClipboardDocumentListIcon },
  { name: 'Mes réservations', href: '/app/my-reservations', icon: CalendarDaysIcon },
  { name: 'Preuves', href: '/app/proofs', icon: ClipboardDocumentListIcon },
  { name: 'Profil', href: '/app/profile', icon: UserIcon },
];

export const Navbar: React.FC<{ onOpenWalletModal: () => void }> = ({ onOpenWalletModal }) => {
  const { user: web3User, isLoggedIn: isWeb3LoggedIn, logout: web3Logout } = useMultiversXAuth();
  const { user: classicUser, isAuthenticated: isClassicLoggedIn, disconnect: classicLogout } = useAuthContext();
  const location = useLocation();
<<<<<<< HEAD
  const [isWalletAdmin, setIsWalletAdmin] = useState(false);

  // Logs de débogage désactivés

  const isActive = (path: string) => location.pathname.startsWith(path);

  // Vérifier le statut admin du wallet
  useEffect(() => {
    let ignore = false;
    
    const checkAdminStatus = async () => {
      // Si l'utilisateur est déjà admin via l'authentification classique
      if (classicUser?.role === 'ADMIN') {
        if (!ignore) {
          setIsWalletAdmin(true);
        }
        return;
      }
      
      // Vérifier le statut admin du wallet si connecté
      if (isWeb3LoggedIn && (web3User?.walletAddress || web3User?.address)) {
        try {
          // Utiliser walletAddress ou address selon ce qui est disponible
          const walletAddress = web3User.walletAddress || web3User.address;
          // Vérifier d'abord si le rôle est déjà disponible dans web3User
          if (web3User.role === 'ADMIN') {
            if (!ignore) {
              setIsWalletAdmin(true);
            }
            return;
          }
          
          // Sinon, faire un appel API pour vérifier le rôle
          const { user, role } = await userApi.getByWallet(walletAddress);
          
          if (!ignore) {
            const walletIsAdmin = role === 'ADMIN' || user?.role === 'ADMIN' || web3User.role === 'ADMIN';
            setIsWalletAdmin(walletIsAdmin);
            
            // Mettre à jour le rôle dans web3User si nécessaire
            if (walletIsAdmin && web3User.role !== 'ADMIN') {
              // Mettre à jour le rôle dans le localStorage
              const userData = localStorage.getItem('user');
              if (userData) {
                const parsedUser = JSON.parse(userData);
                parsedUser.role = 'ADMIN';
                localStorage.setItem('user', JSON.stringify(parsedUser));
              }
            }
          }
        } catch (error) {
          console.error('Erreur lors de la vérification du statut admin:', error);
          if (!ignore) {
            setIsWalletAdmin(false);
          }
        }
      } else if (!ignore) {
        console.log('Pas de wallet connecté, réinitialisation du statut admin à false');
        setIsWalletAdmin(false);
      }
    };
    
    // Délai pour éviter les appels trop fréquents
    const timer = setTimeout(checkAdminStatus, 500);
    
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [classicUser, isWeb3LoggedIn, web3User]);
=======
  
  const isActive = (path: string) => location.pathname.startsWith(path);
  
  // Vérifier si l'utilisateur est administrateur
  const isAdmin = React.useMemo(() => {
    // Vérifier d'abord l'authentification classique
    if (isClassicLoggedIn && classicUser?.role === 'ADMIN') {
      console.log('🔑 Utilisateur administrateur (classique) détecté');
      return true;
    }
    
    // Ensuite vérifier l'authentification Web3
    if (isWeb3LoggedIn && web3User?.role === 'ADMIN') {
      console.log('🔑 Utilisateur administrateur (wallet) détecté');
      return true;
    }
    
    // Vérifier dans le localStorage pour le cas d'un rechargement de page
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const isAdmin = user?.role === 'ADMIN';
        console.log('📝 Vérification du rôle dans le localStorage:', { 
          hasUser: !!user, 
          userRole: user?.role,
          isAdmin 
        });
        return isAdmin;
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    } else {
      console.log('ℹ️ Aucun utilisateur trouvé dans le localStorage');
    }
    
    console.log('❌ Aucun administrateur détecté');
    return false;
  }, [isClassicLoggedIn, classicUser?.role, isWeb3LoggedIn, web3User?.role]);
>>>>>>> BranchClean

  // Déconnexion complète
  const handleLogout = async () => {
    try {
      // 1. Déconnexion Web3 si connecté
      if (isWeb3LoggedIn) {
        try {
          await web3Logout();
        } catch (error) {
          console.warn('Erreur lors de la déconnexion Web3:', error);
        }
        
        // Nettoyer manuellement les données WalletConnect
        const walletConnectKeys = [
          ...Object.keys(localStorage).filter(key => 
            key.startsWith('wc@2') || 
            key.startsWith('WALLETCONNECT') ||
            key.startsWith('walletconnect')
          ),
          ...Object.keys(sessionStorage).filter(key => 
            key.startsWith('wc@2') || 
            key.startsWith('WALLETCONNECT') ||
            key.startsWith('walletconnect')
          )
        ];
        
        walletConnectKeys.forEach(key => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });
      }
      
      // 2. Déconnexion classique si connecté
      if (isClassicLoggedIn) {
        try {
          await classicLogout();
        } catch (error) {
          console.warn('Erreur lors de la déconnexion classique:', error);
        }
      }
      
      // 3. Nettoyage complet
      localStorage.clear();
      sessionStorage.clear();
      
      // 4. Forcer un rechargement complet
      window.location.href = '/';
      window.location.reload();
    } catch (error) {
      console.error('Erreur critique lors de la déconnexion:', error);
      // En cas d'erreur, on force un nettoyage complet
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
      window.location.reload();
    }
  };

  // Affichage info utilisateur
  let userInfo = null;
  
  if (isClassicLoggedIn && classicUser) {
    userInfo = (
      <span className="text-xs text-secondary font-medium truncate max-w-[160px]" title={classicUser.email}>
        {classicUser.email}
      </span>
    );
  } else if (isWeb3LoggedIn && web3User) {
    userInfo = (
      <span 
        className="text-xs text-secondary font-medium truncate max-w-[160px]" 
        title={web3User.walletAddress || 'Adresse inconnue'}
      >
        {web3User.walletAddress ? `${web3User.walletAddress.slice(0, 6)}...${web3User.walletAddress.slice(-4)}` : ''}
      </span>
    );
  }

  return (
    <aside
      className="navbar-professional fixed inset-y-0 left-0 z-40 w-64 flex-col py-6 px-4 hidden md:flex"
    >
      <div className="flex items-center gap-2 mb-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-extrabold text-primary tracking-tight drop-shadow-sm">ProofEstate</span>
        </Link>
      </div>
      <nav className="flex-1 flex flex-col gap-2 w-full">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-base transition-all duration-150 w-full group
                ${isActive(item.href)
                  ? 'bg-primary-light text-primary shadow-md scale-105'
                  : 'text-secondary hover:bg-surface-secondary hover:text-primary'}
              `}
            >
              <Icon className={`w-6 h-6 ${isActive(item.href) ? 'text-primary' : 'text-secondary group-hover:text-primary'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
        {isAdmin && (
          <div className="mt-8">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Administration
            </h3>
            <nav className="mt-2 space-y-1">
              <Link
                to="/app/admin/proofs"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive('/app/admin') ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'
                }`}
              >
                <ArchiveBoxIcon className="w-6 h-6" />
                <span>Preuves archivées</span>
              </Link>
            </nav>
          </div>
        )}
      </nav>
      <div className="mt-auto flex flex-col gap-3 w-full">
        {/* Affichage wallet MultiversX (bouton modal) */}
        <WalletInfo onOpenWalletModal={onOpenWalletModal} />
        {/* Affichage info utilisateur + bouton déconnexion/connexion */}
        {userInfo && (
          <div className="flex items-center gap-2">
            {userInfo}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              leftIcon={<ArrowRightOnRectangleIcon className="w-5 h-5" />}
              className="w-full justify-start"
            >
              Déconnexion
            </Button>
          </div>
        )}
        {!isClassicLoggedIn && !isWeb3LoggedIn && (
          <Button size="sm" className="w-full justify-start" onClick={onOpenWalletModal}>
            Connecter Wallet
          </Button>
        )}
      </div>
    </aside>
  );
};
