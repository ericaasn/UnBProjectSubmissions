// ===== MyDocuments.jsx =====
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import contractABI from "../utils/TraceVaultABI.json";

const CONTRACT_ADDRESS = "0xC19691709FAc0394D92843D7eebd34d2ca7C044a";

export default function MyDocuments() {
  const [account, setAccount] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAccount();
  }, []);

  async function loadAccount() {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const userAccount = accounts[0];
      setAccount(userAccount);
      await fetchMyDocuments(userAccount);
    }
  }

  async function fetchMyDocuments(userAddress) {
    try {
      setLoading(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

      
      const uploadedEvents = await contract.queryFilter(
        contract.filters.DocumentUploaded(),
        0,
        "latest"
      );

      const transferredEvents = await contract.queryFilter(
        contract.filters.DocumentTransferred(),
        0,
        "latest"
      );

      // Filtrar uploads realizados pelo usuário (owner == args[0])
      const userUploads = uploadedEvents.filter(
        (e) => (e.args && e.args[0] && e.args[0].toLowerCase()) === userAddress.toLowerCase()
      );

      // Filtrar recebidos via transferência (to == args[1])
      const userReceived = transferredEvents.filter(
        (e) => (e.args && e.args[1] && e.args[1].toLowerCase()) === userAddress.toLowerCase()
      );

      // Mapear eventos 
      const uploadedDocs = userUploads.map((e) => {
        // DocumentUploaded(address owner, string hash, string fileId, uint256 timestamp)
        const owner = e.args[0];
        const hash = e.args[1];
        const fileId = e.args[2];
        const timestamp = e.args[3];
        return {
          type: "Enviado",
          owner,
          hash,
          fileId,
          timestamp: timestamp ? new Date(Number(timestamp) * 1000).toLocaleString("pt-BR") : new Date().toLocaleString("pt-BR"),
        };
      });

      const receivedDocs = userReceived.map((e) => {
        // DocumentTransferred(address from, address to, string hash, uint256 timestamp)
        const from = e.args[0];
        const to = e.args[1];
        const hash = e.args[2];
        const timestamp = e.args[3];
        return {
          type: "Recebido",
          owner: from, // mostrar quem enviou originalmente
          hash,
          fileId: "(Transferido) ", 
          timestamp: timestamp ? new Date(Number(timestamp) * 1000).toLocaleString("pt-BR") : new Date().toLocaleString("pt-BR"),
        };
      });

      // juntar e ordenar do mais recente ao mais antigo
      const allDocs = [...uploadedDocs, ...receivedDocs]
        .sort((a, b) => {
          // tenta comparar timestamps convertendo de volta pra Date
          const ta = new Date(a.timestamp).getTime();
          const tb = new Date(b.timestamp).getTime();
          return tb - ta;
        });

      setDocuments(allDocs);
    } catch (error) {
      console.error("Erro ao carregar documentos:", error);
      
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mydocs-container">
      <h2 className="mydocs-title">
        <span className="mydocs-icon"></span>
        Meus Documentos
      </h2>

      {loading ? (
        <div className="loading-state">
          <div className="loader"></div>
          <p>Carregando documentos...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon"></span>
          <p>Nenhum documento encontrado</p>
          <span className="empty-hint">Faça upload de um documento para começar</span>
        </div>
      ) : (
        <div className="documents-grid">
          {documents.map((doc, index) => (
            <div key={index} className={`doc-card ${doc.type === "Recebido" ? "received" : "sent"}`}>
              <div className="doc-header">
                <span className={`doc-badge ${doc.type === "Recebido" ? "badge-received" : "badge-sent"}`}>
                  {doc.type}
                </span>
              </div>

              <div className="doc-info">
                <div className="info-row">
                  <span className="info-label">Hash</span>
                  <span className="info-value hash-value">
                    {typeof doc.hash === "string" ? `${doc.hash.slice(0, 10)}...${doc.hash.slice(-10)}` : String(doc.hash)}
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">Proprietário</span>
                  <span className="info-value owner-value">
                    {typeof doc.owner === "string" ? `${doc.owner.slice(0, 8)}...${doc.owner.slice(-6)}` : String(doc.owner)}
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">File ID</span>
                  <span className="info-value">{doc.fileId}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Data</span>
                  <span className="info-value">{doc.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* */}
      <style jsx>{`
        .mydocs-container {
          animation: fadeIn 0.5s ease-out;
        }

        .mydocs-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffffff;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .mydocs-icon {
          font-size: 1.8rem;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 3rem;
          color: rgba(243, 244, 246, 0.7);
        }

        .loader {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(77, 166, 255, 0.2);
          border-top-color: #4da6ff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.8rem;
          padding: 3rem;
          text-align: center;
        }

        .empty-icon {
          font-size: 3rem;
          opacity: 0.5;
        }

        .empty-state p {
          color: rgba(243, 244, 246, 0.7);
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
        }

        .empty-hint {
          color: rgba(243, 244, 246, 0.5);
          font-size: 0.9rem;
        }

        .documents-grid {
          display: grid;
          gap: 1rem;
          animation: slideIn 0.5s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .doc-card {
          background: rgba(28, 28, 30, 0.6);
          border: 1px solid rgba(77, 166, 255, 0.3);
          border-radius: 14px;
          padding: 1.2rem;
          transition: all 0.3s ease;
        }

        .doc-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(77, 166, 255, 0.2);
          border-color: rgba(77, 166, 255, 0.5);
        }

        .doc-card.received {
          border-left: 3px solid #a57cff;
        }

        .doc-card.sent {
          border-left: 3px solid #4da6ff;
        }

        .doc-header {
          margin-bottom: 1rem;
        }

        .doc-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .badge-received {
          background: rgba(165, 124, 255, 0.15);
          color: #a57cff;
          border: 1px solid rgba(165, 124, 255, 0.3);
        }

        .badge-sent {
          background: rgba(77, 166, 255, 0.15);
          color: #4da6ff;
          border: 1px solid rgba(77, 166, 255, 0.3);
        }

        .doc-info {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .info-row {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .info-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: rgba(243, 244, 246, 0.6);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-value {
          color: #f3f4f6;
          font-size: 0.9rem;
          word-break: break-all;
        }

        .hash-value,
        .owner-value {
          font-family: 'Courier New', monospace;
          font-size: 0.85rem;
          color: #4da6ff;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
