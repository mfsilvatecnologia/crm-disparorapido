# Mandala da Inovação - Especificação de Feature

| Campo | Valor |
|-------|-------|
| Owner | Product Team (produto@leadsrapido.com) |
| Última atualização | 2025-10-19 |
| Status | Especificação - Não implementado |
| Sensibilidade | interno |

## 📋 Visão Geral

Feature de gestão de inovação baseada na Mandala da Inovação, oferecendo assistentes de IA especializados para cada ELO (etapa) do processo de desenvolvimento de negócios. Cada tela representa um canvas/metodologia específico com seu próprio agente inteligente.

## 🎯 Objetivos

- Guiar empreendedores através dos 6 ELOs da Mandala da Inovação
- Fornecer assistentes de IA especializados em cada metodologia
- Capturar, armazenar e evoluir conhecimento ao longo do processo
- Integrar metodologias consolidadas (Teoria do Encontro, Pitch Canvas, SWOT, etc.)
- Permitir navegação fluida entre as etapas mantendo contexto

## 🏗️ Arquitetura da Feature

### Estrutura de Diretórios

```
src/features/mandala-inovacao/
├── components/
│   ├── shared/
│   │   ├── MandalaNavigation.tsx      # Navegação entre ELOs
│   │   ├── MandalaProgress.tsx        # Indicador de progresso
│   │   └── CanvasContainer.tsx        # Container base para canvas
│   ├── elo-1-busca/
│   │   ├── TeoriaEncontroCanvas.tsx   # Essência + Vocação + Day One
│   │   ├── FunilRealizacaoCanvas.tsx  # Transformar interesses
│   │   └── AutoconhecimentoForm.tsx   # Questionário líder
│   ├── elo-2-conexoes/
│   │   ├── Canvas3Is.tsx              # Networking (Interesseiro/Interessante/Interessado)
│   │   └── MeetupCanvas.tsx           # Rede de sinergias
│   ├── elo-3-visao/
│   │   ├── MVVCanvas.tsx              # Missão, Visão, Valores
│   │   ├── FontesInovacaoCanvas.tsx   # 7 Fontes (Peter Drucker)
│   │   └── GoldenCircleCanvas.tsx     # Inovação contínua
│   ├── elo-4-desenvolvimento/
│   │   ├── SixThinkingHatsCanvas.tsx  # 6 Chapéus do pensamento
│   │   ├── ExpoSwotCanvas.tsx         # SWOT expandido
│   │   └── CanvasAVI.tsx              # Canvas AVI
│   ├── elo-5-pitch/
│   │   ├── PitchCanvas.tsx            # 7 passos do pitch
│   │   └── SIMCanvas.tsx              # Sistema Integrado Monetização
│   └── elo-6-encontro/
│       ├── MapaEcossistemaCanvas.tsx  # Mapeamento stakeholders
│       └── EngajamentoCanvas.tsx      # Estratégias engajamento
├── pages/
│   ├── MandalaOverview.tsx            # Dashboard com todos os ELOs
│   ├── EloPage.tsx                    # Template genérico para cada ELO
│   └── [elo]/[canvas]/CanvasPage.tsx  # Página individual do canvas
├── services/
│   ├── mandalaApi.ts                  # API calls
│   └── copilot.ts                     # Configuração CopilotKit
├── hooks/
│   ├── useMandalaProgress.ts          # Progress tracking
│   ├── useCanvasData.ts               # Persistência canvas
│   └── useEloNavigation.ts            # Navegação entre ELOs
├── types/
│   ├── mandala.types.ts               # Types base
│   ├── elo-1.types.ts                 # Types específicos ELO 1
│   ├── elo-2.types.ts                 # Types específicos ELO 2
│   ├── elo-3.types.ts                 # Types específicos ELO 3
│   ├── elo-4.types.ts                 # Types específicos ELO 4
│   ├── elo-5.types.ts                 # Types específicos ELO 5
│   └── elo-6.types.ts                 # Types específicos ELO 6
├── schemas/
│   ├── elo-1.schema.ts                # Validação Zod ELO 1
│   ├── elo-2.schema.ts                # Validação Zod ELO 2
│   ├── elo-3.schema.ts                # Validação Zod ELO 3
│   ├── elo-4.schema.ts                # Validação Zod ELO 4
│   ├── elo-5.schema.ts                # Validação Zod ELO 5
│   └── elo-6.schema.ts                # Validação Zod ELO 6
├── styles/
│   ├── mandala.css                    # Estilos globais
│   └── canvas.css                     # Estilos de canvas
└── index.ts                           # Exports públicos
```

