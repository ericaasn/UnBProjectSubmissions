/**
 * PLANO D: Script de Deploy "Sem Mágica"
 *
 * Este script ignora completamente o 'hre' (Hardhat Runtime Environment)
 * e usa o Ethers.js puro para fazer o deploy.
 */

// 1. Importa o Ethers.js DIRETAMENTE do pacote
import { ethers } from "ethers";

// 2. Importa o "artefato" (ABI e Bytecode) do contrato
// Este arquivo foi criado quando você rodou 'npx hardhat compile' com sucesso
import BiblioChainArtifact from "../artifacts/contracts/BiblioChain.sol/BiblioChain.json";

// --- Configuração Manual (O que o 'hre' deveria fazer) ---

// O Hardhat (quando você roda 'run --network hardhat') 
// cria um nó local nesta URL
const HARDHAT_NODE_URL = "http://127.0.0.1:8545";

// A PRIMEIRA conta de teste que o Hardhat cria tem ESTA chave privada.
// É um valor padrão, conhecido e seguro para testes locais.
const HARDHAT_TEST_PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

async function main() {
  console.log("Iniciando o deploy 'Sem Mágica' (Plano D)...");

  // 1. Conecta-se ao nó local do Hardhat
  const provider = new ethers.JsonRpcProvider(HARDHAT_NODE_URL);

  // 2. Cria a carteira (signer) usando a chave privada de teste
  const deployer = new ethers.Wallet(HARDHAT_TEST_PRIVATE_KEY, provider);
  const deployerAddress = await deployer.getAddress();

  console.log(`Fazendo deploy do contrato com a conta: ${deployerAddress}`);

  // 3. Pega o ABI e o Bytecode do JSON importado
  const abi = BiblioChainArtifact.abi;
  const bytecode = BiblioChainArtifact.bytecode;

  // 4. Cria a "Fábrica" do Contrato
  const biblioChainFactory = new ethers.ContractFactory(abi, bytecode, deployer);

  // 5. Inicia o deploy.
  // Passamos o 'deployerAddress' para o constructor(address initialOwner)
  const biblioChain = await biblioChainFactory.deploy(deployerAddress);

  // 6. Aguarda o contrato ser "minado"
  await biblioChain.waitForDeployment();

  // 7. Pega o endereço final do contrato
  const contractAddress = await biblioChain.getAddress();

  console.log(`Contrato BiblioChain implantado com sucesso no endereço: ${contractAddress}`);
}

// Executa o script
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
