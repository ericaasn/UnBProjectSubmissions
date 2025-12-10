import { useState, useMemo } from 'react';
import { ZeroAddress, isAddress } from 'ethers';

function PainelAdmin({ contrato, onActionSuccess, catalogo, isLoading }) {
  
  const [mintURI, setMintURI] = useState('');
  const [mintStatus, setMintStatus] = useState('');

  // MUDANÇA: Agora é 'Matricula' e não 'Usuario'
  const [emprestarNomeBusca, setEmprestarNomeBusca] = useState('');
  const [emprestarMatricula, setEmprestarMatricula] = useState(''); 
  const [emprestarDias, setEmprestarDias] = useState('');
  const [emprestarStatus, setEmprestarStatus] = useState('');

  const [devolverNomeBusca, setDevolverNomeBusca] = useState('');
  const [devolverStatus, setDevolverStatus] = useState('');
  const [penalidadeUsuario, setPenalidadeUsuario] = useState('');
  const [penalidadeStatus, setPenalidadeStatus] = useState('');

  // Filtros (Iguais)
  const livrosDisponiveis = useMemo(() => {
    if (!catalogo) return [];
    return catalogo.filter(livro => livro.status[0] === ZeroAddress);
  }, [catalogo]); 

  const livrosEmprestados = useMemo(() => {
    if (!catalogo) return [];
    return catalogo.filter(livro => livro.status[0] !== ZeroAddress);
  }, [catalogo]); 

  // --- Manipuladores ---

  const handleMintar = async (e) => {
    e.preventDefault(); 
    const tituloLimpo = mintURI.trim(); 
    if (!tituloLimpo) return alert('Insira o TÍTULO do livro');
    setMintStatus('Mintando...');
    try {
      const tx = await contrato.mintarLivro(tituloLimpo); 
      await tx.wait(); 
      setMintStatus(`Livro "${tituloLimpo}" mintado!`);
      setMintURI(''); 
      onActionSuccess(); 
    } catch (error) {
      setMintStatus(`Erro: ${error.message}`);
    }
  };

  const handleEmprestar = async (e) => {
    e.preventDefault();
    const nomeLimpo = emprestarNomeBusca.trim().toLowerCase();
    
    // --- DEBUG: ADICIONE ISTO AQUI ---
    console.log("1. Nome digitado:", nomeLimpo);
    console.log("2. Catálogo completo:", catalogo);
    console.log("3. Livros Disponíveis (filtrados):", livrosDisponiveis);
    // ---------------------------------

    if (!nomeLimpo || !emprestarMatricula || !emprestarDias) {
      return alert('Preencha todos os campos.');
    }

    setEmprestarStatus('Verificando livro...');
    
    // Tenta encontrar
    const livroEncontrado = livrosDisponiveis.find(
      livro => livro.uri.trim().toLowerCase() === nomeLimpo
    );
    
    // --- DEBUG: ADICIONE ISTO ---
    console.log("4. Livro Encontrado:", livroEncontrado); 
    // ---------------------------

    if (!livroEncontrado) {
      setEmprestarStatus(`Erro: Livro "${nomeLimpo}" não encontrado na lista local.`);
      return;
    }
    // ... resto da função igual ...
    const tokenId = livroEncontrado.id.toString();
    
    setEmprestarStatus('Emprestando...');
    try {
      // MUDANÇA: Passa a Matrícula (string)
      const tx = await contrato.emprestarLivro(tokenId, emprestarMatricula, emprestarDias);
      await tx.wait();
      setEmprestarStatus(`Livro emprestado para a matrícula ${emprestarMatricula}!`);
      setEmprestarMatricula('');
      setEmprestarDias('');
      setEmprestarNomeBusca(''); 
      onActionSuccess(); 
    } catch (error) {
      console.error(error);
      // Tratamento para erro comum
      if(error.message && error.message.includes("Aluno nao registrado")) {
        setEmprestarStatus("Erro: Esta matrícula não existe no sistema!");
      } else {
        setEmprestarStatus(`Erro na transação (veja console).`);
      }
    }
  };

  const handleDevolver = async (e) => {
    e.preventDefault();
    const nomeLimpo = devolverNomeBusca.trim().toLowerCase();
    if (!nomeLimpo) return alert('Digite o nome do livro.');
    setDevolverStatus('Verificando...');
    const livroEncontrado = livrosEmprestados.find(
      livro => livro.uri.trim().toLowerCase() === nomeLimpo
    );
    if (!livroEncontrado) {
      setDevolverStatus('Erro: Livro não encontrado nos emprestados.');
      return;
    }
    const tokenId = livroEncontrado.id.toString();
    setDevolverStatus('Devolvendo...');
    try {
      const tx = await contrato.devolverLivro(tokenId); 
      await tx.wait();
      setDevolverStatus(`Livro devolvido com sucesso!`);
      setDevolverNomeBusca(''); 
      onActionSuccess(); 
    } catch (error) {
      setDevolverStatus(`Erro: ${error.message}`);
    }
  };
  
  const handleRemoverPenalidade = async (e) => {
    e.preventDefault();
    if (!penalidadeUsuario || !isAddress(penalidadeUsuario)) return alert('Endereço inválido');
    setPenalidadeStatus('Removendo...');
    try {
      const tx = await contrato.removerPenalidade(penalidadeUsuario);
      await tx.wait();
      setPenalidadeStatus(`Penalidade removida!`);
      setPenalidadeUsuario(''); 
      onActionSuccess(); 
    } catch (error) {
      setPenalidadeStatus(`Erro: ${error.message}`);
    }
  };

  const formStyle = { border: '1px solid #ccc', padding: '15px', margin: '10px 0', borderRadius: '8px' };
  const inputStyle = { padding: '8px', marginRight: '10px', width: '200px' };

  return (
    <fieldset disabled={isLoading}> 
      <legend>
        <h2>Painel do Bibliotecário {isLoading && <span style={{color:'blue', fontSize:'14px'}}>(Atualizando...)</span>}</h2>
      </legend>
      
      {/* Mintar */}
      <form onSubmit={handleMintar} style={formStyle}>
        <h3>Mintar Novo Livro</h3>
        <input 
          type="text" value={mintURI} onChange={(e) => setMintURI(e.target.value)} 
          placeholder="Título do Livro" style={inputStyle}
        />
        <button type="submit">Mintar</button>
        <p>{mintStatus}</p>
      </form>

      {/* Emprestar */}
      <form onSubmit={handleEmprestar} style={formStyle}>
        <h3>Emprestar Livro</h3>
        <input
          type="text" value={emprestarNomeBusca} onChange={(e) => setEmprestarNomeBusca(e.target.value)}
          placeholder="Nome do Livro (Disponível)" style={inputStyle}
        />
        {/* MUDANÇA: Input de Matrícula */}
        <input 
          type="text" value={emprestarMatricula} onChange={(e) => setEmprestarMatricula(e.target.value)} 
          placeholder="Matrícula do Aluno" style={inputStyle}
        />
        <input 
          type="number" value={emprestarDias} onChange={(e) => setEmprestarDias(e.target.value)} 
          placeholder="Dias" style={{...inputStyle, width: '60px'}}
        />
        <button type="submit">Emprestar</button>
        <p>{emprestarStatus}</p>
      </form>

      {/* Devolver */}
      <form onSubmit={handleDevolver} style={formStyle}>
        <h3>Devolver Livro</h3>
        <input
          type="text" value={devolverNomeBusca} onChange={(e) => setDevolverNomeBusca(e.target.value)}
          placeholder="Nome do Livro (Emprestado)" style={inputStyle}
        />
        <button type="submit">Devolver</button>
        <p>{devolverStatus}</p>
      </form>
      
      {/* Penalidade */}
      <form onSubmit={handleRemoverPenalidade} style={formStyle}>
        <h3>Remover Penalidade</h3>
        <input 
          type="text" value={penalidadeUsuario} onChange={(e) => setPenalidadeUsuario(e.target.value)} 
          placeholder="Endereço (0x...)" style={inputStyle}
        />
        <button type="submit">Remover</button>
        <p>{penalidadeStatus}</p>
      </form>
    </fieldset>
  );
}

export default PainelAdmin;