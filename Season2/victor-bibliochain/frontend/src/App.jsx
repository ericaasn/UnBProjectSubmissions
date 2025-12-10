import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ConectarCarteira from './components/ConectarCarteira';
import PainelAdmin from './components/PainelAdmin';
import CatalogoLivros from './components/CatalogoLivros';
import RegistroAluno from './components/RegistroAluno'; // <--- Importante: Componente de Matrícula
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contractConfig';

function App() {
  // --- Estados de Conexão ---
  const [provider, setProvider] = useState(null); 
  const [signer, setSigner] = useState(null); 
  const [conta, setConta] = useState(null); 
  const [isAdmin, setIsAdmin] = useState(false); 
  const [contrato, setContrato] = useState(null); 

  // --- Estados de Dados ---
  const [catalogo, setCatalogo] = useState([]); // Lista centralizada de livros
  const [loadingCatalogo, setLoadingCatalogo] = useState(false); // Status de carregamento
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Gatilho de atualização

  /**
   * Gatilho chamado pelos componentes filhos quando uma transação
   * é bem-sucedida, forçando o App a recarregar o catálogo.
   */
  const handleActionSuccess = () => {
    setRefreshTrigger(prev => prev + 1); 
  };

  /**
   * Busca o catálogo completo na blockchain.
   */
  const buscarCatalogo = async () => {
    if (!contrato) return; 

    setLoadingCatalogo(true);
    setCatalogo([]); 

    try {
      // Pega o total de livros (NFTs) criados
      const totalLivros = await contrato.tokenIdCounter();
      const livrosTemp = [];

      // Loop para buscar os dados de cada livro
      for (let i = 1; i <= totalLivros; i++) {
        const [uri, status, owner] = await Promise.all([
          contrato.tokenURI(i),      
          contrato.statusEmprestimo(i),
          contrato.ownerOf(i)
        ]);

        livrosTemp.push({
          id: i,
          uri: uri,     // O Título do livro
          status: status, // [endereco_usuario, prazo]
          owner: owner  // O dono atual (Biblioteca ou Aluno)
        });
      }
      setCatalogo(livrosTemp);
      
    } catch (error) {
      console.error("Erro ao buscar catálogo:", error);
    } finally {
      setLoadingCatalogo(false);
    }
  };

  // --- Efeito: Inicializa o contrato ---
  useEffect(() => {
    if (provider && signer) {
      const instanciaContrato = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      setContrato(instanciaContrato);
    }
  }, [provider, signer]);

  // --- Efeito: Atualiza o catálogo ---
  useEffect(() => {
    if (contrato) {
      buscarCatalogo();
    }
  }, [contrato, refreshTrigger]);

  return (
    <div className="App">
      <h1>BiblioChain</h1>
      
      {/* Componente de Login/Conexão */}
      <ConectarCarteira 
        setProvider={setProvider} 
        setSigner={setSigner} 
        setAdmin={setIsAdmin} 
        setConta={setConta}
      />
      
      <hr />

      {/* ÁREA DO ADMIN: Painel de Controle */}
      {isAdmin && contrato && (
        <PainelAdmin 
          contrato={contrato} 
          onActionSuccess={handleActionSuccess} 
          catalogo={catalogo} 
          isLoading={loadingCatalogo}
        />
      )}

      {/* ÁREA DO ALUNO: Registro de Matrícula */}
      {contrato && !isAdmin && (
        <RegistroAluno contrato={contrato} />
      )}
      
      <hr style={{ marginTop: '20px' }} />

      {/* ÁREA COMUM: Catálogo de Livros */}
      {contrato && (
        <CatalogoLivros 
          catalogo={catalogo} 
          loading={loadingCatalogo}
          onRefresh={buscarCatalogo} 
        />
      )}
    </div>
  );
}

export default App;