### Backend (Mastra Agents)

```
ag-ui/dojo/src/mastra/agents/
├── elo-1-busca-agent.ts              # Agente especializado em autoconhecimento
├── elo-2-conexoes-agent.ts           # Agente especializado em networking
├── elo-3-visao-agent.ts              # Agente especializado em planejamento estratégico
├── elo-4-desenvolvimento-agent.ts    # Agente especializado em análise e desenvolvimento
├── elo-5-pitch-agent.ts              # Agente especializado em apresentação de negócios
└── elo-6-encontro-agent.ts           # Agente especializado em gestão de stakeholders
```

## 📊 Modelos de Dados

### Base Types

```typescript
// src/features/mandala-inovacao/types/mandala.types.ts

export enum EloType {
  BUSCA = 'busca',
  CONEXOES = 'conexoes',
  VISAO = 'visao',
  DESENVOLVIMENTO = 'desenvolvimento',
  PITCH = 'pitch',
  ENCONTRO = 'encontro'
}

export interface MandalaProject {
  id: string;
  userId: string;
  leadId?: string;  // Opcional: vincular a um lead
  nome: string;
  descricao?: string;
  status: 'em_andamento' | 'concluido' | 'pausado';
  eloAtual: EloType;
  progressoPorElo: Record<EloType, number>; // 0-100%
  createdAt: string;
  updatedAt: string;
}

export interface CanvasData {
  id: string;
  projectId: string;
  eloType: EloType;
  canvasType: string; // 'teoria-encontro', 'pitch-canvas', etc.
  data: Record<string, any>; // Dados específicos do canvas
  completed: boolean;
  lastEditedAt: string;
  aiSuggestions?: AISuggestion[];
}

export interface AISuggestion {
  id: string;
  canvasId: string;
  field: string;
  suggestion: string;
  reasoning: string;
  accepted: boolean;
  createdAt: string;
}

export interface EloMetadata {
  type: EloType;
  nome: string;
  descricao: string;
  ordem: number;
  icon: string;
  color: string;
  canvases: CanvasMetadata[];
}

export interface CanvasMetadata {
  type: string;
  nome: string;
  descricao: string;
  icon: string;
  estimatedTime: string; // Ex: "30-45 min"
  difficulty: 'facil' | 'medio' | 'dificil';
}
```

### ELO 1 - Busca

```typescript
// src/features/mandala-inovacao/types/elo-1.types.ts

export interface TeoriaEncontro {
  essencia: {
    atributos: string[];
    palavraSintese: string;
    historiasMarcantes?: string[];
  };
  vocacao: {
    atributos: string[];
    palavraSintese: string;
    reconhecimentos?: string[];
    causas?: string[];
  };
  dayOne: {
    momento: string;
    contexto?: string;
    impacto?: string;
  };
  formulaFinal?: string; // "Essência [palavra] + Vocação [palavra] + Day One [momento]"
  verdadePessoal?: string;
}

export interface FunilRealizacao {
  interesses: string[];
  vantagensCompetitivas: string[];
  oportunidades: {
    descricao: string;
    publico?: string;
    dor?: string;
    evidencias?: string[];
  }[];
  ofertaValidada?: {
    publicoAlvo: string;
    solucao: string;
    dor: string;
    beneficioMensuravel: string;
    ticket?: number;
    frequencia?: string;
    canais?: string[];
  };
}

export interface AutoconhecimentoLider {
  qualidadesPrincipais: string[];
  areasParaMelhorar: string[];
  valoresFundamentais: string[];
  visaoDaEquipe?: string;
  metasProximosMeses: string[];
  equilibrioVidaProfissional?: string;
  gestaoConflitos?: string;
  encorajamentoEquipe?: string;
}
```

### ELO 2 - Conexões

