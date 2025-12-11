import React, { useState } from "react";
import UploadForm from "./components/UploadForm";
import QueryDocument from "./components/QueryDocument";
import AccessDocument from "./components/AccessDocument";
import TransferOwnership from "./components/TransferOwnership";
import MyDocuments from "./components/MyDocuments";
import EventLog from "./components/EventLog";

export default function App() {
  const [account, setAccount] = useState("");
  const [activeTab, setActiveTab] = useState("upload");

  // Função para conectar a carteira
  async function connectWallet() {
    if (!window.ethereum) {
      alert("MetaMask não encontrada!");
      return;
    }
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);
  }

  // Renderiza o conteúdo de acordo com a aba selecionada
  const renderTab = () => {
    switch (activeTab) {
      case "upload":
        return <UploadForm />;
      case "query":
        return <QueryDocument />;
      case "access":
        return <AccessDocument />;
      case "transfer":
        return <TransferOwnership />;
      case "mydocs":
        return <MyDocuments />;
      case "events":
        return <EventLog />;
      default:
        return <UploadForm />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-center">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">TraceVault</h1>

      {/* Botão de conexão da carteira */}
      {!account ? (
        <button
          onClick={connectWallet}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Conectar Wallet
        </button>
      ) : (
        <p className="text-gray-700 mb-4">
           Conectado: <span className="font-mono">{account}</span>
        </p>
      )}

      {/* Menu de navegação */}
      <div className="flex justify-center gap-3 mb-6 flex-wrap">
        <button
          onClick={() => setActiveTab("upload")}
          className={`px-4 py-2 rounded text-white ${
            activeTab === "upload" ? "bg-blue-700" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          Registrar
        </button>

        <button
          onClick={() => setActiveTab("query")}
          className={`px-4 py-2 rounded text-white ${
            activeTab === "query" ? "bg-gray-800" : "bg-gray-600 hover:bg-gray-700"
          }`}
        >
          Consultar
        </button>

        <button
          onClick={() => setActiveTab("access")}
          className={`px-4 py-2 rounded text-white ${
            activeTab === "access" ? "bg-green-700" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          Acessar
        </button>

        <button
          onClick={() => setActiveTab("transfer")}
          className={`px-4 py-2 rounded text-white ${
            activeTab === "transfer" ? "bg-purple-700" : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          Transferir
        </button>

        <button
          onClick={() => setActiveTab("mydocs")}
          className={`px-4 py-2 rounded text-white ${
            activeTab === "mydocs" ? "bg-yellow-600" : "bg-yellow-500 hover:bg-yellow-600"
          }`}
        >
          Meus Documentos
        </button>

        <button
          onClick={() => setActiveTab("events")}
          className={`px-4 py-2 rounded text-white ${
            activeTab === "events" ? "bg-indigo-700" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          Eventos
        </button>
      </div>

      {/* Renderiza o componente ativo */}
      <div className="max-w-3xl mx-auto">{renderTab()}</div>
    </div>
  );
}
