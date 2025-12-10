Português (BR)

GLCRS - Gerenciador de Listas de Convidados para Reuniões Sociais

Sobre o Projeto:
O GLCRS é uma aplicação descentralizada (dApp) desenvolvida para criação e gerenciamento de listas de convidados em reuniões sociais utilizando blockchain. A plataforma permite que anfitriões criem eventos como festas comemorativas, palestras acadêmicas e confraternizações, gerenciando convites e confirmações de presença de forma transparente e segura na rede CESS.


Resumo: 
O projeto resolve problemas comuns na organização de eventos: nomes duplicados, dificuldades nas confirmações de presença e risco de perda de informações em sistemas centralizados. Utilizando a CESS Network, oferecemos descentralização, privacidade e transparência, proporcionando maior conforto aos anfitriões e facilidade aos convidados para confirmar presença de forma segura.

Motivação e Justificativa:
Organizar eventos geralmente gera dores de cabeça no gerenciamento de listas de convidados. Sistemas tradicionais apresentam problemas como:

	-Dificuldade nas confirmações de presença
	-Risco de perda de informações
	-Falta de transparência nos registros
	-Possibilidade de fraudes ou alterações indevidas


A CESS Network, com sua infraestrutura blockchain, oferece:
	-Descentralização: Elimina custos com servidores centralizados
	-Imutabilidade: Garante que registros não sejam alterados indevidamente
	-Transparência: Todas as partes podem verificar status em tempo real
	-Segurança: Autenticação via wallet 

Objetivos:
	-Desenvolver uma aplicação descentralizada para criação e gerenciamento de listas de convidados em reuniões sociais.
	-Permitir que anfitriões criem listas e cadastrem convidados
	-Implementar sistema de confirmação de presença via wallet
	-Garantir transparência, imutabilidade e rastreabilidade das ações
	-Implementar sistema de taxa de comprometimento para evitar faltas
	-Fornecer dashboard em tempo real para acompanhamento

Descrição Técnica
Fluxo de Uso
	Anfitrião: Conecta sua wallet → Cria evento → Adiciona convidados (endereços wallet)
	Convidado: Recebe convite → Conecta sua wallet → Confirma presença (com taxa opcional)
	Sistema: Registra todas as ações em smart contracts na CESS Network
	Evento: Anfitrião pode aplicar penalidades por ausências não justificadas
	

Serviços da CESS Network Utilizados
	-Armazenamento Descentralizado: Dados do evento e listas de convidados
	-Smart Contracts: Gerenciamento de confirmações e penalidades
	-Autenticação: Via MetaMask/Web3 wallets
	-Proof of Existence: Validação de registros de convites


Tecnologias Implementadas
-Blockchain: CESS Testnet (Chain ID: 11330)
-Smart Contracts: Solidity (GLCRS.sol)
-Frontend: React.js
-Package Manager: pnpm
-Dev Server: Vite
-Web3 Integration: Ethers.js + Wagmi + Viem
-UI/UX: CSS Customizado
-Wallet: MetaMask

 
Como Executar o Projeto
Pré-requisitos:
Node.js 18+
pnpm instalado (npm install -g pnpm)
MetaMask instalado no navegador
TCESS tokens 

Passo 1: Configurar a CESS Testnet no MetaMask;
Passo 2: Configurar e Rodar o Frontend:
	# 1. Navegue para a pasta do frontend
	cd frontend

	# 2. Instale dependências com pnpm:
	pnpm install
	pnpm add wagmi@1.4.12 viem@1.21.1
	pnpm add semantic-ui-css- semantic-ui-react
	pnpm add @uidotdev/usehooks
	pnpm add @polkadot/util-crypto @polkadot/util

	# 3. Configure o endereço do contrato
	-de o deploy em https://remix.ethereum.org/
	-edite o arquivo config.js com:
	Endereço do contrato após o deploy
	ABI do contrato (se necessário)
	
	(você pode encontrar o contrato na pasta contracts) 

Passo 3:
Inicie o servidor de desenvolvimento
-pnpm dev