```typescript
// src/features/mandala-inovacao/types/elo-2.types.ts

export interface Canvas3Is {
  interesseiro: {
    pessoas: {
      nome: string;
      categoria: 'colega' | 'mentor' | 'cliente' | 'parceiro' | 'outro';
      motivo: string;
      buscaEmMim?: boolean;
      buscaNoOutro?: boolean;
    }[];
  };
  interessante: {
    atributosObjetivos: {
      livros?: string[];
      cursos?: string[];
      artigos?: string[];
      comunidades?: string[];
      outros?: string[];
    };
    atributosSubjetivos: {
      vocacao?: string;
      atributos?: string[];
      amorAfeto?: string;
      sabedoria?: string;
    };
  };
  interessado: {
    conexoes: {
      nome: string;
      conteudoCompartilhado?: string;
      conhecimentoRecebido?: string;
      experiencias?: string;
      formasDeColaborar?: string[];
    }[];
  };
  necessidades: {
    vidaProfissional: {
      networking?: string;
      redesContato?: string[];
      estiloVida?: string;
      outras?: string[];
    };
    vidaPessoal: {
      saude?: string;
      familia?: string;
      amor?: string;
      estiloVida?: string;
      outras?: string[];
    };
  };
}

export interface MeetupCanvas {
  pessoas: {
    nome: string;
    minibio: string;
    feedback: string[];
    apoioOferecido: {
      tipo: 'conhecimento' | 'tempo' | 'rede' | 'inspiracao' | 'conselhos' | 'sabedoria';
      descricao: string;
    }[];
    expectativas: string[];
    proximosPassos: string[];
  }[];
}
```

### ELO 3 - Visão

```typescript
// src/features/mandala-inovacao/types/elo-3.types.ts

export interface MVVCanvas {
  elementosCultura: {
    valores: string[];
    normasComportamentos: string[];
    crencasCompartilhadas: string[];
    climaOrganizacional?: string;
    historiaTradicoes?: string[];
    comunicacaoInterna?: string;
  };
  mvv: {
    missao: string;
    visao: string;
    valores: string[];
  };
}

export interface FontesInovacao {
  fontes: {
    tipo: '1-inesperado' | '2-incongruencia' | '3-necessidade-processo' |
          '4-mudanca-mercado' | '5-demografia' | '6-mudanca-percepcao' | '7-novos-conhecimentos';
    projeto: string;
    sucessosFracassos?: string[];
    oportunidades: string[];
    acoes?: string[];
  }[];
}

export interface GoldenCircleInovacao {
  objetivos: {
    descricao: string;
    tipo: 'eficiencia' | 'rentabilidade' | 'clientes' | 'outro';
  }[];
  iniciativas: {
    tipo: 'cultura-inovacao' | 'alinhamento-cultura';
    acoes: string[];
  }[];
  conquistas: {
    resultado: string;
    impacto: 'novos-produtos' | 'competitividade' | 'reducao-custos' | 'satisfacao-cliente';
    metricas?: Record<string, number>;
  }[];
  cicloAtual: number;
}
```

### ELO 4 - Desenvolvimento

```typescript
// src/features/mandala-inovacao/types/elo-4.types.ts

export enum ChapeuCor {
  BRANCO = 'branco',
  VERMELHO = 'vermelho',
  PRETO = 'preto',
  AMARELO = 'amarelo',
  VERDE = 'verde',
  AZUL = 'azul'
}

export interface SixThinkingHats {
  topico: string;
  analises: {
    chapeu: ChapeuCor;
    observacoes: string[];
    conclusoes?: string;
  }[];
  sinteseFinal?: string;
}

export interface ExpoSwotCanvas {
  forcas: {
    descricao: string;
    evidencias?: string[];
    comoMaximizar?: string;
  }[];
  fraquezas: {
    descricao: string;
    impacto?: 'alto' | 'medio' | 'baixo';
    comoMinimizar?: string;
  }[];
  oportunidades: {
    descricao: string;
    potencial?: 'alto' | 'medio' | 'baixo';
    comoAproveitar?: string;
  }[];
  ameacas: {
    descricao: string;
    probabilidade?: 'alta' | 'media' | 'baixa';
    comoMitigar?: string;
  }[];
  acoesEstrategicas?: {
    tipo: 'FO' | 'FA' | 'DO' | 'DA'; // Força-Oportunidade, etc.
    acao: string;
    prioridade: number;
  }[];
}

export interface CanvasAVI {
  // Estrutura a ser definida conforme documentação específica
  [key: string]: any;
}
```

### ELO 5 - Pitch

