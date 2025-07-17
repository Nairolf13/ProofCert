import { AuthProvider } from './hooks/AuthProvider';
import { MultiversXProvider } from './MultiversXAuth/providers/MultiversXProvider';
import { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRouter from './router';
import { ModalConnectWallet } from './components/ModalConnectWallet';
import { initWalletConnect } from './MultiversXAuth/utils/initWalletConnect';

// Initialiser WalletConnect
initWalletConnect();

function App() {
  const [showWalletModal, setShowWalletModal] = useState(false);

  return (
    <Router>
      <MultiversXProvider>
        <AuthProvider>
          <div className="min-h-screen bg-app-background flex">
            <AppRouter onOpenWalletModal={() => setShowWalletModal(true)} />
          </div>
          <ModalConnectWallet isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} />
        </AuthProvider>
      </MultiversXProvider>
    </Router>
  );
}

export default App;
