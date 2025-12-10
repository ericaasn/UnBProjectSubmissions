export const contractAddress = "0xACa8EfDAb0AF8F74cA12dB1015063B066585F4FE";
export const RPC_URL = "https://testnet-rpc.cess.network/ws/";
export const CHAIN_ID = 11330;

export const contractABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "nome",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "convidado",
				"type": "address"
			}
		],
		"name": "AusenciaPenalizada",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "nome",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "convidado",
				"type": "address"
			}
		],
		"name": "ConvidadoAdicionado",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "nome",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "convidado",
				"type": "address"
			}
		],
		"name": "ConvidadoRemovido",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "nome",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "anfitriao",
				"type": "address"
			}
		],
		"name": "EventoCancelado",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "nome",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "chave",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "anfitriao",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "prazoConfirmacao",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "taxaPresenca",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "hashCriacao",
				"type": "bytes32"
			}
		],
		"name": "EventoCriado",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "nome",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "hashFinalizacao",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestampEncerrado",
				"type": "uint256"
			}
		],
		"name": "EventoEncerrado",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "nome",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "convidado",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "valorReembolsado",
				"type": "uint256"
			}
		],
		"name": "PresencaCancelada",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "nome",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "convidado",
				"type": "address"
			}
		],
		"name": "PresencaConfirmada",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "nome",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "solicitante",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "valor",
				"type": "uint256"
			}
		],
		"name": "ReembolsoSolicitado",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "beneficiario",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "valor",
				"type": "uint256"
			}
		],
		"name": "SaqueEfetuado",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "nome",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "solicitante",
				"type": "address"
			}
		],
		"name": "SolicitacaoAprovada",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "nome",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "solicitante",
				"type": "address"
			}
		],
		"name": "SolicitacaoRecebida",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "nome",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "carteiraConvidado",
				"type": "address"
			}
		],
		"name": "adicionarConvidado",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "nome",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "solicitante",
				"type": "address"
			}
		],
		"name": "aprovarSolicitacao",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "nome",
				"type": "string"
			}
		],
		"name": "cancelarEvento",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "nome",
				"type": "string"
			}
		],
		"name": "cancelarPresenca",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "nome",
				"type": "string"
			}
		],
		"name": "confirmarPresenca",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "nome",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "duracaoSegundos",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "taxaPresenca",
				"type": "uint256"
			}
		],
		"name": "criarEvento",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "nome",
				"type": "string"
			}
		],
		"name": "encerrarEvento",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "nome",
				"type": "string"
			}
		],
		"name": "listarConvidados",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "listarEventos",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
			},
			{
				"internalType": "bytes32[]",
				"name": "",
				"type": "bytes32[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "nome",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "convidado",
				"type": "address"
			}
		],
		"name": "penalizarAusencia",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "nome",
				"type": "string"
			}
		],
		"name": "prazoRestante",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "nome",
				"type": "string"
			}
		],
		"name": "presencasConfirmadas",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "nome",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "convidado",
				"type": "address"
			}
		],
		"name": "registrarPresenca",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "nome",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "carteiraConvidado",
				"type": "address"
			}
		],
		"name": "removerConvidado",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "sacar",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "saldoResgate",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "nome",
				"type": "string"
			}
		],
		"name": "solicitarDevolucaoPorComparecimento",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "nome",
				"type": "string"
			}
		],
		"name": "solicitarEntrada",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "nome",
				"type": "string"
			}
		],
		"name": "solicitarReembolso",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "nome",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "convidado",
				"type": "address"
			}
		],
		"name": "valorPagoPorConvidado",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "nome",
				"type": "string"
			}
		],
		"name": "valorTotalArrecadadoNoEvento",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "nome",
				"type": "string"
			}
		],
		"name": "verDadosBasicos",
		"outputs": [
			{
				"internalType": "address",
				"name": "anfitriao",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "nomeEvento",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "prazoConfirmacao",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "taxaPresenca",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "cancelado",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "qtdConvidados",
				"type": "uint256"
			},
			{
				"internalType": "bytes32",
				"name": "hashCriacao",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "hashFinalizacao",
				"type": "bytes32"
			},
			{
				"internalType": "bool",
				"name": "encerrado",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "nome",
				"type": "string"
			}
		],
		"name": "verSolicitacoes",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	}
]