```typescript
// src/features/mandala-inovacao/types/elo-5.types.ts

export interface PitchCanvas {
  dor: {
    problema: string;
    contexto: string;
    consequencias: string[];
    dados?: Record<string, any>;
  };
  autoridade: {
    credenciaisTime: string[];
    casesAnteriores?: string[];
    aprendizados: string[];
    dayOneBusiness?: string;
  };
  solucao: {
    propostaValor: string;
    diferenciais: string[];
    estagioAtual: 'prototipo' | 'beta' | 'mvp' | 'escala';
    casosUso?: string[];
    resultados?: Record<string, any>;
    depoimentos?: string[];
  };
  mercado: {
    segmentoAlvo: {
      persona: string;
      demografico?: Record<string, any>;
      comportamental?: string[];
    };
    tam?: number;
    sam?: number;
    som?: number;
    fontesDados?: string[];
    concorrencia: {
      nome: string;
      diferenciais?: string[];
    }[];
    tendencias: string[];
  };
  sim: SIMModel;
  tracao: {
    clientesAtivos?: number;
    mrr?: number;
    ltv?: number;
    cac?: number;
    nps?: number;
    churn?: number;
    pilotos?: number;
    pipeline?: number;
    cartasIntencao?: number;
  };
  planoRoadmap: {
    marcosAtingidos: string[];
    proximosReleases: {
      nome: string;
      prazo: string;
      escopo?: string[];
    }[];
    estrategiaCrescimento: string;
    necessidadesCriticas: {
      tipo: 'contratacao' | 'tecnologia' | 'parceria' | 'outro';
      descricao: string;
    }[];
  };
  pedido: {
    valorLevantando: number;
    participacaoOferecida?: number;
    instrumento?: string;
    destinacaoRecursos: {
      categoria: 'p&d' | 'marketing' | 'expansao' | 'operacional';
      percentual: number;
    }[];
    previsaoRetorno?: string;
    milestones?: string[];
    mitigacaoRiscos?: string[];
  };
  callToAction: string;
  contatos: {
    nome: string;
    cargo: string;
    email: string;
    telefone?: string;
  }[];
}

export interface SIMModel {
  modeloPublico: 'B2C' | 'B2B' | 'B2B2C' | 'B2G' | 'B2P';
  modeloNegocio: string; // 'loja-fisica', 'marketplace', 'e-commerce', 'app', 'franquia', etc.
  modeloReceita: string; // 'assinatura', 'mensalidade', 'compra-pontual', 'comissao', 'licenca', etc.
  modeloCanal: string; // 'forca-propria', 'representantes', 'venda-direta', 'marketplace', etc.
  detalhamento?: {
    ticket?: number;
    recorrencia?: string;
    pricing?: string;
    canaisEspecificos?: string[];
  };
}
```

### ELO 6 - Encontro

```typescript
// src/features/mandala-inovacao/types/elo-6.types.ts

export interface MapaEcossistema {
  projeto: {
    nome: string;
    descricao: string;
  };
  microambiente: {
    categoria: 'clientes' | 'acionistas' | 'colaboradores' | 'fornecedores' | 'outro';
    stakeholder: string;
    impacto: 'alto' | 'medio' | 'baixo';
    relacao?: string;
  }[];
  macroambiente: {
    dimensao: 'economico' | 'politico' | 'legal' | 'demografico' | 'tecnologico' | 'sociocultural' | 'ambiental';
    fator: string;
    influencia: 'alta' | 'media' | 'baixa';
    monitoramento?: string;
  }[];
}

export interface EngajamentoCanvas {
  interlocutores: {
    nome: string;
    interesse: 'alto' | 'baixo';
    influencia: 'alta' | 'baixa';
    estrategia: 'engajado' | 'satisfeito' | 'informado' | 'agradado';
    acoes: string[];
    frequenciaComunicacao?: string;
    canalPreferido?: string;
  }[];
}
```

## 🎨 Componentes Principais

### 1. MandalaNavigation

Navegação visual entre os 6 ELOs com indicador de progresso.

**Props:**
```typescript
interface MandalaNavigationProps {
  currentElo: EloType;
  progress: Record<EloType, number>;
  onEloChange: (elo: EloType) => void;
  disabled?: boolean;
}
```

**Features:**
- Representação circular dos 6 ELOs
- Cores distintas por ELO
- Indicador de progresso (0-100%) em cada ELO
- Highlight do ELO atual
- Animação ao trocar de ELO

### 2. CanvasContainer

Container padrão para todos os canvas com integração de IA.

