import { useState } from 'react';

function RegistroAluno({ contrato }) {
  const [matricula, setMatricula] = useState('');
  const [status, setStatus] = useState('');

  const handleRegistrar = async (e) => {
    e.preventDefault();
    if (!matricula) return alert('Digite sua matrícula');
    setStatus('Registrando na Blockchain...');

    try {
      const tx = await contrato.registrarAluno(matricula);
      await tx.wait();
      setStatus(`Sucesso! Matrícula "${matricula}" vinculada à sua carteira.`);
      setMatricula('');
    } catch (error) {
        console.error(error);
        if(error.message && error.message.includes("ja registrada")) {
            setStatus("Erro: Esta matrícula já tem dono!");
        } else {
            setStatus("Erro ao registrar.");
        }
    }
  };

  return (
    <div style={{ marginTop: '20px', border: '1px solid #28a745', padding: '15px', borderRadius: '8px' }}>
      <h3>🎓 Área do Aluno</h3>
      <p>Cadastre sua matrícula para poder pegar livros.</p>
      <form onSubmit={handleRegistrar}>
        <input 
          type="text" 
          placeholder="Sua Matrícula (ex: 202401)" 
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
          style={{ padding: '8px', marginRight: '10px' }}
        />
        <button type="submit">Vincular Carteira</button>
      </form>
      <p>{status}</p>
    </div>
  );
}

export default RegistroAluno;