import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { WagmiConfig } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './wagmi.js'

// Import do Buffer diretamente
import { Buffer } from 'buffer'

// Polyfills para compatibilidade
if (typeof window !== 'undefined') {
  // Configurar Buffer
  if (typeof window.Buffer === 'undefined') {
    window.Buffer = Buffer
  }
  
  // Configurar global
  if (typeof window.global === 'undefined') {
    window.global = window
  }
  
  // Configurar process
  if (typeof window.process === 'undefined') {
    window.process = { 
      env: {}, 
      browser: true, 
      version: '',
      nextTick: (fn) => setTimeout(fn, 0)
    }
  }
}

// Criar cliente do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiConfig>
  </React.StrictMode>
)