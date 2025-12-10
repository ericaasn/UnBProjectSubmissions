// 1. Importa o Hardhat Runtime Environment (HRE)
import * as hre from "hardhat";

/**
 * Script de Deploy Clássico (V3/V4)
 * Este script depende do HRE, que agora está 
 * configurado corretamente no hardhat.config.ts.
 */
async function main() {
  // 2. Pega o "ethers" de dentro do HRE
  // (Isto agora vai funcionar)
  const ethers = hre.ethers;

  // 3. Pega o "signer" (carteira) que fará o deploy.
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  
  console.log(`Fazendo deploy do contrato com a conta: ${deployerAddress}`);

  // 4. Pega a "fábrica" do contrato
  const biblioChainFactory = await ethers.getContractFactory("BiblioChain");

  // 5. Inicia o deploy.
  const biblioChain = await biblioChainFactory.connect(deployer).deploy(deployerAddress);

  // 6. Aguarda o contrato ser "minado" (publicado) na blockchain
  await biblioChain.waitForDeployment();

  // 7. Pega o endereço final do contrato
  const contractAddress = await biblioChain.getAddress();

  console.log(`Contrato BiblioChain implantado com sucesso no endereço: ${contractAddress}`);
}

// Padrão de script assíncrono do Hardhat
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
