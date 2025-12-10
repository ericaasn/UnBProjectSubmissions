import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Este componente gerencia o estado da carteira e passa 
// o 'provider' e o 'signer' para os componentes filhos.
function ConectarCarteira({ setProvider, setSigner, setAdmin, setConta }) {
  const [conectado, setConectado] = useState(false);
  const [endereco, setEndereco] = useState('');

  // Endereço do Admin (Bibliotecário) - O que fez o deploy
  // (Nós importamos esta conta no Metamask)
  const ENDERECO_ADMIN = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'; 

  const conectar = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Por favor, instale o Metamask!');
      return;
    }

    try {
      // 1. Solicita ao Metamask (provider)
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // 2. Pede ao usuário para conectar a conta
      // Isso abre o pop-up do Metamask
      await provider.send('eth_requestAccounts', []);

      // 3. Pega o "Signer" (o usuário conectado)
      const signer = await provider.getSigner();
      const endUsuario = await signer.getAddress();

      // Passa os dados para o App.jsx
      setProvider(provider);
      setSigner(signer);
      setConta(endUsuario);

      // 4. Verifica se o usuário conectado é o Admin
      if (endUsuario.toLowerCase() === ENDERECO_ADMIN.toLowerCase()) {
        setAdmin(true);
      } else {
        setAdmin(false);
      }

      setEndereco(endUsuario);
      setConectado(true);

    } catch (error) {
      console.error("Erro ao conectar carteira:", error);
    }
  };

  return (
    <div>
      {!conectado ? (
        <button onClick={conectar}>Conectar Metamask</button>
      ) : (
        <p>Conectado como: {endereco} {setAdmin ? '(Admin)' : '(Aluno)'}</p>
      )}
    </div>
  );
}

export default ConectarCarteira;
