import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Enable polyfills for specific globals and modules
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Enable polyfills for specific Node.js modules
      protocolImports: true,
    })
  ],
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
      stream: 'stream-browserify',
      util: 'util',
    }
  },
  define: {
    'process.env': {},
    'process.version': '"v18.0.0"',
    'process.versions': '{ node: "18.0.0" }',
    'process.browser': 'true',
    'process.platform': '"browser"',
    global: 'globalThis',
    module: '{}',
  },
  optimizeDeps: {
    include: [
      'buffer',
      'process',
      'stream-browserify',
      'util',
      'protobufjs/minimal',
      'protobufjs'
    ],
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
    }
  },
  server: {
    host: true,
    port: 5173
  },
  preview: {
    host: true,
    port: 5173
  }
})
