import { ethers } from "ethers";
import contractABI from "./TraceVaultABI.json";

const CONTRACT_ADDRESS = "0xC19691709FAc0394D92843D7eebd34d2ca7C044a"; 

//  rede Sepolia
async function switchToSepolia() {
  const sepoliaChainId = "0xaa36a7";

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: sepoliaChainId }],
    });
  } catch (error) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: sepoliaChainId,
            chainName: "Sepolia Test Network",
            rpcUrls: ["https://rpc.sepolia.org"],
            nativeCurrency: {
              name: "Sepolia ETH",
              symbol: "ETH",
              decimals: 18,
            },
            blockExplorerUrls: ["https://sepolia.etherscan.io"],
          },
        ],
      });
    } else {
      throw error;
    }
  }
}

export async function getContract() {
  if (!window.ethereum) throw new Error("MetaMask não encontrada");

  await switchToSepolia();
  await window.ethereum.request({ method: "eth_requestAccounts" });

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
}

// Registrar documento
export async function uploadDocument(hash, fileID) {
  const contract = await getContract();
  const tx = await contract.uploadDocument(hash, fileID);
  await tx.wait();
  return tx.hash;
}

//  Buscar lista de documentos de um usuário
export async function getUserDocuments() {
  const contract = await getContract();
  const signer = await contract.runner; 
  const address = await signer.getAddress();
  return await contract.getUserDocuments(address);
}

//  Consultar documento → registra evento DocumentAccessed
export async function accessDocument(hash) {
  const contract = await getContract();
  const tx = await contract.accessDocument(hash);
  await tx.wait();
  return tx.hash;
}

//  Transferir propriedade
export async function transferDocument(hash, newOwner) {
  const contract = await getContract();
  const tx = await contract.transferOwnership(hash, newOwner);
  await tx.wait();
  return tx.hash;
}
