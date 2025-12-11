// ===== AccessDocument.jsx =====
import React, { useState, useEffect } from "react";
import { getContract } from "../utils/contract";

const AccessDocument = () => {
  const [hash, setHash] = useState("");
  const [fileInfo, setFileInfo] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [userAddress, setUserAddress] = useState("");

  // Captura endereço da MetaMask
  useEffect(() => {
    const getCurrentAccount = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) setUserAddress(accounts[0]);
        } catch (error) {
          console.error("Erro ao obter conta:", error);
        }
      }
    };

    getCurrentAccount();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) setUserAddress(accounts[0]);
        else setUserAddress("");
      };
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, []);

  // Verifica se o documento existe no backend
  const handleCheckFile = async () => {
    if (!hash) {
      setStatus("error: Informe o hash do documento");
      return;
    }

    try {
      setLoading(true);
      setStatus("loading:Verificando documento...");

      const response = await fetch(`http://localhost:3001/check/${hash}`);
      const result = await response.json();

      if (result.exists) {
        setFileInfo(result.file);
        setStatus("success: Documento encontrado! Pronto para download.");
      } else {
        setFileInfo(null);
        setStatus("error: Documento não encontrado. Verifique o hash.");
      }
    } catch (error) {
      console.error(error);
      setStatus("error: Erro ao verificar documento.");
    } finally {
      setLoading(false);
    }
  };

  // Faz download e registra na blockchain
  const handleDownloadAndRegister = async () => {
    if (!hash || !fileInfo) return;
    if (!userAddress) {
      setStatus("error: Conecte sua MetaMask primeiro!");
      return;
    }

    try {
      setLoading(true);
      setStatus("loading:Registrando download na blockchain...");

      // Chama função downloadDocument do contrato
      const contract = await getContract();
      const tx = await contract.downloadDocument(hash);
      await tx.wait();

      setStatus("loading:Baixando arquivo...");

      // Registra no backend 
      const response = await fetch(`http://localhost:3001/download-log/${hash}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userAddress, action: "DOWNLOAD", walletAddress: userAddress })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro no download");
      }

      // 3️ Faz o download do arquivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileInfo.filename || "documento_baixado";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setStatus(`success: Download e registro na blockchain realizados!`);

      setTimeout(() => { setHash(""); setFileInfo(null); setStatus(""); }, 10000);

    } catch (error) {
      console.error(error);
      setStatus(`error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const statusType = status.split(':')[0];
  const statusMessage = status.split(':')[1] || status;

  return (
    <div className="access-container">
      <h2 className="form-title">Acessar e Baixar Documento</h2>
      <p className="description">Verifique e registre o acesso ao documento na cadeia de custódia.</p>

      <div className="wallet-status">
        {userAddress ? (
          <div className="wallet-connected">
             MetaMask conectada: <strong>{userAddress.slice(0, 8)}...{userAddress.slice(-6)}</strong>
          </div>
        ) : (
          <div className="wallet-disconnected">
             Conecte sua MetaMask para registrar acessos
          </div>
        )}
      </div>

      <div className="access-form">
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

        <div className="button-group">
          <button 
            type="button"
            onClick={handleCheckFile}
            disabled={loading || !hash}
            className="btn-check"
          >
            {loading ? <> <span className="spinner"></span> Verificando...</> : " Verificar Documento"}
          </button>

          {fileInfo && (
            <button 
              type="button"
              onClick={handleDownloadAndRegister}
              disabled={loading || !userAddress}
              className="btn-download"
            >
              {userAddress ? " Download" : " Conecte MetaMask"}
            </button>
          )}
        </div>
      </div>

      {fileInfo && (
        <div className="file-info">
          <h3> Informações do Documento</h3>
          <p><strong>Nome:</strong> {fileInfo.filename}</p>
          <p><strong>Tipo:</strong> {fileInfo.mimetype}</p>
          <p><strong>Tamanho:</strong> {(fileInfo.size / 1024).toFixed(2)} KB</p>
          <p><strong>Hash:</strong> <code>{hash}</code></p>
        </div>
      )}

      {status && (
        <div className={`status-message ${statusType}`}>
          {statusMessage}
        </div>
      )}

      <style jsx>{`
        .access-container { animation: fadeIn 0.5s ease-out; }
        .form-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; }
        .description { font-size: 0.9rem; margin-bottom: 1rem; }
        .wallet-status { margin-bottom: 1rem; }
        .wallet-connected { background: rgba(74,222,128,0.1); padding: 0.5rem; border-radius: 8px; color: #4ade80; }
        .wallet-disconnected { background: rgba(248,113,113,0.1); padding: 0.5rem; border-radius: 8px; color: #f87171; }
        .access-form { display: flex; flex-direction: column; gap: 1rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-label { font-weight: 600; color: #4da6ff; }
        .form-input { padding: 0.8rem; border-radius: 8px; background: #1c1c1e; color: #f3f4f6; border: 1px solid #4da6ff; outline: none; }
        .button-group { display: flex; gap: 1rem; }
        .btn-check { flex: 1; background: #338deeff ; color: #fff; padding: 0.8rem; border-radius: 8px; }
        .btn-download { flex: 1; background: #338deeff; color: #fff; padding: 0.8rem; border-radius: 8px; }
        .btn-check:disabled, .btn-download:disabled { opacity: 0.6; cursor: not-allowed; }
        .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .file-info { background: rgba(77,166,255,0.1); padding: 1rem; border-radius: 8px; margin-top: 1rem; }
        .file-info code { background: rgba(0,0,0,0.2); padding: 0.2rem 0.4rem; border-radius: 4px; }
        .status-message { margin-top: 1rem; padding: 0.8rem; border-radius: 8px; white-space: pre-line; }
        .status-message.success { background: rgba(74,222,128,0.1); color: #4ade80; }
        .status-message.error { background: rgba(248,113,113,0.1); color: #f87171; }
        .status-message.loading { background: rgba(77,166,255,0.1); color: #4da6ff; }
      `}</style>
    </div>
  );
};

export default AccessDocument;
