export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  process.env.VITE_API_BASE_URL ||
  (window?.location?.hostname === 'localhost' ? '' : '/');
// En dev: proxy Vite (''), en prod: variable d'env ou racine