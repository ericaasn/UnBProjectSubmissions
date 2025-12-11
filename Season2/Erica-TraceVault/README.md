TraceVault – Armazenamento seguro com cadeia de custódia digital e imutável
O TraceVault é uma aplicação descentralizada (DApp) projetada para permitir que empresas armazenem, consultem e validem documentos de forma segura, auditável e transparente, utilizando blockchain para garantir a integridade e rastreabilidade de cada interação.

A criação de uma solução de cadeia de custódia digital imutável: cada upload, download ou atualização gera um evento registrado na blockchain, impossibilitando alterações não autorizadas e fraudes.

Problema que o TraceVault resolve
Empresas que lidam com documentos críticos enfrentam dificuldades como:
Risco de perda, alteração ou manipulação de arquivos
Falta de auditoria clara sobre quem acessou ou modificou documentos
Custos altos com infraestrutura centralizada
Dependência de servidores tradicionais e vulneráveis

O TraceVault elimina esses problemas fornecidos:
Auditório completo​, Rastreamento imutável, Transparência​​​

O sistema é dividido em três camadas principais:

Frontend (React + Vite): Permite que o usuário faça upload de arquivos, gere automaticamente o hash criptográfico, consulte, faça download e veja eventos registrados na blockchain.


Backend (Node.js + MySQL): Permite que o usuário receba e armazene os arquivos enviados, gerencie e faça uploads/downloads via hash, mantém registro interno das operações dos usuários.


Banco de Dados (MySQL): Armazena o nome original do arquivo, caminho no servidor, hash, tamanho e data de upload.



Contrato Inteligente (Solidity – Rede Sepolia): Registra eventos  e mantém histórico imutável na blockchain.



Como Rodar o Projeto Localmente?

Pré -requisitos: Node.js, MYSQL em execução, NPM e metamask configurada na rede espolia.


Backend:

backend de CD
npm install
rode node server.js

Localhost: http://localhost:3000



Front-end:

cd tracevault-frontend
npm install
npm run dev
Localhost: http://localhost:5173
