// CORREÇÃO: Importamos 'ZeroAddress' diretamente
import { ZeroAddress } from 'ethers';

// --- MUDANÇA: Recebe 'catalogo', 'loading' e 'onRefresh' via props ---
function CatalogoLivros({ catalogo, loading, onRefresh }) {

  const formatarData = (timestamp) => {
    // CORREÇÃO: Usamos 'ZeroAddress'
    if (timestamp === 0n) return 'Disponível'; 
    const data = new Date(Number(timestamp) * 1000); 
    return data.toLocaleDateString('pt-BR');
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h2>Catálogo de Livros</h2>
      
      <button onClick={onRefresh} disabled={loading}>
        {loading ? 'Atualizando...' : 'Atualizar Catálogo (Manual)'}
      </button>

      {/* Tabela para exibir os livros */}
      <table style={{ width: '100%', marginTop: '10px' }}>
        <thead>
          <tr>
            <th>ID do Livro</th>
            <th>Título (da "URI")</th>
            <th>Emprestado Para</th>
            <th>Devolução (Prazo)</th>
          </tr>
        </thead>
        <tbody>
          {catalogo.length === 0 && !loading && (
            <tr>
              <td colSpan="4">Nenhum livro mintado ainda.</td>
            </tr>
          )}
          {catalogo.map((livro) => (
            <tr key={livro.id}>
              <td>{livro.id}</td>
              <td>{livro.uri}</td>
              {/* CORREÇÃO: Usamos 'ZeroAddress' */}
              <td>{livro.status[0] === ZeroAddress ? '---' : livro.status[0]}</td>
              <td>{formatarData(livro.status[1])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CatalogoLivros;
