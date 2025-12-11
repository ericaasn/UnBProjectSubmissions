import React, { useState } from "react";
import { getContract } from "../utils/contract";

const EventLog = () => {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setStatus("Buscando eventos na blockchain...");
      const contract = await getContract();

      const uploadLogs = await contract.queryFilter(contract.filters.DocumentUploaded());
      const transferLogs = await contract.queryFilter(contract.filters.DocumentTransferred());
      const accessLogs = await contract.queryFilter(contract.filters.DocumentAccessed());
      const downloadLogs = await contract.queryFilter(contract.filters.DocumentDownloaded());

      const all = [
        ...uploadLogs.map((log) => ({
          type: "Upload",
          icon: "",
          user: log.args.owner,
          hash: log.args.hash,
          fileID: log.args.fileID, // alterado
          timestamp: new Date(Number(log.args.timestamp) * 1000).toLocaleString('pt-BR'),
        })),
        ...transferLogs.map((log) => ({
          type: "Transferência",
          icon: "",
          user: log.args.from,
          hash: log.args.hash,
          fileID: "",
          timestamp: new Date(Number(log.args.timestamp) * 1000).toLocaleString('pt-BR'),
        })),
        ...accessLogs.map((log) => ({
          type: "Acesso",
          icon: "",
          user: log.args.user,
          hash: log.args.hash,
          fileID: "",
          timestamp: new Date(Number(log.args.timestamp) * 1000).toLocaleString('pt-BR'),
        })),
        ...downloadLogs.map((log) => ({
          type: "Download",
          icon: "",
          user: log.args.user,
          hash: log.args.hash,
          fileID: "",
          timestamp: new Date(Number(log.args.timestamp) * 1000).toLocaleString('pt-BR'),
        })),
      ];

      setEvents(all.reverse());
      setStatus(` ${all.length} eventos encontrados`);
    } catch (err) {
      console.error(err);
      setStatus(" Erro ao buscar eventos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="eventlog-container">
      <h2 className="eventlog-title">
        <span className="eventlog-icon"></span>
        Histórico de Eventos
      </h2>

      <p className="description">
        Visualize todos os eventos registrados na blockchain: uploads, transferências, acessos e downloads.
      </p>

      <button
        onClick={fetchEvents}
        disabled={loading}
        className="btn-fetch"
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            Buscando eventos...
          </>
        ) : (
          <>
            <span></span>
            Buscar Eventos
          </>
        )}
      </button>

      {status && (
        <div className={`status-message ${status.includes('') ? 'success' : status.includes('') ? 'error' : 'info'}`}>
          {status}
        </div>
      )}

      {events.length > 0 && (
        <div className="events-list">
          {events.map((e, i) => (
            <div key={i} className={`event-card event-${e.type.toLowerCase()}`}>
              <div className="event-header">
                <span className="event-icon">{e.icon}</span>
                <span className="event-type">{e.type}</span>
                <span className="event-date">{e.timestamp}</span>
              </div>

              <div className="event-details">
                <div className="detail-row">
                  <span className="detail-label">Usuário</span>
                  <span className="detail-value user-value">
                    {e.user.slice(0, 8)}...{e.user.slice(-6)}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Hash</span>
                  <span className="detail-value hash-value">
                    {e.hash.slice(0, 12)}...{e.hash.slice(-12)}
                  </span>
                </div>

                {e.fileID && (
                  <div className="detail-row">
                    <span className="detail-label">File ID</span>
                    <span className="detail-value">{e.fileID}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .eventlog-container { animation: fadeIn 0.5s ease-out; }
        .eventlog-title { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .eventlog-icon { font-size: 1.8rem; }
        .description { color: rgba(243, 244, 246, 0.7); font-size: 0.9rem; margin-bottom: 1.5rem; line-height: 1.5; }
        .btn-fetch { width: 100%; background: linear-gradient(135deg, #338deeff 0%, #338deeff  100%); color: #fff; border: none; border-radius: 12px; padding: 1rem; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 1rem; }
        .btn-fetch:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 25px rgba(77, 166, 255, 0.6); }
        .btn-fetch:disabled { opacity: 0.6; cursor: not-allowed; }
        .spinner { width: 16px; height: 16px; border: 2px solid rgba(15, 15, 16, 0.3); border-top-color: #0f0f10; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .status-message { padding: 0.8rem; border-radius: 8px; font-size: 0.9rem; font-weight: 500; margin-bottom: 1rem; }
        .status-message.success { background: rgba(74, 222, 128, 0.1); border: 1px solid rgba(74, 222, 128, 0.3); color: #4ade80; }
        .status-message.error { background: rgba(248, 113, 113, 0.1); border: 1px solid rgba(248, 113, 113, 0.3); color: #f87171; }
        .status-message.info { background: rgba(77, 166, 255, 0.1); border: 1px solid rgba(77, 166, 255, 0.3); color: #4da6ff; }
        .events-list { display: flex; flex-direction: column; gap: 1rem; max-height: 600px; overflow-y: auto; padding-right: 0.5rem; }
        .events-list::-webkit-scrollbar { width: 6px; }
        .events-list::-webkit-scrollbar-track { background: rgba(28, 28, 30, 0.4); border-radius: 10px; }
        .events-list::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #4da6ff, #a57cff); border-radius: 10px; }
        .event-card { background: rgba(28, 28, 30, 0.6); border: 1px solid rgba(77, 166, 255, 0.3); border-radius: 12px; padding: 1rem; transition: all 0.3s ease; animation: slideIn 0.3s ease-out; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        .event-card:hover { transform: translateX(4px); border-color: rgba(77, 166, 255, 0.5); }
        .event-card.event-upload { border-left: 3px solid #545ef0ff; }
        .event-card.event-transferência { border-left: 3px solid #2384dfff; }
        .event-card.event-acesso { border-left: 3px solid #1310b9ff; }
        .event-card.event-download { border-left: 3px solid #0b1bf5ff; }
        .event-header { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.8rem; padding-bottom: 0.8rem; border-bottom: 1px solid rgba(77, 166, 255, 0.2); }
        .event-icon { font-size: 1.5rem; }
        .event-type { font-weight: 700; color: #4da6ff; flex-grow: 1; }
        .event-date { font-size: 0.75rem; color: rgba(243, 244, 246, 0.6); }
        .event-details { display: flex; flex-direction: column; gap: 0.6rem; }
        .detail-row { display: flex; flex-direction: column; gap: 0.2rem; }
        .detail-label { font-size: 0.7rem; font-weight: 600; color: rgba(243, 244, 246, 0.6); text-transform: uppercase; letter-spacing: 0.5px; }
        .detail-value { color: #f3f4f6; font-size: 0.85rem; }
        .user-value, .hash-value { font-family: 'Courier New', monospace; color: #4da6ff; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default EventLog;
