//Ingrid de S. Vieria 241008531
//gerenciador de listas de convidados para reuniões sociais -glcrs

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GLCRS {

    struct Convidado {
        address carteira;
        bool confirmado;
        uint valorPago;
        bool reembolsado;
    }

    struct Evento {
        address anfitriao;
        string nome;
        uint prazoConfirmacao; // timestamp absoluto (block.timestamp + duracao)
        uint taxaPresenca; // em wei
        bool cancelado;
        mapping(address => Convidado) convidados;
        address[] listaConvidados;
        bool exists;
        mapping(address => bool) presencasRegistradas; 
        mapping(address => bool) solicitacoesPendentes;
        address[] listaSolicitantes;
        
        bytes32 hashCriacao;      
        bytes32 hashFinalizacao;  
        bool encerrado;           
    }

    // armazenamento global de eventos e metadados legiveis
    mapping(bytes32 => Evento) private eventos;
    bytes32[] private chavesEventos;
    string[] private nomesEventos;

    mapping(address => uint) public saldoResgate;

    
    event EventoCriado(string nome, bytes32 chave, address anfitriao, uint prazoConfirmacao, uint taxaPresenca, bytes32 hashCriacao);
    event ConvidadoAdicionado(string nome, address convidado);
    event ConvidadoRemovido(string nome, address convidado);
    event PresencaConfirmada(string nome, address convidado);
    event PresencaCancelada(string nome, address convidado, uint valorReembolsado); 
    event AusenciaPenalizada(string nome, address convidado);
    event EventoCancelado(string nome, address anfitriao);
    event ReembolsoSolicitado(string nome, address solicitante, uint valor);
    event SaqueEfetuado(address beneficiario, uint valor);
    event SolicitacaoRecebida(string nome, address solicitante);
    event SolicitacaoAprovada(string nome, address solicitante);
    
   
    event EventoEncerrado(string nome, bytes32 hashFinalizacao, uint timestampEncerrado);

    modifier somenteAnfitriaoNome(string memory nome) {
        bytes32 chave = keccak256(abi.encodePacked(nome));
        require(eventos[chave].exists, "Evento inexistente");
        require(msg.sender == eventos[chave].anfitriao, "Apenas o anfitriao pode executar esta acao");
        _;
    }

    // criar evento - duracao em segundos + taxa em wei
    function criarEvento(string memory nome, uint duracaoSegundos, uint taxaPresenca) public {
        require(duracaoSegundos > 0, "Duracao deve ser maior que zero");
        
        
        bytes32 chave = keccak256(abi.encodePacked(nome));
        require(!eventos[chave].exists, "Evento com este nome ja existe");

        Evento storage novoEvento = eventos[chave];
        novoEvento.anfitriao = msg.sender;
        novoEvento.nome = nome;
        novoEvento.prazoConfirmacao = block.timestamp + duracaoSegundos;
        novoEvento.taxaPresenca = taxaPresenca;
        novoEvento.cancelado = false;
        novoEvento.exists = true;
        novoEvento.encerrado = false;

    //gera um hash para garantir que houve um evento criado 
        bytes32 _hashCriacao = keccak256(abi.encodePacked(nome, msg.sender, block.timestamp, taxaPresenca));
        novoEvento.hashCriacao = _hashCriacao;

        chavesEventos.push(chave);
        nomesEventos.push(nome);

        emit EventoCriado(nome, chave, msg.sender, novoEvento.prazoConfirmacao, taxaPresenca, _hashCriacao);
    }

    // adicionar convidados e remover (somente anfitriao)
    function adicionarConvidado(string memory nome, address carteiraConvidado) public somenteAnfitriaoNome(nome) {
        bytes32 chave = keccak256(abi.encodePacked(nome));
        Evento storage evento = eventos[chave];
        require(!evento.cancelado, "Evento cancelado");
        require(!evento.encerrado, "Evento ja encerrado");
        require(evento.convidados[carteiraConvidado].carteira == address(0), "Convidado ja adicionado");

        evento.convidados[carteiraConvidado] = Convidado(carteiraConvidado, false, 0, false);
        evento.listaConvidados.push(carteiraConvidado);
        emit ConvidadoAdicionado(nome, carteiraConvidado);
    }

    function removerConvidado(string memory nome, address carteiraConvidado) public somenteAnfitriaoNome(nome) {
        bytes32 chave = keccak256(abi.encodePacked(nome));
        Evento storage evento = eventos[chave];
        require(evento.exists, "Evento inexistente");
        require(!evento.cancelado, "Evento cancelado");
        require(!evento.encerrado, "Evento ja encerrado");
        require(evento.convidados[carteiraConvidado].carteira != address(0), "Convidado nao encontrado"); 
        require(!evento.convidados[carteiraConvidado].confirmado, "Nao pode remover convidado que ja confirmou presenca");

        // Remover do array listaConvidados
        address[] storage lista = evento.listaConvidados;
        for (uint i = 0; i < lista.length; i++) {
            if (lista[i] == carteiraConvidado) {
                lista[i] = lista[lista.length - 1];
                lista.pop(); 
                break;
            }
        }

        delete evento.convidados[carteiraConvidado];
        emit ConvidadoRemovido(nome, carteiraConvidado);
    }

      //O usuario pede para participar
    function solicitarEntrada(string memory nome) public {
        bytes32 chave = keccak256(abi.encodePacked(nome));
        Evento storage evento = eventos[chave];
        
        require(evento.exists, "Evento inexistente");
        require(!evento.cancelado, "Evento cancelado");
        require(!evento.encerrado, "Evento ja encerrado");
        require(block.timestamp <= evento.prazoConfirmacao, "Prazo de inscricao expirado");
        require(evento.convidados[msg.sender].carteira == address(0), "Voce ja esta na lista de convidados");
        require(!evento.solicitacoesPendentes[msg.sender], "Solicitacao ja enviada e pendente");

        evento.solicitacoesPendentes[msg.sender] = true;
        evento.listaSolicitantes.push(msg.sender);
        emit SolicitacaoRecebida(nome, msg.sender);
    }

    //O anfitriao analisa as solicitacoes
    function aprovarSolicitacao(string memory nome, address solicitante) public somenteAnfitriaoNome(nome) {
        bytes32 chave = keccak256(abi.encodePacked(nome));
        Evento storage evento = eventos[chave];

        require(evento.solicitacoesPendentes[solicitante], "Nenhuma solicitacao pendente para este endereco");
        require(evento.convidados[solicitante].carteira == address(0), "Usuario ja eh convidado");

        evento.convidados[solicitante] = Convidado(solicitante, false, 0, false);
        evento.listaConvidados.push(solicitante);

        evento.solicitacoesPendentes[solicitante] = false;
        
        address[] storage lista = evento.listaSolicitantes;
        for (uint i = 0; i < lista.length; i++) {
            if (lista[i] == solicitante) {
                lista[i] = lista[lista.length - 1];
                lista.pop();
                break;
            }
        }

        emit ConvidadoAdicionado(nome, solicitante);
        emit SolicitacaoAprovada(nome, solicitante);
    }

    // 
    function verSolicitacoes(string memory nome) public view returns (address[] memory) {
        bytes32 chave = keccak256(abi.encodePacked(nome));
        Evento storage evento = eventos[chave];
        require(evento.exists, "Evento inexistente");
        return evento.listaSolicitantes;
    }

    // confirmar presenca (payable: enviar taxaPresenca exata)
    function confirmarPresenca(string memory nome) public payable {
        bytes32 chave = keccak256(abi.encodePacked(nome));
        Evento storage evento = eventos[chave];
        require(evento.exists, "Evento inexistente");
        require(!evento.cancelado, "Evento cancelado");
        require(!evento.encerrado, "Evento ja encerrado");
        require(block.timestamp <= evento.prazoConfirmacao, "Prazo de confirmacao expirado");
        require(evento.convidados[msg.sender].carteira != address(0), "Voce nao esta na lista de convidados");
        require(!evento.convidados[msg.sender].confirmado, "Presenca ja confirmada");
        require(msg.value == evento.taxaPresenca, "Valor da taxa incorreto");

        evento.convidados[msg.sender].confirmado = true;
        evento.convidados[msg.sender].valorPago = msg.value;
        evento.convidados[msg.sender].reembolsado = false;

        emit PresencaConfirmada(nome, msg.sender);
    }

    // Pode cancelar dentro do prazo e pedir o reenbolso
    function cancelarPresenca(string memory nome) public {
        bytes32 chave = keccak256(abi.encodePacked(nome));
        Evento storage evento = eventos[chave];
        require(evento.exists, "Evento inexistente");
        require(!evento.cancelado, "Evento cancelado");
        require(!evento.encerrado, "Evento ja encerrado");
        require(block.timestamp <= evento.prazoConfirmacao, "Prazo de cancelamento expirado"); 
        
        Convidado storage c = evento.convidados[msg.sender];
        require(c.carteira != address(0), "Voce nao esta na lista de convidados");
        require(c.confirmado, "Sua presenca nao esta confirmada (taxa nao paga)");
        require(!c.reembolsado, "Reembolso ja processado");

        uint valor = c.valorPago;

        // verifiacoes para pedir reembolso apos o evento 
        c.confirmado = false;
        c.reembolsado = true; 
        c.valorPago = 0;

        saldoResgate[msg.sender] += valor;
        emit PresencaCancelada(nome, msg.sender, valor);
    }

    // No evento eh verificado ser o convidado realmente foi 
    function registrarPresenca(string memory nome, address convidado) public somenteAnfitriaoNome(nome) {
        bytes32 chave = keccak256(abi.encodePacked(nome));
        Evento storage evento = eventos[chave];
        require(!evento.cancelado, "Evento cancelado");
        require(evento.convidados[convidado].confirmado, "Convidado nao confirmou presenca");
        require(!evento.presencasRegistradas[convidado], "Presenca ja registrada");

        evento.presencasRegistradas[convidado] = true;
    }

    //solicitacao da devolucao da taxa apos comparecimento 
    function solicitarDevolucaoPorComparecimento(string memory nome) public {
        bytes32 chave = keccak256(abi.encodePacked(nome));
        Evento storage evento = eventos[chave];
        require(evento.exists, "Evento inexistente");
        require(!evento.cancelado, "Evento cancelado");

        Convidado storage c = evento.convidados[msg.sender];
        require(c.carteira != address(0), "Voce nao esta na lista de convidados");
        require(c.confirmado, "Presenca nao confirmada");
        require(!c.reembolsado, "Valor ja resgatado ou penalizado");
        require(evento.presencasRegistradas[msg.sender], "Presenca nao registrada pelo anfitriao");

        uint valor = c.valorPago;
        require(valor > 0, "Nenhum valor para resgatar");

        c.reembolsado = true;
        c.valorPago = 0;
        c.confirmado = false;

        saldoResgate[msg.sender] += valor;

        emit ReembolsoSolicitado(nome, msg.sender, valor);
    }
    
    // apos fazer as confimacoes ou penalizacoes -- encerre o evento 
    function encerrarEvento(string memory nome) public somenteAnfitriaoNome(nome) {
        bytes32 chave = keccak256(abi.encodePacked(nome));
        Evento storage evento = eventos[chave];
        require(evento.exists, "Evento inexistente");
        require(!evento.cancelado, "Evento cancelado");
        require(!evento.encerrado, "Evento ja encerrado");
        require(block.timestamp > evento.prazoConfirmacao, "Evento ainda em andamento");

        // Penalizar automaticamente quem não foi registrado
        for (uint i = 0; i < evento.listaConvidados.length; i++) {
            address addr = evento.listaConvidados[i];
            Convidado storage c = evento.convidados[addr];

            // Se confirmou, nao foi registrado como presente, e nao resgatou
            if (
                c.confirmado &&
                !evento.presencasRegistradas[addr] &&
                !c.reembolsado &&
                c.valorPago > 0
            ) {
                uint valor = c.valorPago;
                c.valorPago = 0;
                c.reembolsado = true;
                c.confirmado = false;

                saldoResgate[evento.anfitriao] += valor;

                emit AusenciaPenalizada(nome, addr);
            }
        }
        

        evento.encerrado = true;
        // Hash que prova quando foi encerrado e finaliza o evento
        bytes32 _hashFinalizacao = keccak256(abi.encodePacked(nome, block.timestamp, "EVENTO_FINALIZADO", evento.listaConvidados.length));
        evento.hashFinalizacao = _hashFinalizacao;
        
        emit EventoEncerrado(nome, _hashFinalizacao, block.timestamp);
    }

    // solicitar reembolso (convidado solicita se evento cancelado)
    function solicitarReembolso(string memory nome) public {
        bytes32 chave = keccak256(abi.encodePacked(nome));
        Evento storage evento = eventos[chave];
        require(evento.exists, "Evento inexistente");

        Convidado storage c = evento.convidados[msg.sender];
        require(c.carteira != address(0), "Voce nao esta na lista de convidados");
        require(!c.reembolsado, "Reembolso ja processado");
        uint valor = c.valorPago;
        require(valor > 0, "Nenhum valor para reembolsar");

        // O unico caso aqui eh se o evento foi cancelado pelo anfitriao
        require(evento.cancelado, "Reembolso so permitido se o evento for cancelado pelo anfitriao");
        
        c.reembolsado = true;
        c.valorPago = 0;
        c.confirmado = false; 
        saldoResgate[msg.sender] += valor;

        emit ReembolsoSolicitado(nome, msg.sender, valor);
    }

    // penalizar ausencia (somente anfitriao, ele recebe o valor no resgate)

    function penalizarAusencia(string memory nome, address convidado) public somenteAnfitriaoNome(nome) {
        bytes32 chave = keccak256(abi.encodePacked(nome));
        Evento storage evento = eventos[chave];
        require(!evento.cancelado, "Evento cancelado");
        require(evento.convidados[convidado].carteira != address(0), "Convidado nao existe");
        
        require(block.timestamp > evento.prazoConfirmacao, "A penalizacao so pode ocorrer apos o prazo de confirmacao");
        require(evento.convidados[convidado].confirmado, "Convidado nao confirmou presenca");
        require(!evento.convidados[convidado].reembolsado, "Penalizacao/reembolso ja processado");

        uint valor = evento.convidados[convidado].valorPago;
        require(valor > 0, "Nenhum valor para penalizar");

        evento.convidados[convidado].valorPago = 0;
        evento.convidados[convidado].reembolsado = true;
        evento.convidados[convidado].confirmado = false;
        saldoResgate[evento.anfitriao] += valor;

        emit AusenciaPenalizada(nome, convidado);
    }

    // cancelar evento (somente anfitriao)
function cancelarEvento(string memory nome) public somenteAnfitriaoNome(nome) {
    bytes32 chave = keccak256(abi.encodePacked(nome));
    Evento storage evento = eventos[chave];
    require(!evento.cancelado, "Evento ja cancelado");
    require(!evento.encerrado, "Nao pode cancelar evento ja encerrado");

    // marca como cancelado
    evento.cancelado = true;
    emit EventoCancelado(nome, msg.sender);

    // ENCERRA AUTOMATICAMENTE O EVENTO
    evento.encerrado = true;

    bytes32 _hashFinalizacao = keccak256(
        abi.encodePacked(nome, block.timestamp, "EVENTO_CANCELADO", evento.listaConvidados.length)
    );
    evento.hashFinalizacao = _hashFinalizacao;

    emit EventoEncerrado(nome, _hashFinalizacao, block.timestamp);
}


    // sacar (retirar saldoResgate)
    function sacar() public {
        uint valor = saldoResgate[msg.sender];
        require(valor > 0, "Nada para sacar");
        saldoResgate[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: valor}(""); 
        require(success, "Saque falhou");
        emit SaqueEfetuado(msg.sender, valor);
    }

    // ver dados basicos (todos podem ver)
    function verDadosBasicos(string memory nome) public view returns (
        address anfitriao,
        string memory nomeEvento,
        uint prazoConfirmacao,
        uint taxaPresenca,
        bool cancelado,
        uint qtdConvidados,
        bytes32 hashCriacao,
        bytes32 hashFinalizacao,
        bool encerrado
    ) {
        bytes32 chave = keccak256(abi.encodePacked(nome));
        Evento storage e = eventos[chave];
        require(e.exists, "Evento inexistente");
        return (
            e.anfitriao,
            e.nome,
            e.prazoConfirmacao,
            e.taxaPresenca,
            e.cancelado,
            e.listaConvidados.length,
            e.hashCriacao,
            e.hashFinalizacao,
            e.encerrado
        );
    }

    // listarEventos:
    function listarEventos() public view returns (string[] memory, bytes32[] memory) {
        return (nomesEventos, chavesEventos);
    }

    // listar convidados 
    function listarConvidados(string memory nome) public view returns (address[] memory) {
        bytes32 chave = keccak256(abi.encodePacked(nome));
        Evento storage evento = eventos[chave];
        require(evento.exists, "Evento inexistente");
        return evento.listaConvidados;
    }

    // presencas confirmadas
    function presencasConfirmadas(string memory nome) public view returns (address[] memory) {
        bytes32 chave = keccak256(abi.encodePacked(nome));
        Evento storage e = eventos[chave];
        require(e.exists, "Evento inexistente");

        uint count = 0;
        for (uint i = 0; i < e.listaConvidados.length; i++) {
            address addr = e.listaConvidados[i];
            if (e.convidados[addr].confirmado) {
                count++;
            }
        }

        address[] memory lista = new address[](count);
        uint idx = 0;
        for (uint i = 0; i < e.listaConvidados.length; i++) {
            address addr = e.listaConvidados[i];
            if (e.convidados[addr].confirmado) {
                lista[idx] = addr;
                idx++;
            }
        }

        return lista;
    }

    // valor pago por convidado (por nome do evento)
    function valorPagoPorConvidado(string memory nome, address convidado) public view returns (uint) {
        bytes32 chave = keccak256(abi.encodePacked(nome));
        Evento storage e = eventos[chave];
        require(e.exists, "Evento inexistente");
        return e.convidados[convidado].valorPago;
    }

    // valor total arrecadado no evento 
    function valorTotalArrecadadoNoEvento(string memory nome) public view returns (uint) {
        bytes32 chave = keccak256(abi.encodePacked(nome));
        Evento storage e = eventos[chave];
        require(e.exists, "Evento inexistente");

        uint total = 0;
        for (uint i = 0; i < e.listaConvidados.length; i++) {
            address addr = e.listaConvidados[i];
            total += e.convidados[addr].valorPago;
        }
        return total;
    }

    // prazoRestante: (0 se expirado)
    function prazoRestante(string memory nome) public view returns (uint) {
        bytes32 chave = keccak256(abi.encodePacked(nome));
        Evento storage e = eventos[chave];
        require(e.exists, "Evento inexistente");
        if (block.timestamp >= e.prazoConfirmacao) {
            return 0;
        } else {
            return e.prazoConfirmacao - block.timestamp;
        }
    }

    receive() external payable {}
}