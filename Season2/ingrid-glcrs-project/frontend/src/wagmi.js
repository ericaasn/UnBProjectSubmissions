import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// CESS Testnet chain definition
export const cessTestnet = {
  id: 11330,
  name: 'CESS Testnet',
  network: 'cess-testnet',
  nativeCurrency: {
    name: 'TCESS',
    symbol: 'TCESS',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.cess.network'],
    },
    public: {
      http: ['https://testnet-rpc.cess.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'CESS Explorer',
      url: 'https://testnet-scan.cess.network/',
    },
  },
  testnet: true,
}

export const config = createConfig({
  chains: [cessTestnet, mainnet, sepolia],
  connectors: [
    injected({
      target: 'metaMask',
    }),
  ],
  transports: {
    [cessTestnet.id]: http('https://testnet-rpc.cess.network'),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})