**Props:**
```typescript
interface CanvasContainerProps {
  canvasType: string;
  canvasData: CanvasData;
  onUpdate: (data: Partial<CanvasData>) => void;
  agentId: string; // ID do agente Mastra específico
  children: React.ReactNode;
  showAIChat?: boolean;
}
```

**Features:**
- Layout padrão com título, descrição e tempo estimado
- Integração CopilotKit com agente específico
- Chat lateral ou modal (responsivo)
- Auto-save de alterações
- Indicador de campos modificados pela IA
- Botões de ação rápida contextuais

### 3. Canvas Específicos

Cada canvas tem seu componente próprio seguindo o padrão:

```typescript
// Exemplo: TeoriaEncontroCanvas
interface TeoriaEncontroCanvasProps {
  data: TeoriaEncontro;
  onChange: (data: TeoriaEncontro) => void;
  readOnly?: boolean;
}
```

**Padrão de estrutura:**
- Seções organizadas por cards
- Campos editáveis inline
- Validação em tempo real
- Sugestões da IA destacadas
- Exportação em PDF/MD

## 🤖 Integração com IA (Mastra Agents)

### Configuração dos Agentes

Cada ELO tem um agente especializado com:

1. **Memory Schema** específico do canvas
2. **Tools** para manipular dados
3. **Knowledge Base** com prompts e templates do ELO
4. **Context** do projeto e histórico

```typescript
// Exemplo: elo-1-busca-agent.ts
import { Agent } from "@mastra/core";
import { Memory } from "@mastra/memory";
import { z } from "zod";

export const eloBuscaAgent = new Agent({
  name: "elo_busca",
  model: openai("gpt-4o"),
  instructions: `
    Você é um facilitador especializado em autoconhecimento e metodologias
    de busca pessoal, incluindo a Teoria do Encontro de Fernando Seabra.

    Sua missão é:
    - Guiar o empreendedor na descoberta de Essência, Vocação e Day One
    - Fazer perguntas profundas e provocativas
    - Identificar padrões e conexões nas respostas
    - Sintetizar insights em palavras-chave poderosas
    - Validar alinhamento entre os elementos

    Sempre use uma linguagem empática, não-julgadora e encorajadora.
  `,
  memory: new Memory({
    workingMemory: {
      schema: z.object({
        teoriaEncontro: z.object({
          essencia: z.object({
            atributos: z.array(z.string()),
            palavraSintese: z.string(),
            historiasMarcantes: z.array(z.string()).optional(),
          }),
          vocacao: z.object({
            atributos: z.array(z.string()),
            palavraSintese: z.string(),
            reconhecimentos: z.array(z.string()).optional(),
          }),
          dayOne: z.object({
            momento: z.string(),
            contexto: z.string().optional(),
          }),
          formulaFinal: z.string().optional(),
        }),
        funilRealizacao: z.object({
          interesses: z.array(z.string()),
          vantagensCompetitivas: z.array(z.string()),
          oportunidades: z.array(z.object({
            descricao: z.string(),
            publico: z.string().optional(),
          })),
        }),
      }),
    },
  }),
  tools: {
    // Tools específicas para cada canvas
  },
});
```

### Prompts por Agente

Cada agente usa os prompts definidos em `/doc/templates-mandala/mandala-da-inovacao/elo-X/prompts.md` como base de conhecimento.

## 🎯 Funcionalidades por Tela

### Dashboard (MandalaOverview)

**Rota:** `/app/mandala`

**Funcionalidades:**
- Grid com os 6 ELOs
- Card para cada ELO mostrando:
  - Nome e ícone
  - Progresso (%)
  - Canvas disponíveis
  - Última edição
- Botão "Novo Projeto"
- Filtros: "Em andamento", "Concluídos", "Pausados"
- Search por nome de projeto

### Página do ELO (EloPage)

**Rota:** `/app/mandala/[projectId]/[elo]`

**Funcionalidades:**
- Breadcrumb: Dashboard > Projeto > ELO
- Navegação Mandala (circular)
- Lista de canvas do ELO
- Para cada canvas:
  - Status (não iniciado, em andamento, concluído)
  - Tempo estimado
  - Botão "Continuar" ou "Iniciar"
- Progresso geral do ELO
- AI Assistant sempre disponível

### Página do Canvas (CanvasPage)

**Rota:** `/app/mandala/[projectId]/[elo]/[canvas]`

