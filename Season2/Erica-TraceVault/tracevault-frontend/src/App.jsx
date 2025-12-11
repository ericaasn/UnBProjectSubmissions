import React, { useState, useEffect } from "react";
import UploadForm from "./components/UploadForm";
import QueryDocument from "./components/QueryDocument";
import AccessDocument from "./components/AccessDocument";
import TransferOwnership from "./components/TransferOwnership";
import MyDocuments from "./components/MyDocuments";
import EventLog from "./components/EventLog";
import "./App.css";

export default function App() {
  const [account, setAccount] = useState("");
  const [activeTab, setActiveTab] = useState("upload");

  async function connectWallet() {
    if (!window.ethereum) {
      alert("MetaMask não encontrada!");
      return;
    }

    try {
      setAccount("");
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      const accs = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setAccount(accs[0]);
    } catch (error) {
      console.error("Erro ao conectar carteira:", error);
      alert("Falha ao conectar à MetaMask.");
    }
  }

  function disconnectWallet() {
    setAccount("");
  }

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount("");
        }
      });
    }
  }, []);

  const tabs = [
    { id: "upload", label: "Registrar", icon: "" },
    { id: "query", label: "Consultar", icon: "" },
    { id: "access", label: "Acessar", icon: "" },
    { id: "transfer", label: "Transferir", icon: "" },
    { id: "mydocs", label: "Meus Documentos", icon: "" },
    { id: "events", label: "Eventos", icon: "" },
  ];

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">TraceVault</h1>
          <p className="app-subtitle">
            Armazenamento Seguro com Cadeia de Custódia Digital Imutável
          </p>
        </div>
      </header>

      {/* Wallet Connection */}
      <div className="wallet-section">
        {!account ? (
          <button onClick={connectWallet} className="btn-connect">
            <span className="btn-icon"></span>
            Conectar com Metamask
          </button>
        ) : (
          <div className="wallet-card">
            <div className="wallet-info">
              <span className="wallet-label">Conectado:</span>
              <span className="wallet-address">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </div>
            <button onClick={disconnectWallet} className="btn-disconnect">
              Desconectar / Trocar Wallet
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <nav className="nav-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-card">
          {activeTab === "upload" && <UploadForm />}
          {activeTab === "query" && <QueryDocument />}
          {activeTab === "access" && <AccessDocument />}
          {activeTab === "transfer" && <TransferOwnership />}
          {activeTab === "mydocs" && <MyDocuments />}
          {activeTab === "events" && <EventLog />}
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p></p>
      </footer>
    </div>
  );
}