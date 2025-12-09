import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  resolve: {
    alias: {
      // Resolver polyfills
      buffer: 'buffer/',
      stream: 'stream-browserify',
      util: 'util/',
      events: 'events/',
      process: 'process/browser.js',
    }
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      '@tanstack/react-query',
      'ethers',
      'wagmi',
      'viem',
      'buffer',
      'stream-browserify',
      'util',
      'events',
      'process'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      target: 'es2020',
    }
  },
  build: {
    target: 'es2020',
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/]
    }
  }
})