Estrutura de arquivos:
ingrid-glcrs-project/
├── README.md                    
├── contract/
│   └── GLCRS.sol               
└── frontend/
	└── src/
		└──assets	
   		├── GLCRS.jsx               
    		├── GLCRS.css               
    		├── config.js               
   		├── App.css           
   		├── App.js
		├──index.css
		├──main.jsx
		├──wagmi.js
    	└──public
	└──index
	└──package.json
	└──pnpm-lock.yaml
	└──vite.config



Funcionalidades:
Para Anfitriões 
-Criar Eventos: Defina nome, duração e taxa de presença
-Gerenciar Convidados: Adicione/remova endereços Ethereum
-Aprovar Solicitações: Controle quem pode participar
-Registrar Presença: Check-in durante o evento
-Penalizar Ausências: Aplique penalidades a quem não compareceu
-Encerrar Eventos: Processe automaticamente após prazo
-Sacar Fundos: Receba penalidades de ausentes

Para Convidados 
-Solicitar Entrada: Peça para participar de eventos
-Confirmar Presença: Pague taxa e confirme via blockchain
-Cancelar Presença: Desistência dentro do prazo
-Solicitar Reembolso: Receba de volta após comparecer
-Verificar Status: Acompanhe evento em tempo real

Sistema Inteligente
Taxa de Comprometimento: TCESS para confirmar
Penalidades Automáticas: Ausentes perdem a taxa
Reembolso Automático: Presentes recebem de volta
Prazos Configuráveis: Dias/horas/minutos personalizados
Transparência Total: Todas ações na blockchain
 

Conhecimento Adquirido:
-Desenvolvimento blockchain usando a CESS
-Smart contracts práticos
-Frontend Web3 Moderno
-UX/UI para dApps


Como Usar o GLCRS (guia completo e passo a passo):
Como anfitrião:
-Criar e Gerenciar um Evento
-Conecte sua wallet MetaMask (conta 1)
-Certifique-se de ter TCESS
-Vá para "Criar Evento"
-Preencha: Nome, Duração (24 horas), Taxa (0.01 TCESS)
-Clique em "Criar Evento" e assine a transação
-Adicione endereços de convidados
-Acompanhe solicitações e aprove entradas
-Após o prazo, encerre o evento

Como convidado:
-Use outra conta MetaMask (conta 2)
-Obtenha TCESS 
-Acesse "Participar de Eventos"
-Solicite entrada em um evento disponível ou vá a um evento que você foi convidado.
-Após aprovação, confirme presença (pague taxa)
-Compareça ao evento e tenha presença registrada
-Receba reembolso automático

Testar Penalidades:
-Convidado confirma presença (paga taxa), não comparece ao evento
-Anfitrião penaliza ausência
-Taxa é transferida para anfitrião
-Sistema registra penalidade na blockchain


Autor: 
Ingrid de Sousa Vieira
UnB - Universidade de Brasília
 
=====================================================================================
English US

GLCRS - Guest List Manager for Social Gatherings
About the Project
GLCRS is a decentralized application (dApp) developed for creating and managing guest lists for social gatherings using blockchain technology. The platform allows hosts to create events such as parties, academic lectures, and social gatherings, managing invitations and attendance confirmations in a transparent and secure manner on the CESS Network.


Summary:
The project solves common problems in event organization: duplicate names, difficulties with attendance confirmations, and the risk of data loss in centralized systems. Using the CESS Network, we offer decentralization, privacy, and transparency, providing greater convenience for hosts and ease for guests to confirm attendance securely.


Motivation and Justification:
Organizing events often creates headaches in guest list management. Traditional systems present problems such as:
Difficulty in attendance confirmations
Risk of information loss
Lack of transparency in records
Possibility of fraud or unauthorized changes
The CESS Network, with its blockchain infrastructure, offers:
Decentralization: Eliminates costs with centralized servers
Immutability: Ensures records cannot be improperly altered
Transparency: All parties can verify status in real-time
Security: Authentication via wallet


Objectives:
Develop a decentralized application for creating and managing guest lists for social gatherings
Allow hosts to create lists and register guests
Implement an attendance confirmation system via wallet
Ensure transparency, immutability, and traceability of actions
Implement a commitment fee system to prevent no-shows
Provide a real-time dashboard for monitoring


