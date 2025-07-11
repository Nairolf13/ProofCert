import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initWalletConnect } from './MultiversXAuth/utils/initWalletConnect'
import './index.css'
import App from './App.tsx'

// Initialiser le nettoyage de WalletConnect au démarrage
initWalletConnect();

// Gestion des erreurs non capturées
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
