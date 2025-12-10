import { HardhatUserConfig, NetworksUserConfig } from "hardhat/config";

// Confiaremos APENAS nesta importação do toolbox.
// Ela carrega o 'hardhat-ethers' automaticamente.
import "@nomicfoundation/hardhat-toolbox-mocha-ethers"; 

import * as dotenv from "dotenv";
dotenv.config();

// --- Carregamento e Validação das Variáveis de Ambiente ---
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CESS_TESTNET_RPC_URL = process.env.CESS_TESTNET_RPC_URL;
const CESS_TESTNET_CHAIN_ID_STR = process.env.CESS_TESTNET_CHAIN_ID;

// Construímos o objeto de redes dinamicamente
const networks: NetworksUserConfig = {
  // A rede 'hardhat' (local) é configurada automaticamente
  // pelo 'hardhat-toolbox-mocha-ethers'
};

// --- Configuração Condicional da CESS Testnet ---
if (PRIVATE_KEY && CESS_TESTNET_RPC_URL && CESS_TESTNET_CHAIN_ID_STR) {
  networks.cessTestnet = {
    type: "http", 
    url: CESS_TESTNET_RPC_URL,
    chainId: parseInt(CESS_TESTNET_CHAIN_ID_STR),
    accounts: [PRIVATE_KEY],
  };
} else {
  console.warn(
    "AVISO: Configuração da CESS Testnet pulada. Verifique as variáveis no .env."
  );
}

// --- Configuração Principal do Hardhat ---
const config: HardhatUserConfig = {
  solidity: "0.8.20", 
  networks: networks,
  
  // (Opcional, mas mantido)
  etherscan: {
    apiKey: {
      cessTestnet: "ABC123_PLACEHOLDER_API_KEY", 
    },
    customChains: [
      {
        network: "cessTestnet",
        chainId: CESS_TESTNET_CHAIN_ID_STR ? parseInt(CESS_TESTNET_CHAIN_ID_STR) : 0,
        urls: {
          apiURL: "https://scan.cess.cloud/api",
          browserURL: "https://scan.cess.cloud/",
        },
      },
    ],
  },
};

export default config;
