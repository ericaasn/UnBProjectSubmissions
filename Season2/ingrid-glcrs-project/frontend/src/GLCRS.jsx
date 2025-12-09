// GLCRS.jsx
import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { 
  useAccount, 
  useConnect, 
  useDisconnect,
  useWalletClient 
} from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { contractAddress, contractABI } from './config.js'
import './GLCRS.css'

const GLCRS = () => {
  // Hooks do Wagmi
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: walletClient } = useWalletClient()
  
  // Estados
  const [activeTab, setActiveTab] = useState('criar')
  const [message, setMessage] = useState({ text: '', type: '' })
  const [loading, setLoading] = useState(false)
  const [provider, setProvider] = useState(null)
  const [contract, setContract] = useState(null)
  const [signer, setSigner] = useState(null)
  
  // Estados para formulários
  const [novoEvento, setNovoEvento] = useState({
    nome: '',
    duracaoTipo: 'horas',
    duracaoValor: '24',
    taxaPresenca: '1.0'
  })
  
  const [eventoSelecionado, setEventoSelecionado] = useState(null)
  const [detalhesEvento, setDetalhesEvento] = useState(null)
  const [novoConvidado, setNovoConvidado] = useState('')
  const [enderecoRemover, setEnderecoRemover] = useState('')
  const [enderecoPenalizar, setEnderecoPenalizar] = useState('')
  const [enderecoAprovar, setEnderecoAprovar] = useState('')
  const [enderecoRegistrarPresenca, setEnderecoRegistrarPresenca] = useState('')

  // Estados para listas
  const [listaConvidados, setListaConvidados] = useState([])
  const [listaConfirmados, setListaConfirmados] = useState([])
  const [listaSolicitacoes, setListaSolicitacoes] = useState([])

  // Inicializar provider e contrato usando walletClient
  useEffect(() => {
    const initProviderAndContract = async () => {
      if (isConnected && walletClient) {
        try {
          // Usar walletClient para criar provider e signer
          const web3Provider = new ethers.providers.Web3Provider(
            walletClient.transport
          )
          const signerInstance = web3Provider.getSigner()
          
          const contractInstance = new ethers.Contract(
            contractAddress, 
            contractABI, 
            signerInstance
          )
          
          setProvider(web3Provider)
          setSigner(signerInstance)
          setContract(contractInstance)
        } catch (error) {
          console.error('Erro ao inicializar:', error)
          showMessage('Erro ao conectar com a blockchain', 'error')
        }
      }
    }
    
    initProviderAndContract()
  }, [isConnected, walletClient])

  // Query para buscar todos os eventos
  const { data: todosEventos = [], refetch: refetchTodosEventos } = useQuery({
    queryKey: ['todosEventos', address, contract],
    queryFn: async () => {
      if (!contract || !address) return []
      try {
        console.log('Buscando todos os eventos...')
        const [nomes, chaves] = await contract.listarEventos()
        
        // Para cada evento, verificar se o usuário é anfitrião
        const eventosComDetalhes = await Promise.all(
          nomes.map(async (nome, index) => {
            try {
              const dados = await contract.verDadosBasicos(nome)
              const isAnfitriao = dados.anfitriao.toLowerCase() === address.toLowerCase()
              
              return {
                nome,
                chave: chaves[index],
                anfitriao: dados.anfitriao,
                isAnfitriao,
                prazoConfirmacao: dados.prazoConfirmacao.toNumber(),
                taxaPresenca: ethers.utils.formatEther(dados.taxaPresenca),
                cancelado: dados.cancelado,
                encerrado: dados.encerrado
              }
            } catch (error) {
              console.error(`Erro ao buscar detalhes de ${nome}:`, error)
              return {
                nome,
                chave: chaves[index],
                isAnfitriao: false,
                anfitriao: 'Desconhecido'
              }
            }
          })
        )
        
        return eventosComDetalhes
      } catch (error) {
        console.error('Erro ao buscar eventos:', error)
        return []
      }
    },
    enabled: !!contract && !!address,
    refetchInterval: 10000
  })

  // Separar eventos por tipo
  const meusEventos = todosEventos.filter(evento => evento.isAnfitriao)
  const eventosParaParticipar = todosEventos.filter(evento => !evento.isAnfitriao)

  // Converter duração para segundos
  const converterDuracaoParaSegundos = (valor, tipo) => {
    const valorNum = parseFloat(valor)
    if (isNaN(valorNum) || valorNum <= 0) return 86400 // 1 dia padrão
    
    switch(tipo) {
      case 'minutos':
        return Math.floor(valorNum * 60)
      case 'horas':
        return Math.floor(valorNum * 3600)
      case 'dias':
        return Math.floor(valorNum * 86400)
      case 'semanas':
        return Math.floor(valorNum * 604800)
      default:
        return Math.floor(valorNum * 3600) // horas como padrão
    }
  }

  // Formatar duração para exibição
  const formatarDuracao = (segundos) => {
    if (segundos < 60) {
      return `${segundos} segundos`
    } else if (segundos < 3600) {
      const minutos = Math.floor(segundos / 60)
      return `${minutos} minuto${minutos !== 1 ? 's' : ''}`
    } else if (segundos < 86400) {
      const horas = Math.floor(segundos / 3600)
      return `${horas} hora${horas !== 1 ? 's' : ''}`
    } else if (segundos < 604800) {
      const dias = Math.floor(segundos / 86400)
      return `${dias} dia${dias !== 1 ? 's' : ''}`
    } else {
      const semanas = Math.floor(segundos / 604800)
      return `${semanas} semana${semanas !== 1 ? 's' : ''}`
    }
  }

  // Função auxiliar para executar transações
  const executarTransacao = async (funcaoContrato, params = [], opcoes = {}) => {
    try {
      setLoading(true)
      
      // Configurar opções com gas
      const opcoesCompletas = {
        gasLimit: 600000, // Aumentado um pouco por segurança
        ...opcoes
      }
      
      // Executar transação
      const tx = await funcaoContrato(...params, opcoesCompletas)
      const receipt = await tx.wait()
      
      if (receipt.status === 0) {
        throw new Error('Transação revertida pelo contrato')
      }
      
      return receipt
      
    } catch (error) {
      console.error('Erro na transação:', error)
      
      // Mensagens específicas
      const errorMsg = error.toString().toLowerCase()
      if (errorMsg.includes('user rejected')) {
        throw new Error('Transação rejeitada pelo usuário')
      } else if (errorMsg.includes('insufficient funds')) {
        throw new Error('Saldo insuficiente')
      } else if (errorMsg.includes('execution reverted')) {
        const match = errorMsg.match(/execution reverted: (.+?)(?="|$)/)
        if (match && match[1]) {
          throw new Error(`Contrato reverteu: ${match[1]}`)
        }
        throw new Error('Contrato reverteu a execução')
      }
      
      throw new Error(`Falha na transação: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Buscar detalhes do evento
  const buscarDetalhesEvento = async (nome) => {
    if (!contract) return
    
    try {
      const dados = await contract.verDadosBasicos(nome)
      const isAnfitriao = dados.anfitriao.toLowerCase() === address.toLowerCase()
      
      const prazoTimestamp = dados.prazoConfirmacao.toNumber()
      const agora = Math.floor(Date.now() / 1000)
      const prazoExpirado = prazoTimestamp < agora
      
      // Verificar condições para poder encerrar
      const podeEncerrar = (
        isAnfitriao &&                // É o anfitrião
        !dados.cancelado &&           // Não está cancelado
        !dados.encerrado &&           // Não está encerrado
        prazoExpirado                 // Prazo já expirou
      )
      
      setDetalhesEvento({
        anfitriao: dados.anfitriao,
        nomeEvento: dados.nomeEvento,
        prazoConfirmacao: prazoTimestamp,
        prazoFormatado: new Date(prazoTimestamp * 1000).toLocaleString('pt-BR'),
        taxaPresenca: ethers.utils.formatEther(dados.taxaPresenca),
        cancelado: dados.cancelado,
        qtdConvidados: dados.qtdConvidados.toNumber(),
        hashCriacao: dados.hashCriacao,
        hashFinalizacao: dados.hashFinalizacao,
        encerrado: dados.encerrado,
        isAnfitriao: isAnfitriao,
        prazoExpirado: prazoExpirado,
        podeEncerrar: podeEncerrar
      })
      await carregarListas()
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error)
      showMessage('Erro ao buscar detalhes do evento', 'error')
    }
  }

  // Função para criar evento
  const criarEvento = async () => {
    if (!contract || !address) {
      showMessage('Conecte sua carteira primeiro!', 'error')
      return
    }

    if (!novoEvento.nome.trim()) {
      showMessage('Digite um nome para o evento', 'error')
      return
    }

    if (!novoEvento.duracaoValor || parseFloat(novoEvento.duracaoValor) <= 0) {
      showMessage('Digite uma duração válida', 'error')
      return
    }

    try {
      const taxaWei = ethers.utils.parseEther(novoEvento.taxaPresenca)
      const duracaoSegundos = converterDuracaoParaSegundos(
        novoEvento.duracaoValor, 
        novoEvento.duracaoTipo
      )
      
      await executarTransacao(
        contract.criarEvento,
        [novoEvento.nome, duracaoSegundos, taxaWei]
      )
      
      showMessage('Evento criado com sucesso!', 'success')
      setNovoEvento({ 
        nome: '', 
        duracaoTipo: 'horas', 
        duracaoValor: '24',
        taxaPresenca: '0.01' 
      })
      
      // Atualizar detalhes do evento recém-criado
      await buscarDetalhesEvento(novoEvento.nome)
      refetchTodosEventos()
      
    } catch (error) {
      showMessage(`Erro: ${error.message}`, 'error')
    }
  }

  // Adicionar convidado
  const adicionarConvidado = async () => {
    if (!contract || !eventoSelecionado || !novoConvidado) {
      showMessage('Preencha todos os campos!', 'error')
      return
    }
    
    try {
      await executarTransacao(
        contract.adicionarConvidado,
        [eventoSelecionado, novoConvidado]
      )
      
      showMessage('Convidado adicionado com sucesso!', 'success')
      setNovoConvidado('')
      await buscarDetalhesEvento(eventoSelecionado)
      await carregarListas()
    } catch (error) {
      showMessage(`Erro: ${error.message}`, 'error')
    }
  }

  // Remover convidado
  const removerConvidado = async () => {
    if (!contract || !eventoSelecionado || !enderecoRemover) {
      showMessage('Preencha todos os campos!', 'error')
      return
    }
    
    try {
      await executarTransacao(
        contract.removerConvidado,
        [eventoSelecionado, enderecoRemover]
      )
      
      showMessage('Convidado removido com sucesso!', 'success')
      setEnderecoRemover('')
      await carregarListas()
    } catch (error) {
      showMessage(`Erro: ${error.message}`, 'error')
    }
  }

  // Aprovar solicitação
  const aprovarSolicitacao = async () => {
    if (!contract || !eventoSelecionado || !enderecoAprovar) {
      showMessage('Preencha todos os campos!', 'error')
      return
    }
    
    try {
      await executarTransacao(
        contract.aprovarSolicitacao,
        [eventoSelecionado, enderecoAprovar]
      )
      
      showMessage('Solicitação aprovada com sucesso!', 'success')
      setEnderecoAprovar('')
      await carregarListas()
    } catch (error) {
      showMessage(`Erro: ${error.message}`, 'error')
    }
  }

  // === CONFIRMAR PRESENÇA 
  const confirmarPresenca = async () => {
    if (!contract || !eventoSelecionado) {
      showMessage('Selecione um evento primeiro!', 'error')
      return
    }
    
    try {
      setLoading(true)
      console.log('--- INICIANDO DIAGNÓSTICO DE CONFIRMAÇÃO ---')
      
      // 1. Verificar dados frescos do contrato
      const dados = await contract.verDadosBasicos(eventoSelecionado)
      const valorTaxa = dados.taxaPresenca
      
      console.log(`Evento: "${eventoSelecionado}"`)
      console.log(`Taxa requerida (Wei): ${valorTaxa.toString()}`)
      console.log(`Quem está pagando: ${address}`)

      // 2. SIMULAÇÃO (callStatic)
      // Tenta executar sem gastar gás. Se falhar, retorna o erro exato do Solidity.
      try {
        await contract.callStatic.confirmarPresenca(
          eventoSelecionado,
          { value: valorTaxa, from: address }
        )
        console.log("Simulação: SUCESSO. Contrato aceita a transação.")
      } catch (erroSimulacao) {
        // Tenta extrair a razão do erro de diferentes lugares que o Ethers pode colocar
        let motivo = "Erro desconhecido"
        
        if (erroSimulacao.reason) motivo = erroSimulacao.reason
        else if (erroSimulacao.data && erroSimulacao.data.message) motivo = erroSimulacao.data.message
        else if (erroSimulacao.message) motivo = erroSimulacao.message
        
        console.error("Erro capturado na simulação:", erroSimulacao)
        
        // Mensagens amigáveis para erros comuns
        if (motivo.includes("not invited")) throw new Error("BLOQUEADO: Você não está na lista de convidados (verifique se foi aprovado).")
        if (motivo.includes("confirmed")) throw new Error("BLOQUEADO: Você já confirmou presença neste evento.")
        if (motivo.includes("expired")) throw new Error("BLOQUEADO: O prazo de confirmação já expirou.")
        if (motivo.includes("value")) throw new Error("BLOQUEADO: Valor da taxa incorreto.")
        
        throw new Error(`CONTRATO RECUSOU: ${motivo}`)
      }

      // 3. Executar Transação Real (Se chegou aqui, a simulação passou)
      console.log("Enviando transação real...")
      const tx = await contract.confirmarPresenca(
        eventoSelecionado,
        { 
          value: valorTaxa,
          gasLimit: 600000 // Limite seguro
        }
      )
      
      console.log("Hash da transação:", tx.hash)
      await tx.wait()
      
      showMessage('Presença confirmada com sucesso!', 'success')
      await carregarListas()
      refetchTodosEventos()
      
    } catch (error) {
      console.error("FALHA DETALHADA:", error)
      showMessage(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Cancelar presença
  const cancelarPresenca = async () => {
    if (!contract || !eventoSelecionado) {
      showMessage('Selecione um evento primeiro!', 'error')
      return
    }
    
    try {
      await executarTransacao(
        contract.cancelarPresenca,
        [eventoSelecionado]
      )
      
      showMessage('Presença cancelada com sucesso!', 'success')
      await carregarListas()
    } catch (error) {
      console.warn('Tentando solicitar reembolso...')
      try {
        await executarTransacao(
          contract.solicitarReembolso,
          [eventoSelecionado]
        )
        showMessage('Reembolso solicitado com sucesso!', 'success')
      } catch (errorReembolso) {
        showMessage(`Erro: ${errorReembolso.message}`, 'error')
      }
    }
  }

  // Solicitar devolução por comparecimento
  const solicitarDevolucao = async () => {
    if (!contract || !eventoSelecionado) {
      showMessage('Selecione um evento primeiro!', 'error')
      return
    }
    
    try {
      await executarTransacao(
        contract.solicitarDevolucaoPorComparecimento,
        [eventoSelecionado]
      )
      
      showMessage('Devolução solicitada com sucesso!', 'success')
    } catch (error) {
      showMessage(`Erro: ${error.message}`, 'error')
    }
  }

  // Sacar fundos
  const sacarFundos = async () => {
    if (!contract) {
      showMessage('Conecte sua carteira primeiro!', 'error')
      return
    }
    
    try {
      await executarTransacao(contract.sacar, [])
      showMessage('Fundos sacados com sucesso!', 'success')
    } catch (error) {
      showMessage(`Erro: ${error.message}`, 'error')
    }
  }

  // Penalizar ausência
  const penalizarAusencia = async () => {
    if (!contract || !eventoSelecionado || !enderecoPenalizar) {
      showMessage('Preencha todos os campos!', 'error')
      return
    }
    
    try {
      await executarTransacao(
        contract.penalizarAusencia,
        [eventoSelecionado, enderecoPenalizar]
      )
      
      showMessage('Ausência penalizada com sucesso!', 'success')
      setEnderecoPenalizar('')
      await carregarListas()
    } catch (error) {
      showMessage(`Erro: ${error.message}`, 'error')
    }
  }

  // Registrar presença
  const registrarPresenca = async () => {
    if (!contract || !eventoSelecionado || !enderecoRegistrarPresenca) {
      showMessage('Preencha todos os campos!', 'error')
      return
    }
    
    try {
      await executarTransacao(
        contract.registrarPresenca,
        [eventoSelecionado, enderecoRegistrarPresenca]
      )
      
      showMessage('Presença registrada com sucesso!', 'success')
      setEnderecoRegistrarPresenca('')
      await carregarListas()
    } catch (error) {
      showMessage(`Erro: ${error.message}`, 'error')
    }
  }

  // Carregar todas as listas
  const carregarListas = async () => {
    if (!contract || !eventoSelecionado) return
    
    try {
      const [convidados, confirmados, solicitacoes] = await Promise.all([
        contract.listarConvidados(eventoSelecionado),
        contract.presencasConfirmadas(eventoSelecionado),
        contract.verSolicitacoes(eventoSelecionado)
      ])
      
      setListaConvidados(convidados || [])
      setListaConfirmados(confirmados || [])
      setListaSolicitacoes(solicitacoes || [])
    } catch (error) {
      console.error('Erro ao carregar listas:', error)
    }
  }

  // Solicitar entrada em evento
  const solicitarEntrada = async (nomeEvento) => {
    if (!contract) return
    
    try {
      await executarTransacao(
        contract.solicitarEntrada,
        [nomeEvento]
      )
      
      showMessage('Solicitação enviada com sucesso!', 'success')
      if (nomeEvento === eventoSelecionado) {
        await carregarListas()
      }
      refetchTodosEventos()
    } catch (error) {
      showMessage(`Erro: ${error.message}`, 'error')
    }
  }

  // Encerrar evento
  const encerrarEvento = async () => {
    if (!contract || !eventoSelecionado) {
      showMessage('Selecione um evento primeiro!', 'error')
      return
    }
    
    try {
      // Primeiro verificar se podemos encerrar
      if (!detalhesEvento) {
        await buscarDetalhesEvento(eventoSelecionado)
      }
      
      if (!detalhesEvento?.isAnfitriao) {
        showMessage('Apenas o anfitrião pode encerrar o evento!', 'error')
        return
      }
      
      if (detalhesEvento.encerrado) {
        showMessage('Este evento já foi encerrado!', 'error')
        return
      }
      
      if (detalhesEvento.cancelado) {
        showMessage('Evento cancelado não pode ser encerrado!', 'error')
        return
      }
      
      // Verificar se o prazo já expirou
      const agora = Math.floor(Date.now() / 1000)
      if (detalhesEvento.prazoConfirmacao > agora) {
        showMessage('Aguarde o prazo de confirmação expirar para encerrar o evento!', 'error')
        return
      }
      
      // Tentar encerrar o evento
      showMessage('Encerrando evento...', 'info')
      
      await executarTransacao(
        contract.encerrarEvento,
        [eventoSelecionado]
      )
      
      // Atualizar hash de finalização e status
      const updatedDetalhes = { ...detalhesEvento }
      updatedDetalhes.encerrado = true
      updatedDetalhes.podeEncerrar = false
      setDetalhesEvento(updatedDetalhes)
      
      showMessage('Evento encerrado com sucesso!', 'success')
      await buscarDetalhesEvento(eventoSelecionado)
      refetchTodosEventos()
      
    } catch (error) {
      showMessage(`Erro: ${error.message}`, 'error')
    }
  }

  // Cancelar evento
  const cancelarEvento = async () => {
    if (!contract || !eventoSelecionado) return
    
    try {
      await executarTransacao(
        contract.cancelarEvento,
        [eventoSelecionado]
      )
      
      // Atualizar status
      const updatedDetalhes = { ...detalhesEvento }
      updatedDetalhes.cancelado = true
      setDetalhesEvento(updatedDetalhes)
      
      showMessage('Evento cancelado com sucesso!', 'success')
      await buscarDetalhesEvento(eventoSelecionado)
      refetchTodosEventos()
    } catch (error) {
      showMessage(`Erro: ${error.message}`, 'error')
    }
  }

  // Mostrar mensagens
  const showMessage = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 5000)
  }

  // Conectar wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        showMessage('MetaMask não encontrada! Instale a extensão.', 'error')
        return
      }
      
      await connect({ connector: connectors[0] })
    } catch (error) {
      console.error('Erro ao conectar:', error)
      showMessage('Erro ao conectar carteira', 'error')
    }
  }

  // Tela de desconectado
  if (!isConnected) {
    return (
      <div className="glcrs-container">
        <div className="hero-section">
          <h1 className="gradient-text">GLCRS</h1>
          <h2>Gerenciador de Listas de Convidados para Reuniões Sociais</h2>
          <button 
            className="connect-btn" 
            onClick={connectWallet}
          >
            🔗 Conectar Carteira
          </button>
          
          <div className="instructions">
            <h3>📋 Instruções:</h3>
            <ol>
              <li>Instale o MetaMask em seu navegador</li>
              <li>Adicione a CESS Testnet à sua carteira:
                <ul>
                  <li><strong>Nome da Rede:</strong> CESS Testnet</li>
                  <li><strong>RPC URL:</strong> https://testnet-rpc.cess.network</li>
                  <li><strong>ID da Chain:</strong> 11330</li>
                  <li><strong>Símbolo:</strong> TCESS</li>
                </ul>
              </li>
              <li>Obtenha TCESS no faucet da testnet</li>
              <li>Conecte sua carteira para começar</li>
            </ol>
          </div>
          
          <div className="features">
            <div className="feature">
              <h3>🎉 Crie Eventos</h3>
              <p>Crie eventos sociais com confirmação de presença via blockchain</p>
            </div>
            <div className="feature">
              <h3>👥 Gerencie Convidados</h3>
              <p>Adicione e remova convidados de forma transparente</p>
            </div>
            <div className="feature">
              <h3>✅ Confirme Presenças</h3>
              <p>Registre presenças com segurança na blockchain</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="glcrs-container">
      {/* Header */}
      <header className="glcrs-header">
        <div className="logo">
          <h1 className="gradient-text">GLCRS</h1>
          <p>Gerencie suas Listas de Reuniões Sociais com Blockchain</p>
        </div>
        <div className="wallet-info">
          <span className="wallet-address" title={address}>
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Não conectado'}
          </span>
          <button className="disconnect-btn" onClick={disconnect}>
            Desconectar
          </button>
        </div>
      </header>

      {/* Message Alert */}
      {message.text && (
        <div className={`message-alert ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Processando transação...</p>
        </div>
      )}

      {/* Tabs de Navegação */}
      <div className="tabs">
        <button 
          className={activeTab === 'criar' ? 'active' : ''}
          onClick={() => {
            setActiveTab('criar')
            setEventoSelecionado(null)
            setDetalhesEvento(null)
          }}
        >
          🎉 Criar Evento
        </button>
        <button 
          className={activeTab === 'gerenciar' ? 'active' : ''}
          onClick={() => {
            setActiveTab('gerenciar')
            setEventoSelecionado(null)
            setDetalhesEvento(null)
          }}
        >
          📋 Meus Eventos ({meusEventos.length})
        </button>
        <button 
          className={activeTab === 'participar' ? 'active' : ''}
          onClick={() => {
            setActiveTab('participar')
            setEventoSelecionado(null)
            setDetalhesEvento(null)
          }}
        >
          ✅ Participar ({eventosParaParticipar.length})
        </button>
        <button 
          className={activeTab === 'anfitriao' ? 'active' : ''}
          onClick={() => {
            setActiveTab('anfitriao')
            if (eventoSelecionado) {
              carregarListas()
            }
          }}
        >
          👑 Anfitrião
        </button>
        <button 
          className={activeTab === 'convidado' ? 'active' : ''}
          onClick={() => {
            setActiveTab('convidado')
            if (eventoSelecionado) {
              carregarListas()
            }
          }}
        >
          👋 Convidado
        </button>
        {eventoSelecionado && (
          <button 
            className={activeTab === 'detalhes' ? 'active' : ''}
            onClick={() => {
              setActiveTab('detalhes')
              carregarListas()
            }}
          >
            🔍 Detalhes
          </button>
        )}
      </div>

      {/* Conteúdo das Tabs */}
      <div className="tab-content">
        {/* Tab: Criar Evento */}
        {activeTab === 'criar' && (
          <div className="form-card">
            <h2>🎉 Criar Novo Evento</h2>
            <div className="form-group">
              <label>Nome do Evento *</label>
              <input
                type="text"
                value={novoEvento.nome}
                onChange={(e) => setNovoEvento({...novoEvento, nome: e.target.value})}
                placeholder="Ex: Confra de Fim de Ano"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Duração para Confirmação *</label>
              <div className="duration-input">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={novoEvento.duracaoValor}
                  onChange={(e) => {
                    const valor = e.target.value
                    if (valor === '' || (/^\d+$/.test(valor) && parseInt(valor) > 0)) {
                      setNovoEvento({...novoEvento, duracaoValor: valor})
                    }
                  }}
                  placeholder="Ex: 24"
                  className="form-input duration-value"
                />
                <select
                  value={novoEvento.duracaoTipo}
                  onChange={(e) => setNovoEvento({...novoEvento, duracaoTipo: e.target.value})}
                  className="form-select duration-type"
                >
                  <option value="minutos">Minutos</option>
                  <option value="horas">Horas</option>
                  <option value="dias">Dias</option>
                  <option value="semanas">Semanas</option>
                </select>
              </div>
              <small>
                Duração: {novoEvento.duracaoValor} {novoEvento.duracaoTipo} 
                ({formatarDuracao(converterDuracaoParaSegundos(novoEvento.duracaoValor, novoEvento.duracaoTipo))})
              </small>
            </div>
            
            <div className="form-group">
              <label>Taxa de Presença (TCESS) *</label>
              <input
                type="text"
                value={novoEvento.taxaPresenca}
                onChange={(e) => {
                  const value = e.target.value
                  if (/^\d*\.?\d*$/.test(value)) {
                    setNovoEvento({...novoEvento, taxaPresenca: value})
                  }
                }}
                placeholder="0.01"
                className="form-input"
              />
              <small>Valor que os convidados pagarão para confirmar presença</small>
            </div>
            
            <button 
              className="primary-btn"
              onClick={criarEvento}
              disabled={loading || !novoEvento.nome.trim() || !novoEvento.duracaoValor}
            >
              {loading ? 'Criando...' : '✨ Criar Evento'}
            </button>
            
            <div className="info-box">
              <h4>ℹ️ Como funciona:</h4>
              <ul>
                <li>Os convidados devem pagar a taxa para confirmar presença</li>
                <li>O valor fica bloqueado até o fim do evento</li>
                <li>Quem comparecer recebe o valor de volta</li>
                <li>Faltas são penalizadas (o valor vai para o anfitrião)</li>
                <li>O evento pode ser encerrado pelo anfitrião após o prazo de confirmação</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab: Gerenciar Eventos (APENAS eventos onde sou anfitrião) */}
        {activeTab === 'gerenciar' && (
          <div className="manage-section">
            <h2>📋 Meus Eventos</h2>
            <p className="section-subtitle">
              Eventos onde você é o anfitrião ({meusEventos.length})
            </p>
            
            {meusEventos.length > 0 ? (
              <div className="events-grid">
                {meusEventos.map((evento, index) => (
                  <div key={index} className="event-card">
                    <h3>{evento.nome} {evento.isAnfitriao && '👑'}</h3>
                    <div className="event-info" style={{ marginBottom: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9em', color: '#666' }}>
                        <span>Taxa: {evento.taxaPresenca} TCESS</span>
                        <span>
                          {evento.cancelado ? '❌ Cancelado' : 
                           evento.encerrado ? '🏁 Encerrado' : 
                           '✅ Ativo'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8em', color: '#888', marginTop: '5px' }}>
                        Prazo: {new Date(evento.prazoConfirmacao * 1000).toLocaleString()}
                      </div>
                    </div>
                    <div className="event-actions">
                      <button 
                        className="view-btn"
                        onClick={async () => {
                          setEventoSelecionado(evento.nome)
                          await buscarDetalhesEvento(evento.nome)
                          setActiveTab('detalhes')
                        }}
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>👑 Você ainda não criou nenhum evento</p>
                <p>Crie seu primeiro evento na aba "Criar Evento"</p>
                <button 
                  className="primary-btn" 
                  onClick={() => setActiveTab('criar')}
                >
                  Criar Primeiro Evento
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab: Participar de Eventos (APENAS eventos onde NÃO sou anfitrião) */}
        {activeTab === 'participar' && (
          <div className="participate-section">
            <h2>✅ Participar de Eventos</h2>
            <p className="section-subtitle">
              Eventos disponíveis para participar ({eventosParaParticipar.length})
            </p>
            
            {eventosParaParticipar.length > 0 ? (
              <div className="events-list">
                {eventosParaParticipar.map((evento, index) => (
                  <div key={index} className="event-item">
                    <div className="event-info">
                      <h3>{evento.nome}</h3>
                      <div style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
                        <div>Anfitrião: {evento.anfitriao.slice(0, 8)}...{evento.anfitriao.slice(-6)}</div>
                        <div>Taxa: {evento.taxaPresenca} TCESS</div>
                        <div>
                          Status: 
                          {evento.cancelado ? ' ❌ Cancelado' : 
                           evento.encerrado ? ' 🏁 Encerrado' : 
                           ' ✅ Ativo'}
                        </div>
                      </div>
                    </div>
                    <div className="event-actions">
                      <button 
                        className="view-btn"
                        onClick={async () => {
                          setEventoSelecionado(evento.nome)
                          await buscarDetalhesEvento(evento.nome)
                          setActiveTab('detalhes')
                        }}
                      >
                        Ver Detalhes
                      </button>
                      {!evento.cancelado && !evento.encerrado && (
                        <button 
                          className="join-btn"
                          onClick={() => solicitarEntrada(evento.nome)}
                        >
                          Solicitar Entrada
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>📭 Nenhum evento disponível para participar</p>
                <p>Os eventos criados por outros usuários aparecerão aqui</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Detalhes do Evento */}
        {activeTab === 'detalhes' && eventoSelecionado && (
          <div className="details-section">
            <div className="details-header">
              <button 
                className="back-btn"
                onClick={() => {
                  // Voltar para a aba correta baseado no tipo de evento
                  const eventoAtual = todosEventos.find(e => e.nome === eventoSelecionado)
                  if (eventoAtual?.isAnfitriao) {
                    setActiveTab('gerenciar')
                  } else {
                    setActiveTab('participar')
                  }
                }}
              >
                ← Voltar
              </button>
              <h2>{eventoSelecionado}</h2>
              <div className="user-role-badge">
                {detalhesEvento?.isAnfitriao ? '👑 Anfitrião' : '👋 Convidado'}
              </div>
            </div>
            
            {detalhesEvento ? (
              <>
                <div className="details-grid">
                  {/* Informações Básicas */}
                  <div className="info-card">
                    <h3>📋 Informações do Evento</h3>
                    
                    <div className="info-item">
                      <div className="info-row">
                        <span className="info-label">Anfitrião:</span>
                        <span className="info-value" title={detalhesEvento.anfitriao}>
                          {detalhesEvento.anfitriao === address ? 'Você' : `${detalhesEvento.anfitriao.slice(0, 8)}...${detalhesEvento.anfitriao.slice(-6)}`}
                        </span>
                      </div>
                    </div>
                    
                    <div className="info-item">
                      <div className="info-row">
                        <span className="info-label">Prazo de Confirmação:</span>
                        <span className={`info-value ${!detalhesEvento.prazoExpirado ? 'valid' : 'expired'}`}>
                          {detalhesEvento.prazoFormatado}
                        </span>
                      </div>
                      <small>
                        {!detalhesEvento.prazoExpirado ? '✅ Aceitando confirmações' : '❌ Prazo expirado'}
                      </small>
                    </div>
                    
                    <div className="info-item">
                      <div className="info-row">
                        <span className="info-label">Taxa de Presença:</span>
                        <span className="info-value fee">
                          {detalhesEvento.taxaPresenca} TCESS
                        </span>
                      </div>
                    </div>
                    
                    <div className="info-item">
                      <div className="info-row">
                        <span className="info-label">Convidados na Lista:</span>
                        <span className="info-value count">
                          {detalhesEvento.qtdConvidados}
                        </span>
                      </div>
                    </div>
                    
                    <div className="info-item">
                      <div className="info-row">
                        <span className="info-label">Status do Evento:</span>
                        <span className={`status-badge ${
                          detalhesEvento.encerrado ? 'ended' :
                          detalhesEvento.cancelado ? 'cancelled' :
                          detalhesEvento.prazoExpirado ? 'expired' :
                          'active'
                        }`}>
                          {detalhesEvento.encerrado ? '🏁 Encerrado' : 
                           detalhesEvento.cancelado ? '❌ Cancelado' : 
                           detalhesEvento.prazoExpirado ? '⏰ Expirado' :
                           '✅ Ativo'}
                        </span>
                      </div>
                    </div>

                    {/* Status de Encerramento */}
                    {detalhesEvento.prazoExpirado && !detalhesEvento.encerrado && detalhesEvento.isAnfitriao && (
                      <div className="info-item">
                        <div className="expiration-warning">
                          <span style={{color: '#ff6b6b', fontWeight: 'bold'}}>⚠️ Atenção:</span>
                          <p style={{marginTop: '5px', fontSize: '0.9em'}}>
                            O prazo de confirmação expirou. Você pode encerrar o evento para processar as penalidades.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hashes e Transações */}
                  <div className="info-card">
                    <h3>🔗 Transações Blockchain</h3>
                    
                    <div className="hash-item">
                      <div className="hash-row">
                        <span className="hash-label">Hash de Criação:</span>
                        <div className="hash-value">
                          {detalhesEvento.hashCriacao && detalhesEvento.hashCriacao !== '0x0000000000000000000000000000000000000000000000000000000000000000' 
                            ? detalhesEvento.hashCriacao 
                            : '⏳ Aguardando confirmação...'}
                        </div>
                      </div>
                      <small>Transação que criou este evento</small>
                    </div>
                    
                    <div className="hash-item">
                      <div className="hash-row">
                        <span className="hash-label">Hash de Finalização:</span>
                        <div className="hash-value">
                          {detalhesEvento.hashFinalizacao && detalhesEvento.hashFinalizacao !== '0x0000000000000000000000000000000000000000000000000000000000000000' 
                            ? detalhesEvento.hashFinalizacao 
                            : detalhesEvento.encerrado ? '🏁 Evento encerrado' : '⏳ Não finalizado'}
                        </div>
                      </div>
                      <small>
                        {detalhesEvento.encerrado ? 'Transação que encerrou o evento' : 'Aguardando encerramento'}
                      </small>
                    </div>
                    
                    {/* Status de Cancelamento */}
                    <div className={`status-card ${detalhesEvento.cancelado ? 'cancelled' : 'active'}`}>
                      <div className="status-content">
                        <span className="status-icon">
                          {detalhesEvento.cancelado ? '❌' : '✅'}
                        </span>
                        <div>
                          <h4>
                            {detalhesEvento.cancelado ? 'Evento CANCELADO' : 'Evento ATIVO'}
                          </h4>
                          <p>
                            {detalhesEvento.cancelado 
                              ? 'Este evento foi cancelado pelo anfitrião. Os convidados podem solicitar reembolso.'
                              : 'Este evento está ativo e funcionando normalmente.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Listas */}
                <div className="lists-section">
                  {/* Lista de Solicitações */}
                  {listaSolicitacoes.length > 0 && (
                    <div className="list-card solicitation-list">
                      <h3>
                        <span className="list-icon">🔔</span>
                        Solicitações Pendentes ({listaSolicitacoes.length})
                      </h3>
                      <ul>
                        {listaSolicitacoes.map((addr, index) => (
                          <li key={index}>
                            <code>
                              {addr.slice(0, 12)}...{addr.slice(-8)}
                            </code>
                            {detalhesEvento.isAnfitriao && (
                              <button
                                onClick={() => {
                                  setEnderecoAprovar(addr)
                                  aprovarSolicitacao()
                                }}
                                className="approve-btn"
                              >
                                Aprovar
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Lista de Convidados */}
                  {listaConvidados.length > 0 && (
                    <div className="list-card guest-list">
                      <h3>
                        <span className="list-icon">👥</span>
                        Convidados ({listaConvidados.length})
                      </h3>
                      <ul>
                        {listaConvidados.map((addr, index) => (
                          <li key={index}>
                            {addr}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Lista de Confirmados */}
                  {listaConfirmados.length > 0 && (
                    <div className="list-card confirmed-list">
                      <h3>
                        <span className="list-icon">✅</span>
                        Confirmados ({listaConfirmados.length})
                      </h3>
                      <ul>
                        {listaConfirmados.map((addr, index) => (
                          <li key={index}>
                            {addr}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Ações Rápidas */}
                {(detalhesEvento.isAnfitriao || (!detalhesEvento.prazoExpirado && !detalhesEvento.cancelado)) && (
                  <div className="quick-actions">
                    <h3>⚡ Ações Rápidas</h3>
                    <div className="actions-grid">
                      {detalhesEvento.isAnfitriao && !detalhesEvento.encerrado && !detalhesEvento.cancelado && (
                        <>
                          {detalhesEvento.podeEncerrar && (
                            <button 
                              className="action-btn end-btn"
                              onClick={encerrarEvento}
                              disabled={loading}
                              title={!detalhesEvento.podeEncerrar ? 
                                "Condições não atendidas para encerrar" : 
                                "Encerrar evento"}
                            >
                              {loading ? 'Encerrando...' : 
                               detalhesEvento.prazoExpirado ? '⏰ Encerrar Evento (Expirado)' : 
                               '🏁 Encerrar Evento'}
                            </button>
                          )}
                          <button 
                            className="action-btn cancel-btn"
                            onClick={cancelarEvento}
                            disabled={loading || detalhesEvento.encerrado}
                          >
                            {detalhesEvento.cancelado ? 'Evento Cancelado' : '❌ Cancelar Evento'}
                          </button>
                        </>
                      )}
                      
                      {!detalhesEvento.isAnfitriao && !detalhesEvento.prazoExpirado && !detalhesEvento.cancelado && (
                        <button 
                          className="action-btn confirm-btn"
                          onClick={confirmarPresenca}
                          disabled={loading}
                        >
                          ✅ Confirmar Presença ({detalhesEvento.taxaPresenca} TCESS)
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="loading-state">
                <p>Carregando detalhes do evento...</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Área do Anfitrião */}
        {activeTab === 'anfitriao' && (
          <div className="anfitriao-section">
            <h2>👑 Área do Anfitrião</h2>
            <p className="section-subtitle">
              Gerencie eventos onde você é anfitrião
            </p>
            
            <div className="event-selector">
              <h3>Selecione um Evento</h3>
              <select
                value={eventoSelecionado || ''}
                onChange={(e) => {
                  setEventoSelecionado(e.target.value)
                  if (e.target.value) {
                    buscarDetalhesEvento(e.target.value)
                  }
                }}
                className="form-select"
              >
                <option value="">Selecione um evento...</option>
                {meusEventos.map((evento, index) => (
                  <option key={index} value={evento.nome}>
                    {evento.nome} {evento.isAnfitriao && '👑'}
                  </option>
                ))}
              </select>
            </div>
            
            {eventoSelecionado && detalhesEvento ? (
              <div className="anfitriao-actions">
                {/* Adicionar Convidado */}
                <div className="action-card">
                  <h3>👥 Adicionar Convidado</h3>
                  <input
                    type="text"
                    value={novoConvidado}
                    onChange={(e) => setNovoConvidado(e.target.value)}
                    placeholder="Endereço Ethereum (0x...)"
                    className="form-input"
                  />
                  <button 
                    className="action-btn"
                    onClick={adicionarConvidado}
                    disabled={loading || !novoConvidado}
                  >
                    {loading ? 'Adicionando...' : 'Adicionar Convidado'}
                  </button>
                </div>

                {/* Remover Convidado */}
                <div className="action-card">
                  <h3>🗑️ Remover Convidado</h3>
                  <input
                    type="text"
                    value={enderecoRemover}
                    onChange={(e) => setEnderecoRemover(e.target.value)}
                    placeholder="Endereço do convidado"
                    className="form-input"
                  />
                  <button 
                    className="action-btn"
                    onClick={removerConvidado}
                    disabled={loading || !enderecoRemover}
                  >
                    {loading ? 'Removendo...' : 'Remover Convidado'}
                  </button>
                </div>

                {/* Aprovar Solicitação */}
                {listaSolicitacoes.length > 0 && (
                  <div className="action-card">
                    <h3>✅ Aprovar Solicitação</h3>
                    <input
                      type="text"
                      value={enderecoAprovar}
                      onChange={(e) => setEnderecoAprovar(e.target.value)}
                      placeholder="Endereço do solicitante"
                      className="form-input"
                    />
                    <button 
                      className="action-btn"
                      onClick={aprovarSolicitacao}
                      disabled={loading || !enderecoAprovar}
                    >
                      {loading ? 'Aprovando...' : 'Aprovar Entrada'}
                    </button>
                  </div>
                )}

                {/* Registrar Presença */}
                <div className="action-card">
                  <h3>📝 Registrar Presença (Check-in)</h3>
                  <input
                    type="text"
                    value={enderecoRegistrarPresenca}
                    onChange={(e) => setEnderecoRegistrarPresenca(e.target.value)}
                    placeholder="Endereço do convidado presente"
                    className="form-input"
                  />
                  <button 
                    className="action-btn"
                    onClick={registrarPresenca}
                    disabled={loading || !enderecoRegistrarPresenca}
                  >
                    {loading ? 'Registrando...' : 'Registrar Presença'}
                  </button>
                </div>

                {/* Penalizar Ausência */}
                <div className="action-card">
                  <h3>⚠️ Penalizar Ausência</h3>
                  <input
                    type="text"
                    value={enderecoPenalizar}
                    onChange={(e) => setEnderecoPenalizar(e.target.value)}
                    placeholder="Endereço do convidado ausente"
                    className="form-input"
                  />
                  <button 
                    className="action-btn"
                    onClick={penalizarAusencia}
                    disabled={loading || !enderecoPenalizar}
                  >
                    {loading ? 'Penalizando...' : 'Penalizar Ausência'}
                  </button>
                </div>

                {/* Encerrar Evento */}
                <div className="action-card">
                  <h3>🏁 Encerrar Evento</h3>
                  <p className="action-description">
                    {detalhesEvento.prazoExpirado 
                      ? "Prazo expirado. Encerre para processar penalidades de ausentes"
                      : "Processa penalidades de ausentes automaticamente"}
                  </p>
                  <button 
                    className="action-btn end-btn"
                    onClick={encerrarEvento}
                    disabled={loading || detalhesEvento.encerrado || !detalhesEvento.podeEncerrar}
                    title={!detalhesEvento.podeEncerrar ? 
                      "Condições não atendidas: verifique se é anfitrião, prazo expirou e evento não está cancelado" : 
                      "Encerrar evento"}
                  >
                    {loading ? 'Encerrando...' : 
                     detalhesEvento.encerrado ? 'Evento Encerrado' :
                     !detalhesEvento.podeEncerrar ? 'Condições não atendidas' :
                     detalhesEvento.prazoExpirado ? '⏰ Encerrar Evento (Expirado)' : 
                     'Encerrar Evento'}
                  </button>
                </div>

                {/* Cancelar Evento */}
                <div className="action-card">
                  <h3>🚫 Cancelar Evento</h3>
                  <p className="action-description">
                    Cancela o evento (emergência)
                  </p>
                  <button 
                    className="action-btn cancel-btn"
                    onClick={cancelarEvento}
                    disabled={loading || detalhesEvento.encerrado || detalhesEvento.cancelado}
                  >
                    {loading ? 'Cancelando...' : 
                     detalhesEvento.cancelado ? 'Evento Cancelado' : 
                     detalhesEvento.encerrado ? 'Não pode cancelar (encerrado)' :
                     'Cancelar Evento'}
                  </button>
                </div>

                {/* Sacar Fundos */}
                <div className="action-card">
                  <h3>💰 Sacar Fundos</h3>
                  <p className="action-description">
                    Saca fundos de penalidades e ausências
                  </p>
                  <button 
                    className="action-btn withdraw-btn"
                    onClick={sacarFundos}
                    disabled={loading}
                  >
                    {loading ? 'Sacando...' : 'Sacar Fundos'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <p>Selecione um evento onde você é anfitrião para gerenciar</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Área do Convidado */}
        {activeTab === 'convidado' && (
          <div className="convidado-section">
            <h2>👋 Área do Convidado</h2>
            <p className="section-subtitle">
              Ações disponíveis para convidados
            </p>
            
            <div className="event-selector">
              <h3>Selecione um Evento</h3>
              <select
                value={eventoSelecionado || ''}
                onChange={(e) => {
                  setEventoSelecionado(e.target.value)
                  if (e.target.value) {
                    buscarDetalhesEvento(e.target.value)
                  }
                }}
                className="form-select"
              >
                <option value="">Selecione um evento...</option>
                {eventosParaParticipar.map((evento, index) => (
                  <option key={index} value={evento.nome}>
                    {evento.nome}
                  </option>
                ))}
              </select>
            </div>
            
            {eventoSelecionado && detalhesEvento ? (
              <div className="convidado-actions">
                {/* Solicitar Entrada */}
                <div className="action-card">
                  <h3>🚪 Solicitar Entrada</h3>
                  <p className="action-description">
                    Solicite para participar do evento
                  </p>
                  <button 
                    className="action-btn"
                    onClick={() => solicitarEntrada(eventoSelecionado)}
                    disabled={loading}
                  >
                    {loading ? 'Solicitando...' : 'Solicitar Entrada'}
                  </button>
                </div>

                {/* Confirmar Presença */}
                {!detalhesEvento.prazoExpirado && !detalhesEvento.cancelado && !detalhesEvento.encerrado && (
                  <div className="action-card">
                    <h3>✅ Confirmar Presença</h3>
                    <p className="action-description">
                      Taxa: <strong>{detalhesEvento.taxaPresenca} TCESS</strong>
                    </p>
                    <button 
                      className="action-btn confirm-btn"
                      onClick={confirmarPresenca}
                      disabled={loading}
                    >
                      {loading ? 'Confirmando...' : 'Confirmar Presença'}
                    </button>
                  </div>
                )}

                {/* Cancelar Presença */}
                {!detalhesEvento.prazoExpirado && !detalhesEvento.cancelado && !detalhesEvento.encerrado && (
                  <div className="action-card">
                    <h3>↩️ Cancelar Presença</h3>
                    <p className="action-description">
                      Cancele sua presença dentro do prazo
                    </p>
                    <button 
                      className="action-btn cancel-presence-btn"
                      onClick={cancelarPresenca}
                      disabled={loading}
                    >
                      {loading ? 'Cancelando...' : 'Cancelar Presença'}
                    </button>
                  </div>
                )}

                {/* Solicitar Devolução */}
                {(detalhesEvento.prazoExpirado || detalhesEvento.encerrado) && !detalhesEvento.cancelado && (
                  <div className="action-card">
                    <h3>💸 Solicitar Devolução</h3>
                    <p className="action-description">
                      Solicite devolução após comparecimento
                    </p>
                    <button 
                      className="action-btn refund-btn"
                      onClick={solicitarDevolucao}
                      disabled={loading}
                    >
                      {loading ? 'Solicitando...' : 'Solicitar Devolução'}
                    </button>
                  </div>
                )}

                {/* Sacar Fundos */}
                <div className="action-card">
                  <h3>💰 Sacar Fundos</h3>
                  <p className="action-description">
                    Saca fundos de reembolsos ou devoluções
                  </p>
                  <button 
                    className="action-btn withdraw-btn"
                    onClick={sacarFundos}
                    disabled={loading}
                  >
                    {loading ? 'Sacando...' : 'Sacar Fundos'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <p>Selecione um evento para ver ações disponíveis</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="glcrs-footer">
        <p>GLCRS © 2025 - Gerenciador de Listas de Reuniões Sociais na Blockchain</p>
        <p>Rede: CESS Testnet (ID: 11330) | Token: TCESS</p>
        <p className="contract-info">
          Contrato: {contractAddress?.slice(0, 10)}...{contractAddress?.slice(-8)}
        </p>
      </footer>
    </div>
  )
}

export default GLCRS