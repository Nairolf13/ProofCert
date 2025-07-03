import { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MultiversXProvider } from './providers/MultiversXProvider';
import AppRouter from './router';
import { WalletConnectionModal } from './components/WalletConnectionModal';

function App() {
  const [showWalletModal, setShowWalletModal] = useState(false);

  return (
    <Router>
      <MultiversXProvider>
        <div className="min-h-screen bg-app-background flex">
          <AppRouter onOpenWalletModal={() => setShowWalletModal(true)} />
        </div>
        {/* Portal pour la modal au centre de toute la page */}
        {showWalletModal && (
          <div id="wallet-modal-portal" className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 pointer-events-auto">
            <WalletConnectionModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} />
          </div>
        )}
      </MultiversXProvider>
    </Router>
  );
}

export default App;
