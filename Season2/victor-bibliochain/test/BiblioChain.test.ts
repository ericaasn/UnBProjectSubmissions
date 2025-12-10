// Importa as ferramentas necessárias
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-mocha-ethers/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import type { Signer } from "ethers";
import type { BiblioChain } from "../typechain-types"; // Tipagem gerada pelo Hardhat

// Descreve o conjunto de testes para o nosso contrato
describe("BiblioChain", function () {
  // Variáveis que usaremos nos testes
  let biblioChain: BiblioChain;
  let owner: Signer; // O bibliotecário (Admin)
  let aluno1: Signer; // Um usuário
  let aluno2: Signer; // Outro usuário

  // 'Fixture' é uma função que configura o estado inicial da blockchain (local)
  // Isso é executado uma vez antes de todos os testes
  async function deployBiblioChainFixture() {
    // Pega as carteiras de teste (simuladas) do Hardhat
    const [ownerSigner, aluno1Signer, aluno2Signer] = await ethers.getSigners();

    // Endereço do dono (bibliotecário)
    const ownerAddress = await ownerSigner.getAddress();

    // Faz o deploy do contrato
    const biblioChainFactory = await ethers.getContractFactory("BiblioChain");
    const contract = (await biblioChainFactory.connect(ownerSigner).deploy(ownerAddress)) as BiblioChain;

    // Aguarda a implantação
    await contract.waitForDeployment();

    // Retorna os objetos que os testes usarão
    return { contract, ownerSigner, aluno1Signer, aluno2Signer };
  }

  // Bloco 'beforeEach' é executado antes de CADA teste ('it')
  beforeEach(async function () {
    // Carrega o estado inicial (Fixture)
    const { contract, ownerSigner, aluno1Signer, aluno2Signer } = await loadFixture(
      deployBiblioChainFixture
    );

    // Define as variáveis globais do teste
    biblioChain = contract;
    owner = ownerSigner;
    aluno1 = aluno1Signer;
    aluno2 = aluno2Signer;
  });

  // --- Nossos Testes ---

  it("Deve permitir ao Owner (Bibliotecário) mintar um novo livro", async function () {
    const aluno1Address = await aluno1.getAddress();
    
    // Testa a função mintarLivro
    // "ipfs://metadata_livro_1" é um placeholder para os metadados
    await expect(biblioChain.connect(owner).mintarLivro("ipfs://metadata_livro_1"))
      .to.emit(biblioChain, "Transfer") // ERC721 emite "Transfer"
      .withArgs(ethers.ZeroAddress, await owner.getAddress(), 1); // De 0x0 para o Owner, ID 1

    // Verifica se o Token ID 1 agora existe e pertence ao Owner
    expect(await biblioChain.ownerOf(1)).to.equal(await owner.getAddress());
  });

  it("Não deve permitir que um usuário (Aluno) minte um livro", async function () {
    // Tenta mintar usando a carteira 'aluno1'
    // Esperamos que a transação seja "revertida" (falhe)
    // "O ownable" é o erro padrão do 'onlyOwner' do OpenZeppelin
    await expect(
      biblioChain.connect(aluno1).mintarLivro("ipfs://metadata_livro_2")
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Deve permitir ao Owner emprestar um livro não emprestado", async function () {
    const aluno1Address = await aluno1.getAddress();

    // 1. Mintar o livro
    await biblioChain.connect(owner).mintarLivro("ipfs://metadata_livro_1"); // Token ID 1
    const tokenId = 1;
    const diasEmprestimo = 7;

    // 2. Emprestar o livro
    // Esperamos que o evento 'LivroEmprestado' seja emitido
    await expect(
      biblioChain.connect(owner).emprestarLivro(tokenId, aluno1Address, diasEmprestimo)
    ).to.emit(biblioChain, "LivroEmprestado");

    // 3. Verificar o status
    const status = await biblioChain.statusEmprestimo(tokenId);
    expect(status.usuario).to.equal(aluno1Address);
    expect(status.prazoDevolucao).to.be.above(0); // Verifica se o prazo foi definido
  });

  it("Não deve permitir emprestar um livro que já está emprestado", async function () {
    const aluno1Address = await aluno1.getAddress();
    const aluno2Address = await aluno2.getAddress();

    // 1. Mintar
    await biblioChain.connect(owner).mintarLivro("ipfs://metadata_livro_1"); // Token ID 1
    const tokenId = 1;

    // 2. Emprestar para Aluno 1
    await biblioChain.connect(owner).emprestarLivro(tokenId, aluno1Address, 7);

    // 3. Tentar emprestar para Aluno 2 (deve falhar)
    await expect(
      biblioChain.connect(owner).emprestarLivro(tokenId, aluno2Address, 7)
    ).to.be.revertedWith("BiblioChain: Livro ja esta emprestado.");
  });
  
  it("Deve permitir a devolução e limpar o status do empréstimo", async function () {
    const aluno1Address = await aluno1.getAddress();
    const tokenId = 1;
    
    // 1. Mintar e Emprestar
    await biblioChain.connect(owner).mintarLivro("ipfs://metadata_livro_1");
    await biblioChain.connect(owner).emprestarLivro(tokenId, aluno1Address, 7);
    
    // 2. Devolver o livro
    await expect(
      biblioChain.connect(owner).devolverLivro(tokenId)
    ).to.emit(biblioChain, "LivroDevolvido")
     .withArgs(tokenId, aluno1Address, false); // false = sem atraso

    // 3. Verificar se o status foi limpo
    const status = await biblioChain.statusEmprestimo(tokenId);
    expect(status.usuario).to.equal(ethers.ZeroAddress); // Deve voltar ao endereço 0
    expect(status.prazoDevolucao).to.equal(0);
  });
});