**Layout:**
- **Desktop:** 60/40 (canvas/chat)
- **Mobile:** Full screen com chat pull-up

**Funcionalidades:**
- Título e descrição do canvas
- Tempo estimado e progresso
- Campos organizados por seções
- Chat com agente especializado sempre visível
- Botões de ação:
  - "Analisar com IA"
  - "Sugerir Melhorias"
  - "Exportar Canvas"
  - "Salvar e Continuar"
  - "Voltar"
- Auto-save a cada 5 segundos
- Validação em tempo real
- Indicador visual de campos modificados pela IA

## 📱 Responsividade

### Desktop (>1024px)
- Layout 60/40 (canvas/chat)
- Navegação Mandala circular completa
- Todos os campos visíveis simultaneamente

### Tablet (768px - 1024px)
- Layout 70/30 (canvas/chat)
- Navegação Mandala compacta
- Scroll vertical por seções

### Mobile (<768px)
- Layout full screen
- Chat pull-up modal
- Navegação Mandala como carousel horizontal
- Campos empilhados
- Accordion para seções

## 🔒 Segurança e Validação

### Validação de Dados
- Todos os dados validados com Zod schemas
- Validação client-side em tempo real
- Validação server-side antes de persistir
- Sanitização de inputs

### Autenticação e Autorização
- Usuário deve estar autenticado
- Projetos vinculados ao userId
- Não pode acessar projetos de outros usuários
- Rate limiting em chamadas de IA

### Privacidade
- Dados sensíveis não expostos em logs
- Memória do agente isolada por sessão
- Opção de apagar histórico de conversas
- LGPD compliance

## 🧪 Testes

### Unit Tests
- Componentes isolados
- Validação de schemas
- Lógica de transformação de dados

### Integration Tests
- Fluxo completo de um ELO
- Integração com API
- Integração com agentes

### E2E Tests
```typescript
describe('Mandala da Inovação - ELO 1', () => {
  it('should complete Teoria do Encontro canvas', () => {
    cy.visit('/app/mandala/project-123/busca/teoria-encontro');

    // Preencher Essência
    cy.get('[data-testid="essencia-atributos"]').type('Integridade, Observador');
    cy.get('[data-testid="essencia-sintese"]').type('Autenticidade');

    // Interagir com IA
    cy.get('[data-testid="ai-chat-input"]').type('Analise minha essência');
    cy.get('[data-testid="ai-send-button"]').click();
    cy.get('[data-testid="ai-response"]').should('be.visible');

    // Salvar
    cy.get('[data-testid="save-button"]').click();
    cy.get('[data-testid="success-toast"]').should('be.visible');
  });
});
```

## 📊 Métricas e Analytics

### Tracking de Uso
- Tempo gasto em cada canvas
- Taxa de conclusão por ELO
- Campos mais editados
- Interações com IA (número de mensagens, tipo de perguntas)
- Taxa de aceitação de sugestões da IA

### KPIs
- % de projetos concluídos
- Tempo médio para completar cada ELO
- NPS dos usuários com a feature
- Retenção (usuários que voltam)

## 🚀 Fases de Implementação

### Fase 1: MVP - ELO 1 (Busca)
**Duração:** 2-3 semanas

**Entregas:**
- Dashboard básico
- Navegação entre ELOs (estrutura)
- Componentes base (CanvasContainer, MandalaNavigation)
- ELO 1 completo:
  - Teoria do Encontro Canvas
  - Funil da Realização Canvas
  - Autoconhecimento Form
- Agente ELO 1 configurado
- API endpoints básicos
- Testes unitários

### Fase 2: ELOs 2 e 3
**Duração:** 2 semanas

**Entregas:**
- ELO 2 - Conexões completo
- ELO 3 - Visão completo
- Agentes ELO 2 e 3
- Navegação entre ELOs funcional
- Tracking de progresso

### Fase 3: ELOs 4, 5 e 6
**Duração:** 3 semanas

**Entregas:**
- ELO 4 - Desenvolvimento completo
- ELO 5 - Pitch completo
- ELO 6 - Encontro completo
- Todos os agentes configurados
- Exportação em PDF
- Analytics básico

### Fase 4: Polimento e Features Avançadas
**Duração:** 1-2 semanas

**Entregas:**
- Refinamento UX/UI
- Otimização de performance
- Integração com leads (vincular Mandala a Lead)
- Compartilhamento de projetos
- Templates pré-preenchidos
- Gamificação (badges, conquistas)
- Analytics avançado

