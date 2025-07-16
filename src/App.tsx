import { AuthProvider } from './hooks/AuthProvider';
import { MultiversXProvider } from './MultiversXAuth/providers/MultiversXProvider';
import { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRouter from './router';
import { ModalConnectWallet } from './components/ModalConnectWallet';

function App() {
  const [showWalletModal, setShowWalletModal] = useState(false);

  return (
    <Router>
      <AuthProvider>
        <MultiversXProvider>
          <div className="min-h-screen bg-app-background flex">
            <AppRouter onOpenWalletModal={() => setShowWalletModal(true)} />
          </div>
          <ModalConnectWallet isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} />
        </MultiversXProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
