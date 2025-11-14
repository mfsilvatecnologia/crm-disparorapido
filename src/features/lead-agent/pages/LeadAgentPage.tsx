"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { CopilotKit, useCopilotChat } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { Role, TextMessage } from "@copilotkit/runtime-client-gql";
import { LeadAgentCard } from '../components/LeadAgentCard';
import { LeadData, PorteEmpresa, LeadStatus } from '../types/agent';
import { useLead } from '@/features/leads/hooks/useLead';
import "@copilotkit/react-ui/styles.css";
import "../styles/lead-agent.css";

const INITIAL_STATE: LeadData = {
  id: '',
  empresaId: '',
  nomeEmpresa: 'Nova Empresa',
  fonte: 'manual',
  status: LeadStatus.NOVO,
  scoreQualificacao: 50,
  createdAt: new Date(),
  updatedAt: new Date(),
  cnpj: '',
  segmento: '',
  porteEmpresa: PorteEmpresa.PEQUENA,
  tags: [],
  nomeContato: '',
  cargoContato: '',
  email: '',
  telefone: '',
  observacoes: '',
  endereco: {
    cidade: '',
    estado: '',
    pais: 'Brasil',
  },
};

interface LeadAgentPageProps {
  integrationId?: string;
}

export function LeadAgentPage({ integrationId = 'mastra-agent-local' }: LeadAgentPageProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const chatTitle = "Assistente de Leads";
  const initialLabel = "Olá! Como posso ajudar com seu lead?";

  // CONFIGURAÇÃO DO COPILOTKIT - APENAS REST (SEM GRAPHQL)
  //
  // IMPORTANTE: O CopilotKit tem um schema GraphQL próprio que NÃO é compatível
  // com schemas customizados. Por isso, desabilitamos funcionalidades GraphQL
  // (useCoAgent, gerenciamento de estado) e usamos APENAS REST para chat.
  //
  // Funcionalidades disponíveis:
  // ✅ CopilotChat - Interface de chat com IA
  // ✅ useCopilotChat - Enviar mensagens programaticamente
  // ✅ REST API - /copilot/messages e /copilot/conversations
  //
  // Funcionalidades NÃO disponíveis (requerem GraphQL compatível):
  // ❌ useCoAgent - Gerenciamento de estado via GraphQL
  // ❌ loadAgentState/saveAgentState - Persistência de estado
  // ❌ executeAction - Ações via GraphQL
  //
  // Solução: Gerenciamos o estado localmente no React e usamos apenas o chat.
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  // Use REST endpoint, not GraphQL! CopilotKit expects a REST runtime endpoint
  const runtimeUrl = import.meta.env.VITE_COPILOT_RUNTIME_URL || `${API_BASE_URL}/copilot`;

  // Get auth token from localStorage
  const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || 'leadsrapido_auth_token';
  const authToken = localStorage.getItem(TOKEN_KEY);

  console.log('🔐 [COPILOT CONFIG - REST ONLY]', {
    apiBaseUrl: API_BASE_URL,
    hasToken: !!authToken,
    tokenLength: authToken?.length || 0,
    mode: 'REST only (no GraphQL)',
    features: 'Chat only, state managed locally',
  });

  if (!authToken) {
    console.warn('⚠️ [COPILOT AUTH] No auth token found! Chat features may be limited.');
  }

  return (
    <CopilotKit
      runtimeUrl={runtimeUrl}
      showDevConsole={import.meta.env.DEV}
      headers={{
        ...(authToken && {
          Authorization: `Bearer ${authToken}`,
        }),
      }}
      // Sem agent e publicApiKey - usamos apenas REST
    >
      <div className="lead-agent-split-layout">
        {/* Left Panel - Lead Information */}
        <div className="lead-agent-main-panel">
          <div className="lead-agent-header-compact">
            <h1 className="page-title-compact">Gerenciamento de Lead</h1>
          </div>
          <div className="lead-agent-scroll-content">
            <LeadManager />
          </div>
        </div>

        {/* Right Panel - Chat Sidebar */}
        <div className={`lead-agent-chat-panel ${isMobile && isChatMinimized ? 'minimized' : ''}`}>
          {isMobile && (
            <button
              className="chat-toggle-mobile"
              onClick={() => setIsChatMinimized(!isChatMinimized)}
              aria-label={isChatMinimized ? "Expandir chat" : "Minimizar chat"}
            >
              {isChatMinimized ? '▲' : '▼'}
            </button>
          )}

          <div className="chat-header-fixed">
            <div className="chat-header-content">
              <div className="chat-status-indicator"></div>
              <h3 className="chat-title">{chatTitle}</h3>
            </div>
            {!isMobile && (
              <button
                className="chat-minimize-btn"
                onClick={() => setIsChatMinimized(!isChatMinimized)}
                aria-label="Toggle chat"
              >
                {isChatMinimized ? '◀' : '▶'}
              </button>
            )}
          </div>

          {!isChatMinimized && (
            <div className="chat-content-container">
              <CopilotChat
                className="copilot-chat-fixed"
                labels={{
                  title: chatTitle,
                  initial: initialLabel
                }}
              />
            </div>
          )}
        </div>
      </div>
    </CopilotKit>
  );
}

