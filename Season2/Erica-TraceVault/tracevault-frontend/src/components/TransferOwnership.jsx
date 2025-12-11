import React, { useState } from "react";
import { getContract } from "../utils/contract";

const TransferOwnership = () => {
  const [hash, setHash] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTransfer = async (e) => {
    e.preventDefault();
    
    if (!hash || !newOwner) {
      setStatus("error: Preencha todos os campos");
      return;
    }

    if (!newOwner.match(/^0x[a-fA-F0-9]{40}$/)) {
      setStatus("error: Endereço inválido. Use o formato 0x...");
      return;
    }

    try {
      setLoading(true);
      setStatus("loading:Transferindo propriedade...");
      
      const contract = await getContract();
      const tx = await contract.transferOwnership(hash, newOwner);
      await tx.wait();

      setStatus(`success: Propriedade transferida com sucesso!\nHash da transação: ${tx.hash.slice(0, 10)}...${tx.hash.slice(-8)}`);
      
      setTimeout(() => {
        setHash("");
        setNewOwner("");
        setStatus("");
      }, 5000);
    } catch (error) {
      console.error(error);
      setStatus("error: Erro ao transferir propriedade. Verifique se você é o dono do documento.");
    } finally {
      setLoading(false);
    }
  };

  const statusType = status.split(':')[0];
  const statusMessage = status.split(':')[1] || status;

  return (
    <div className="transfer-container">
      <h2 className="form-title">
        <span className="form-icon"></span>
        Transferir Propriedade
      </h2>
      
      <p className="description">
        Transfira a propriedade de um documento para outro endereço. Esta ação é irreversível.
      </p>

      <form onSubmit={handleTransfer} className="transfer-form">
        <div className="form-group">
          <label className="form-label">Hash do Documento</label>
          <input
            type="text"
            placeholder="Digite o hash SHA-256 do documento"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Novo Proprietário</label>
          <input
            type="text"
            placeholder="0x... (endereço Ethereum)"
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
            className="form-input"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || !hash || !newOwner}
          className="btn-submit"
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Transferindo...
            </>
          ) : (
            <>
              <span></span>
              Transferir Propriedade
            </>
          )}
        </button>
      </form>

      {status && (
        <div className={`status-message ${statusType}`}>
          {statusMessage}
        </div>
      )}

      <style jsx>{`
        .transfer-container {
          animation: fadeIn 0.5s ease-out;
        }

        .form-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffffff;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .form-icon {
          font-size: 1.8rem;
        }

        .description {
          color: rgba(243, 244, 246, 0.7);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }

        .transfer-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #4da6ff;
        }

        .form-input {
          width: 100%;
          background: rgba(28, 28, 30, 0.8);
          border: 1px solid rgba(77, 166, 255, 0.3);
          border-radius: 10px;
          padding: 0.9rem;
          color: #f3f4f6;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          outline: none;
        }

        .form-input:focus {
          border-color: #4da6ff;
          box-shadow: 0 0 0 3px rgba(77, 166, 255, 0.1);
        }

        .btn-submit {
          width: 100%;
          background: linear-gradient(135deg, #338deeff 0%, #338deeff 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 1rem;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(165, 124, 255, 0.6);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .status-message {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 500;
          animation: slideIn 0.3s ease-out;
          white-space: pre-line;
        }

        .status-message.success {
          background: rgba(74, 222, 128, 0.1);
          border: 1px solid rgba(74, 222, 128, 0.3);
          color: #4ade80;
        }

        .status-message.error {
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.3);
          color: #f87171;
        }

        .status-message.loading {
          background: rgba(77, 166, 255, 0.1);
          border: 1px solid rgba(77, 166, 255, 0.3);
          color: #4da6ff;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default TransferOwnership;