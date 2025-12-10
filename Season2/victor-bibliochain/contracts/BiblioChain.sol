// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BiblioChain is ERC721, ERC721URIStorage, Ownable {
    uint256 public tokenIdCounter;

    // --- CADASTRO: Matrícula -> Carteira ---
    mapping(string => address) public alunos; 
    
    struct Emprestimo {
        address usuario;
        uint256 prazoDevolucao;
    }
    mapping(uint256 => Emprestimo) public statusEmprestimo;
    mapping(address => bool) public usuarioPenalizado;

    event AlunoRegistrado(string matricula, address wallet);
    event LivroEmprestado(uint256 indexed tokenId, string matricula, address indexed usuario, uint256 prazo);
    event LivroDevolvido(uint256 indexed tokenId, address indexed usuario, bool comAtraso);
    event PenalidadeAplicada(address indexed usuario);
    event PenalidadeRemovida(address indexed usuario);

    constructor(address initialOwner) ERC721("BiblioChain", "BIBLIO") Ownable(initialOwner) {}

    // --- FUNÇÃO: Aluno se cadastra ---
    function registrarAluno(string memory _matricula) public {
        require(alunos[_matricula] == address(0), "Matricula ja registrada!");
        alunos[_matricula] = msg.sender;
        emit AlunoRegistrado(_matricula, msg.sender);
    }

    function mintarLivro(string memory tokenURI_) public onlyOwner returns (uint256) {
        tokenIdCounter++;
        uint256 novoTokenId = tokenIdCounter;
        _safeMint(owner(), novoTokenId);
        _setTokenURI(novoTokenId, tokenURI_);
        return novoTokenId;
    }

    // --- FUNÇÃO: Empréstimo via Matrícula ---
    function emprestarLivro(uint256 tokenId, string memory _matricula, uint256 diasDeEmprestimo) public onlyOwner {
        address usuario = alunos[_matricula]; // Busca o endereço pela matrícula
        
        require(usuario != address(0), "Erro: Aluno nao registrado! Peca para ele se cadastrar.");
        require(ownerOf(tokenId) == owner(), "Livro nao esta na biblioteca.");
        require(!usuarioPenalizado[usuario], "Usuario penalizado.");

        uint256 prazo = block.timestamp + (diasDeEmprestimo * 1 days);
        
        _transfer(owner(), usuario, tokenId);
        
        statusEmprestimo[tokenId] = Emprestimo(usuario, prazo);
        emit LivroEmprestado(tokenId, _matricula, usuario, prazo);
    }

    function devolverLivro(uint256 tokenId) public onlyOwner {
        address usuario = statusEmprestimo[tokenId].usuario;
        require(ownerOf(tokenId) == usuario, "Livro nao esta com este usuario");

        _transfer(usuario, owner(), tokenId);

        bool comAtraso = false;
        if (block.timestamp > statusEmprestimo[tokenId].prazoDevolucao) {
            usuarioPenalizado[usuario] = true;
            comAtraso = true;
            emit PenalidadeAplicada(usuario);
        }
        delete statusEmprestimo[tokenId];
        emit LivroDevolvido(tokenId, usuario, comAtraso);
    }

    function removerPenalidade(address usuario) public onlyOwner {
        usuarioPenalizado[usuario] = false;
        emit PenalidadeRemovida(usuario);
    }

    // Overrides
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}