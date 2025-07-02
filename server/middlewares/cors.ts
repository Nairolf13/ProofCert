import cors from 'cors';

export const corsMiddleware = cors({
  origin: function (origin, callback) {
    // Permettre les requêtes sans origin (ex: applications mobiles)
    if (!origin) return callback(null, true);
    
    // Permettre localhost et toutes les adresses IP sur les ports de développement
    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
      'http://localhost:5175',
      'http://127.0.0.1:5175'
    ];
    
    // Permettre toutes les adresses IP privées sur les ports de développement
    const ipRegex = /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+):(5173|5174|5175)$/;
    
    if (allowedOrigins.includes(origin) || ipRegex.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
});
