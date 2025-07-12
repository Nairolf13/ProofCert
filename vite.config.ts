import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      buffer: 'buffer',
      process: 'process/browser',
      stream: 'stream-browserify',
      util: 'util',
      crypto: 'crypto-browserify',
    }
  },
  define: {
    'process.env': {},
    'process.browser': 'true',
    global: 'globalThis',
  },
  optimizeDeps: {
    include: [
      'buffer',
      'process',
      'stream-browserify',
      'util',
      'crypto-browserify',
    ],
    exclude: ['unenv'],
    force: true,
    esbuildOptions: {
      define: {
        global: 'globalThis',
        module: '{}'
      }
    }
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return;
        }
        warn(warning);
      }
    }
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      // Redirige toutes les requêtes commençant par /api vers le serveur backend
      '/api': {
        target: 'http://localhost:3001', // Port du serveur backend
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
  },
  preview: {
    host: true,
    port: 3000
  }
});
