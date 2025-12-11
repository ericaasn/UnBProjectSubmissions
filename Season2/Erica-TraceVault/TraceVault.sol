// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TraceVault {
    
    struct Document {
        address owner;         // Endereço do dono do documento
        string hash;           // Hash do arquivo (prova de existência)
        string fileId;         // ID do arquivo 
        uint256 timestamp;     // Data e hora do registro
    }

    // Mapeamento: busca informações do documento a partir do hash
    mapping(string => Document) public documents; 

    // Mapeamento: serve para saber quais documentos pertencem a um endereço
    mapping(address => string[]) public userDocuments;

    // Eventos
    event DocumentUploaded(address indexed owner, string hash, string fileId, uint256 timestamp);
    event DocumentAccessed(address indexed user, string hash, uint256 timestamp);
    event DocumentTransferred(address indexed from, address indexed to, string hash, uint256 timestamp);

    
    event DocumentDownloaded(address indexed user, string hash, uint256 timestamp);

    // Função para registrar novo documento
    function uploadDocument(string memory _hash, string memory _fileId) public { 
        require(bytes(documents[_hash].hash).length == 0, "Documento ja registrado");
        
        documents[_hash] = Document(msg.sender, _hash, _fileId, block.timestamp); 
        userDocuments[msg.sender].push(_hash);

        emit DocumentUploaded(msg.sender, _hash, _fileId, block.timestamp);
    }

    // Função para registrar um acesso (consulta)
    function accessDocument(string memory _hash) public {
        require(bytes(documents[_hash].hash).length != 0, "Documento nao encontrado");
        emit DocumentAccessed(msg.sender, _hash, block.timestamp); 
    }

    // Função para transferir a propriedade do documento
    function transferOwnership(string memory _hash, address _newOwner) public { 
        require(bytes(documents[_hash].hash).length != 0, "Documento nao encontrado");
        require(documents[_hash].owner == msg.sender, "Nao autorizado a transferir");
        
        documents[_hash].owner = _newOwner;
        userDocuments[_newOwner].push(_hash);

        emit DocumentTransferred(msg.sender, _newOwner, _hash, block.timestamp);
    }

    
    function downloadDocument(string memory _hash) public {
        require(bytes(documents[_hash].hash).length != 0, "Documento nao encontrado");
        emit DocumentDownloaded(msg.sender, _hash, block.timestamp);
    }

    // Função para ver todos documentos de um usuário
    function getUserDocuments(address _user) public view returns (string[] memory) {
        return userDocuments[_user];
    }
}
