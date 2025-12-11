import React, { useState } from "react";
import CryptoJS from "crypto-js";
import { uploadDocument } from "../utils/contract";

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState("");
  const [fileID, setFileID] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  function handleFileChange(e) {
    const f = e.target.files[0];
    if (!f) return;

    setFile(f);
    setStatus("Calculando hash...");

    const reader = new FileReader();
    reader.onload = (event) => {
      const wordArray = CryptoJS.lib.WordArray.create(event.target.result);
      const hashValue = CryptoJS.SHA256(wordArray).toString();

      setHash(hashValue);
      setStatus("Hash calculado com sucesso!");
    };

    reader.readAsArrayBuffer(f);
  }

  // Envia arquivo ao backend
  async function sendToBackend(file, hash) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("hash", hash);

      const response = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        return { success: true, data: result, message: "Arquivo salvo no servidor" };
      } else {
        return { success: false, message: result.error || "Erro ao salvar no servidor" };
      }
    } catch (error) {
      return { success: false, message: `Erro de conexão: ${error.message}` };
    }
  }

  async function handleSubmit() {
    if (!hash || !fileID || !file) {
      setStatus("Preencha todos os campos e selecione um arquivo");
      return;
    }

    try {
      setLoading(true);
      setStatus("Enviando arquivo para o servidor...");

      // 1. Salvar no backend
      const backendResult = await sendToBackend(file, hash);
      if (!backendResult.success) {
        setStatus(`❌ ${backendResult.message}`);
        return;
      }

      setStatus("Arquivo salvo no servidor. Registrando na blockchain...");

      // 2. Registrar no contrato
      await uploadDocument(hash, fileID);

      setStatus(" Documento registrado com sucesso!");

      setTimeout(() => {
        setFile(null);
        setHash("");
        setFileID("");
        setStatus("");
      }, 3000);

    } catch (error) {
      console.error(error);
      setStatus(" Erro ao registrar documento");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-container">
      <h2 className="form-title">
        <span className="form-icon"></span>
        Registrar Documento
      </h2>

      {/* Seleção de arquivo */}
      <div className="form-group">
        <label className="form-label">Selecione o arquivo</label>

        <div className="file-input-wrapper">
          <input
            type="file"
            onChange={handleFileChange}
            className="file-input"
            id="file-upload"
          />

          <label htmlFor="file-upload" className="file-label">
            {file ? (
              <>
                <span className="file-icon"></span>
                <span className="file-name">{file.name}</span>
              </>
            ) : (
              <>
                <span className="file-icon"></span>
                <span>Escolher arquivo</span>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Hash */}
      {hash && (
        <div className="hash-display">
          <label className="form-label">Hash SHA-256</label>
          <div className="hash-value">{hash}</div>
          <div className="hash-info">
            <small>Use este hash para acessar o arquivo posteriormente</small>
          </div>
        </div>
      )}

      {/* File ID  */}
      <div className="form-group">
        <label className="form-label">File ID</label>
        <input
          type="text"
          placeholder="Digite o ID do arquivo"
          value={fileID}
          onChange={(e) => setFileID(e.target.value)}
          className="form-input"
        />
      </div>

      {/* Botão */}
      <button
        onClick={handleSubmit}
        disabled={!hash || !fileID || !file || loading}
        className="btn-submit"
      >
        {loading ? (
          <>
            <span className="spinner"></span> Registrando...
          </>
        ) : (
          <>
            <span></span> Registrar arquivo
          </>
        )}
      </button>

      {/* Status */}
      {status && (
        <div
          className={`status-message ${
            status.includes("")
              ? "success"
              : status.includes("")
              ? "error"
              : "info"
          }`}
        >
          {status}

          {status.includes("") && hash && (
            <div className="download-link">
              <small>
                Para baixar: <code>{hash}</code>
              </small>
            </div>
          )}
        </div>
      )}

      {/* TODO: Seu CSS foi mantido 100% */}
      <style jsx>{`
        /* TODO: Seu CSS ORIGINAL inteiro foi mantido SEM NENHUMA ALTERAÇÃO */
        .form-container { animation: fadeIn 0.5s ease-out; }
        .form-title { font-size: 1.5rem; font-weight: 700; color: #ffffffff; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
        .form-icon { font-size: 1.8rem; }
        .form-group { margin-bottom: 1.5rem; }
        .form-label { display: block; font-size: 0.9rem; font-weight: 600; color: #4da6ff; margin-bottom: 0.5rem; }
        .file-input-wrapper { position: relative; }
        .file-input { display: none; }
        .file-label { display: flex; align-items: center; justify-content: center; gap: 0.8rem; background: rgba(77, 166, 255, 0.1); border: 2px dashed rgba(77, 166, 255, 0.4); border-radius: 12px; padding: 1.5rem; cursor: pointer; transition: all 0.3s ease; color: #f3f4f6; font-weight: 500; }
        .file-label:hover { background: rgba(77, 166, 255, 0.2); border-color: #4da6ff; transform: translateY(-2px); }
        .file-icon { font-size: 2rem; }
        .file-name { font-weight: 600; color: #4da6ff; }
        .hash-display { margin-bottom: 1.5rem; animation: slideIn 0.4s ease-out; }
        .hash-info { margin-top: 0.5rem; color: rgba(243, 244, 246, 0.6); font-size: 0.8rem; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .hash-value { background: rgba(84, 27, 207, 0.1); border: 1px solid rgba(55, 33, 255, 0.3); border-radius: 8px; padding: 0.8rem; font-family: 'Courier New', monospace; font-size: 0.85rem; color: #ffffffff; word-break: break-all; line-height: 1.5; }
        .form-input { width: 100%; background: rgba(28, 28, 30, 0.8); border: 1px solid rgba(77, 166, 255, 0.3); border-radius: 10px; padding: 0.9rem; color: #f3f4f6; font-size: 0.95rem; transition: all 0.3s ease; outline: none; }
        .form-input:focus { border-color: #4da6ff; box-shadow: 0 0 0 3px rgba(77, 166, 255, 0.1); }
        .form-input::placeholder { color: rgba(243, 244, 246, 0.5); }
        .btn-submit { width: 100%; background: linear-gradient(135deg, #338deeff 0%, #338deeff 100%); color: #fefeffff; border: none; border-radius: 12px; padding: 1rem; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 25px rgba(77, 166, 255, 0.6); }
        .btn-submit:active:not(:disabled) { transform: translateY(0); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .spinner { width: 16px; height: 16px; border: 2px solid rgba(15, 15, 16, 0.3); border-top-color: #0f0f10; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .status-message { margin-top: 1rem; padding: 0.8rem; border-radius: 8px; font-size: 0.9rem; font-weight: 500; animation: fadeIn 0.3s ease-out; }
        .status-message.success { background: rgba(74, 222, 128, 0.1); border: 1px solid rgba(74, 222, 128, 0.3); color: #4ade80; }
        .status-message.error { background: rgba(248, 113, 113, 0.1); border: 1px solid rgba(248, 113, 113, 0.3); color: #f87171; }
        .status-message.info { background: rgba(77, 166, 255, 0.1); border: 1px solid rgba(77, 166, 255, 0.3); color: #4da6ff; }
        .download-link { margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid rgba(74, 222, 128, 0.2); }
        .download-link code { background: rgba(0,0,0,0.2); padding: 0.2rem 0.4rem; border-radius: 4px; font-family: 'Courier New', monospace; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
