// Utilitaire pour forcer la suppression des sessions WalletConnect V2 (localStorage + sessionStorage)
export function clearWalletConnectSessions() {
  // WalletConnect V2 utilise ces clés (à adapter si besoin)
  const keys = [
    'wc@2:client:0.3//session',
    'wc@2:client:0.3//expirer',
    'walletconnect',
    'walletconnect_v2',
    'walletconnect-session',
    'walletconnect-expirer',
    'WALLETCONNECT_DEEPLINK_CHOICE',
    'WALLETCONNECT_SELECTED_WALLET',
    'WALLETCONNECT_V2_SESSION',
    'WALLETCONNECT_V2_EXPIRE',
  ];
  keys.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  // Supprime tout ce qui commence par wc@
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('wc@')) localStorage.removeItem(key);
  });
  Object.keys(sessionStorage).forEach((key) => {
    if (key.startsWith('wc@')) sessionStorage.removeItem(key);
  });
  // Optionnel : forcer un reload
  window.location.reload();
}