function LeadManager() {
  const { id: leadId } = useParams<{ id: string }>();
  const { data: leadData, isLoading: isLoadingLead } = useLead(leadId, { enabled: !!leadId });

  // GERENCIAMENTO DE ESTADO LOCAL (sem useCoAgent)
  // Como não usamos GraphQL do CopilotKit, gerenciamos o estado localmente
  const [lead, setLead] = useState(INITIAL_STATE);
  const { appendMessage, isLoading } = useCopilotChat();
  const changedKeysRef = useRef<string[]>([]);

  // Load lead data from API (using backend structure directly)
  useEffect(() => {
    if (leadData) {
      const adaptedLead: LeadData = {
        id: leadData.id,
        empresaId: leadData.empresaId,
        nomeEmpresa: leadData.nomeEmpresa || '',
        fonte: leadData.fonte || 'manual',
        status: (leadData.status as LeadStatus) || LeadStatus.NOVO,
        scoreQualificacao: leadData.scoreQualificacao || 0,
        createdAt: new Date(leadData.createdAt),
        updatedAt: new Date(leadData.updatedAt),
        // Single contact fields (not array)
        nomeContato: leadData.nomeContato || '',
        cargoContato: leadData.cargoContato || '',
        email: leadData.email || '',
        telefone: leadData.telefone || '',
        // Company data
        cnpj: leadData.cnpj || '',
        segmento: leadData.segmento || '',
        porteEmpresa: (leadData.porteEmpresa as PorteEmpresa) || PorteEmpresa.PEQUENA,
        linkedinUrl: leadData.linkedinUrl,
        siteEmpresa: leadData.siteEmpresa,
        numFuncionarios: leadData.numFuncionarios,
        receitaAnualEstimada: leadData.receitaAnualEstimada,
        tags: leadData.tags || [],
        observacoes: leadData.observacoes || '',
        dadosOriginais: leadData.dadosOriginais,
        custoAquisicao: leadData.custoAquisicao,
        endereco: leadData.endereco || {
          cidade: '',
          estado: '',
          pais: 'Brasil',
        },
      };
      setLead(adaptedLead);
    }
  }, [leadData]);

  const updateLead = (partialLead: Partial<LeadData>) => {
    const updatedLead = { ...lead, ...partialLead };
    setLead(updatedLead);
    
    // Marcar campos alterados para highlight visual
    const changedKeys = Object.keys(partialLead);
    changedKeysRef.current = changedKeys;
    
    // Limpar highlight após 3 segundos
    setTimeout(() => {
      changedKeysRef.current = [];
    }, 3000);
  };

  return (
    <div className="lead-manager-container-split">
      <LeadAgentCard
        lead={lead}
        onUpdateLead={updateLead}
        changedKeys={changedKeysRef.current}
        isLoading={isLoading || isLoadingLead}
      />

      <div className="action-container-compact">
        <button
          className={isLoading ? 'action-button primary loading' : 'action-button primary'}
          type="button"
          onClick={() => {
            if (!isLoading) {
              appendMessage(
                new TextMessage({
                  content: 'Analise este lead e sugira melhorias',
                  role: Role.User,
                })
              );
            }
          }}
          disabled={isLoading}
          data-testid="analyze-button"
        >
          {isLoading ? 'Analisando...' : 'Analisar com IA'}
        </button>

        <button
          className="action-button secondary"
          type="button"
          onClick={() => {
            if (!isLoading) {
              appendMessage(
                new TextMessage({
                  content: `Calcule o score ideal para este lead baseado nos dados: empresa ${lead.nomeEmpresa}, porte ${lead.porteEmpresa}, segmento ${lead.segmento || 'não informado'}`,
                  role: Role.User,
                })
              );
            }
          }}
          disabled={isLoading}
        >
          Calcular Score
        </button>
      </div>
    </div>
  );
}

export default LeadAgentPage;