## 🎨 Design System

### Cores por ELO

```css
--elo-1-busca: #6366F1;        /* Indigo */
--elo-2-conexoes: #EC4899;     /* Pink */
--elo-3-visao: #8B5CF6;        /* Purple */
--elo-4-desenvolvimento: #10B981; /* Green */
--elo-5-pitch: #F59E0B;        /* Amber */
--elo-6-encontro: #3B82F6;     /* Blue */
```

### Ícones

- ELO 1: 🔍 (Busca)
- ELO 2: 🤝 (Conexões)
- ELO 3: 👁️ (Visão)
- ELO 4: ⚙️ (Desenvolvimento)
- ELO 5: 🎤 (Pitch)
- ELO 6: 🎯 (Encontro)

### Componentes UI

Utilizar componentes do design system existente:
- Card, CardHeader, CardContent
- Badge
- Button
- Input, Textarea, Select
- Accordion
- Progress
- Tabs
- Toast

## 🔧 Configuração Técnica

### Dependências

```json
{
  "@copilotkit/react-core": "1.10.6",
  "@copilotkit/react-ui": "1.10.6",
  "@mastra/core": "^0.20.2",
  "@ai-sdk/openai": "^2.0.42",
  "zod": "3.25",
  "react-pdf": "^7.0.0",
  "jspdf": "^2.5.1",
  "html2canvas": "^1.4.1"
}
```

### Variáveis de Ambiente

```env
# OpenAI API Key
OPENAI_API_KEY=sk-...

# CopilotKit Runtime URL
VITE_COPILOTKIT_RUNTIME_URL=/api/copilotkit

# Feature Flag
VITE_FEATURE_MANDALA_ENABLED=true
```

### Rotas do Backend

```
POST   /api/mandala/projects              # Criar projeto
GET    /api/mandala/projects              # Listar projetos do usuário
GET    /api/mandala/projects/:id          # Obter projeto
PUT    /api/mandala/projects/:id          # Atualizar projeto
DELETE /api/mandala/projects/:id          # Deletar projeto

POST   /api/mandala/canvas                # Criar/atualizar canvas
GET    /api/mandala/canvas/:id            # Obter canvas
GET    /api/mandala/projects/:id/canvas   # Listar canvas do projeto

POST   /api/mandala/export/:canvasId      # Exportar canvas em PDF
GET    /api/mandala/analytics/:projectId  # Analytics do projeto

# CopilotKit runtime (um por agente)
POST   /api/copilotkit/elo-1-busca
POST   /api/copilotkit/elo-2-conexoes
POST   /api/copilotkit/elo-3-visao
POST   /api/copilotkit/elo-4-desenvolvimento
POST   /api/copilotkit/elo-5-pitch
POST   /api/copilotkit/elo-6-encontro
```

## 📚 Referências

### Documentação Base
- [Templates Mandala](/doc/templates-mandala/README.md)
- [Templates por ELO](/doc/templates-mandala/mandala-da-inovacao/)
- [Lead Agent Feature](/src/features/lead-agent/README.md)

### Metodologias
- Teoria do Encontro (Fernando Seabra)
- Funil da Realização
- Canvas dos 3 I's
- Pitch Canvas
- Sistema Integrado de Monetização (SIM)
- Six Thinking Hats (Edward de Bono)
- 7 Fontes da Inovação (Peter Drucker)

### Tecnologias
- [CopilotKit Documentation](https://docs.copilotkit.ai/)
- [Mastra Documentation](https://mastra.ai/docs)
- [Zod Documentation](https://zod.dev/)

## 🤝 Contribuindo

Para adicionar novos canvas ou ELOs:

1. Criar types em `types/elo-X.types.ts`
2. Criar schema Zod em `schemas/elo-X.schema.ts`
3. Implementar componente canvas em `components/elo-X/`
4. Configurar agente em `ag-ui/dojo/src/mastra/agents/`
5. Adicionar prompts em `/doc/templates-mandala/mandala-da-inovacao/elo-X/prompts.md`
6. Criar testes
7. Atualizar documentação

## 📄 Licença

Parte do projeto LeadsRapido - Todos os direitos reservados.

---

**Última atualização:** 2025-10-19
**Status:** Especificação aprovada - Pronto para implementação
**Próximo passo:** Iniciar Fase 1 (MVP - ELO 1)