Technical Description:
Usage Flow
Host: Connects their wallet → Creates event → Adds guests (wallet addresses)
Guest: Receives invitation → Connects their wallet → Confirms attendance (with optional fee)
System: Records all actions in smart contracts on the CESS Network
Event: Host can apply penalties for unjustified absences


CESS Network Services Used
Decentralized Storage: Event data and guest lists
Smart Contracts: Management of confirmations and penalties
Authentication: Via MetaMask/Web3 wallets
Proof of Existence: Validation of invitation records


Technologies Implemented:
Blockchain: CESS Testnet (Chain ID: 11330)
Smart Contracts: Solidity (GLCRS.sol)
Frontend: React.js
Package Manager: pnpm
Dev Server: Vite
Web3 Integration: Ethers.js + Wagmi + Viem
UI/UX: Custom CSS
Wallet: MetaMask


How to Run the Project
Prerequisites
Node.js 18+

pnpm installed (npm install -g pnpm)

MetaMask installed in the browser

TCESS tokens (obtain from CESS faucet)


Step 1:
 Configure CESS Testnet in MetaMask

Step 2:
# 1. Navigate to the frontend folder
cd frontend

# 2. Install dependencies with pnpm:
pnpm install
pnpm add wagmi@1.4.12 viem@1.21.1
pnpm add semantic-ui-css semantic-ui-react
pnpm add @uidotdev/usehooks
pnpm add @polkadot/util-crypto @polkadot/util

# 3. Configure the contract address
# Deploy at https://remix.ethereum.org/
# Edit the config.js file with:
# - Contract address after deployment
# - Contract ABI (if necessary)
# (You can find the contract in the contracts folder)

Step 3:
Start the development server
pnpm dev

File Structure
text
ingrid-glcrs-project/
├── README.md
├── contract/
│   └── GLCRS.sol
└── frontend/
    └── src/
        └── assets
        ├── GLCRS.jsx
        ├── GLCRS.css
        ├── config.js
        ├── App.css
        ├── App.js
        ├── index.css
        ├── main.jsx
        ├── wagmi.js
    └── public
    └── index
    └── package.json
    └── pnpm-lock.yaml
    └── vite.config


Features
For Hosts 👑
-Create Events: Define name, duration, and attendance fee
-Manage Guests: Add/remove Ethereum addresses
-Approve Requests: Control who can participate
-Register Attendance: Check-in during the event
-Penalize Absences: Apply penalties to those who didn't attend
-End Events: Process automatically after deadline
-Withdraw Funds: Receive penalties from absentees


For Guests:
-Request Entry: Ask to participate in events
-Confirm Attendance: Pay fee and confirm via blockchain
-Cancel Attendance: Withdraw within the deadline
-Request Refund: Get your fee back after attending
-Check Status: Monitor event in real-time


Intelligent System:
-Commitment Fee: TCESS stake to confirm attendance
-Automatic Penalties: Absentees lose their fee
-Automatic Refunds: Attendees get their fee back
-Configurable Deadlines: Custom days/hours/minutes
-Total Transparency: All actions on the blockchain


Knowledge Acquired:
-Blockchain development using CESS
-Practical smart contracts
-Modern Web3 Frontend
-UX/UI for dApps


How to Use GLCRS (Complete Step-by-Step Guide)

As a Host:
-Create and Manage an Event
-Connect your MetaMask wallet (account 1)
-Ensure you have TCESS tokens
-Go to "Create Event"
-Fill in: Name, Duration (24 hours), Fee (0.01 TCESS)
-Click "Create Event" and sign the transaction
-Add guest addresses
-Monitor requests and approve entries
-After the deadline, end the event

As a Guest:
-Participate in an Event
-Use another MetaMask account (account 2)
-Obtain TCESS tokens
-Access "Participate in Events"
-Request entry to an available event or go to an event you were invited to
-After approval, confirm attendance (pay fee)
-Attend the event and have your presence registered
-Receive automatic refund

Test Penalties:
-Guest confirms attendance (pays fee) but doesn't attend the event
-Host penalizes absence
-Fee is transferred to the host
-System records penalty on the blockchain

Author
Ingrid de Sousa Vieira
UnB - University of Brasília