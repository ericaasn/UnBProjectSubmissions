import React, { useState } from "react";
import { getContract } from "../utils/contract";

export default function QueryDocument() {
  const [hash, setHash] = useState("");
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    if (!hash) {
      setError("Por favor, informe o hash do documento");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setInfo(null);

      const contract = await getContract();
      const data = await contract.documents(hash);
      
      if (data.owner === "0x0000000000000000000000000000000000000000") {
        setError("Documento não encontrado");
        setInfo(null);
        return;
      }
      
      setInfo(data);
    } catch (err) {
      console.error(err);
      setError("Erro ao consultar documento");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  return (
    <div className="query-container">
      <h2 className="query-title">
        <span className="query-icon"></span>
        Consultar Documento
      </h2>

      <div className="search-box">
        <input
          type="text"
          placeholder="Digite o hash do documento (SHA-256)"
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          onKeyPress={handleKeyPress}
          className="search-input"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !hash}
          className="search-button"
        >
          {loading ? (
            <span className="spinner"></span>
          ) : (
            <span>Consultar</span>
          )}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {info && (
        <div className="result-card">
          <h3 className="result-title">Informações do Documento</h3>
          
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Proprietário</span>
              <span className="info-value owner">{info.owner}</span>
            </div>

            <div className="info-item">
              <span className="info-label">File ID</span>
              <span className="info-value">{info.fileId}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Data de Registro</span>
              <span className="info-value">
                {new Date(Number(info.timestamp) * 1000).toLocaleString('pt-BR')}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Hash do Documento</span>
              <span className="info-value hash">{hash}</span>
            </div>
          </div>

          <div className="success-badge">
            <span>✓</span>
            Documento verificado na blockchain
          </div>
        </div>
      )}

      <style jsx>{`
        .query-container {
          animation: fadeIn 0.5s ease-out;
        }
        .query-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffffff;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .query-icon {
          font-size: 1.8rem;
        }
        .search-box {
          display: flex;
          gap: 0.8rem;
          margin-bottom: 1.5rem;
        }
        .search-input {
          flex: 1;
          background: rgba(28, 28, 30, 0.8);
          border: 1px solid rgba(77, 166, 255, 0.3);
          border-radius: 10px;
          padding: 0.9rem;
          color: #f3f4f6;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          outline: none;
        }
        .search-input:focus {
          border-color: #4da6ff;
          box-shadow: 0 0 0 3px rgba(77, 166, 255, 0.1);
        }
        .search-input::placeholder {
          color: rgba(243, 244, 246, 0.5);
        }
        .search-button {
          background: linear-gradient(135deg, #338deeff 0%, #338deeff  100%);
          color: #fefeffff;
          border: none;
          border-radius: 10px;
          padding: 0 1.5rem;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 60px;
        }
        .search-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(77, 166, 255, 0.6);
        }
        .search-button:active:not(:disabled) {
          transform: translateY(0);
        }
        .search-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(15, 15, 16, 0.3);
          border-top-color: #0f0f10;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .error-message {
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.3);
          border-radius: 10px;
          padding: 1rem;
          color: #f87171;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          animation: shake 0.5s ease-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .result-card {
          background: rgba(77, 166, 255, 0.05);
          border: 1px solid rgba(77, 166, 255, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          animation: slideIn 0.4s ease-out;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .result-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #4da6ff;
          margin: 0 0 1.5rem 0;
        }
        .info-grid {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }
        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .info-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #4da6ff;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .info-value {
          background: rgba(28, 28, 30, 0.6);
          border: 1px solid rgba(77, 166, 255, 0.2);
          border-radius: 8px;
          padding: 0.8rem;
          color: #f3f4f6;
          font-size: 0.95rem;
          word-break: break-all;
        }
        .info-value.owner,
        .info-value.hash {
          font-family: 'Courier New', monospace;
          font-size: 0.85rem;
        }
        .success-badge {
          margin-top: 1.5rem;
          background: rgba(74, 222, 128, 0.1);
          border: 1px solid rgba(74, 222, 128, 0.3);
          border-radius: 10px;
          padding: 0.8rem;
          color: #4ade80;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 768px) {
          .search-box {
            flex-direction: column;
          }
          .search-button {
            width: 100%;
            padding: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}
