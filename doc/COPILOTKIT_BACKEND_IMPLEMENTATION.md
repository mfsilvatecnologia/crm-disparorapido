# Implementação do CopilotKit Runtime no Backend

## 📋 Contexto

O frontend está configurado para usar o CopilotKit (biblioteca de chat com IA) mas precisa que o backend implemente o **runtime endpoint** que processa as mensagens e executa ações.

---

## 🎯 Objetivo

Implementar endpoint `/api/copilotkit` no backend que:
1. Recebe mensagens do chat frontend
2. Processa com OpenAI/LLM
3. Executa ações (analisar leads, calcular scores, etc.)
4. Retorna respostas estruturadas

---

## 📦 Dependências Necessárias

Adicionar ao `package.json` do backend:

```json
{
  "dependencies": {
    "@copilotkit/runtime": "1.10.6",
    "@copilotkit/shared": "1.10.6",
    "openai": "^4.98.0"
  }
}
```

**Instalar:**
```bash
npm install @copilotkit/runtime@1.10.6 @copilotkit/shared@1.10.6 openai
```

---

## 🔧 Implementação

### 1. Criar Controller: `CopilotRuntimeController.ts`

```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { CopilotRuntime, OpenAIAdapter } from '@copilotkit/runtime';
import OpenAI from 'openai';
import { prisma } from '../config/database'; // Ajuste conforme sua estrutura

// ============================================
// CONFIGURAÇÃO OPENAI
// ============================================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ============================================
// AÇÕES DISPONÍVEIS PARA O AGENTE
// ============================================

const copilotActions = [
  {
    name: 'analyze_lead',
    description: 'Analisa um lead e fornece insights sobre qualificação, pontos fortes e oportunidades',
    parameters: [
      {
        name: 'lead_id',
        type: 'string',
        description: 'UUID do lead a ser analisado',
        required: true
      }
    ],
    handler: async ({ lead_id }: { lead_id: string }, context: any) => {
      try {
        // Buscar lead completo com relacionamentos
        const lead = await prisma.lead.findUnique({
          where: { 
            id: lead_id,
            empresaId: context.empresaId // Garantir acesso apenas aos leads da empresa
          },
          include: {
            empresa: true,
            endereco: true
          }
        });

        if (!lead) {
          return {
            success: false,
            error: 'Lead não encontrado ou sem permissão de acesso'
          };
        }

        // Retornar dados estruturados para a IA processar
        return {
          success: true,
          lead: {
            nomeEmpresa: lead.nomeEmpresa,
            cnpj: lead.cnpj,
            segmento: lead.segmento,
            porteEmpresa: lead.porteEmpresa,
            scoreQualificacao: lead.scoreQualificacao,
            status: lead.status,
            nomeContato: lead.nomeContato,
            cargoContato: lead.cargoContato,
            email: lead.email,
            telefone: lead.telefone,
            endereco: lead.endereco,
            observacoes: lead.observacoes
          },
          message: 'Lead carregado com sucesso para análise'
        };
      } catch (error) {
        console.error('[COPILOT ACTION] Erro ao analisar lead:', error);
        return {
          success: false,
          error: 'Erro ao carregar dados do lead'
        };
      }
    }
  },

  {
    name: 'calculate_lead_score',
    description: 'Calcula o score de qualificação de um lead baseado em critérios definidos',
    parameters: [
      {
        name: 'lead_id',
        type: 'string',
        description: 'UUID do lead',
        required: true
      }
    ],
    handler: async ({ lead_id }: { lead_id: string }, context: any) => {
      try {
        const lead = await prisma.lead.findUnique({
          where: { 
            id: lead_id,
            empresaId: context.empresaId
          }
        });

        if (!lead) {
          return { success: false, error: 'Lead não encontrado' };
        }

        // Lógica de cálculo de score
        let score = 0;

        // Porte da empresa (0-30 pontos)
        const porteScores = {
          'MICRO': 10,
          'PEQUENA': 15,
          'MEDIA': 25,
          'GRANDE': 30
        };
        score += porteScores[lead.porteEmpresa as keyof typeof porteScores] || 0;

        // Completude de dados (0-30 pontos)
        const fieldsToCheck = [
          lead.cnpj, 
          lead.email, 
          lead.telefone, 
          lead.nomeContato,
          lead.cargoContato,
          lead.segmento
        ];
        const completeness = fieldsToCheck.filter(f => f).length / fieldsToCheck.length;
        score += Math.round(completeness * 30);

        // Engajamento (0-20 pontos)
        if (lead.status === 'QUALIFICADO' || lead.status === 'EM_NEGOCIACAO') {
          score += 20;
        } else if (lead.status === 'CONTATO_REALIZADO') {
          score += 10;
        }

        // Informações adicionais (0-20 pontos)
        if (lead.linkedinUrl) score += 5;
        if (lead.siteEmpresa) score += 5;
        if (lead.numFuncionarios) score += 5;
        if (lead.receitaAnualEstimada) score += 5;

        // Atualizar score no banco
        await prisma.lead.update({
          where: { id: lead_id },
          data: { scoreQualificacao: score }
        });

        return {
          success: true,
          score,
          breakdown: {
            porte: porteScores[lead.porteEmpresa as keyof typeof porteScores] || 0,
            completude: Math.round(completeness * 30),
            engajamento: lead.status === 'QUALIFICADO' ? 20 : 0,
            informacoes: 20
          },
          message: `Score calculado: ${score}/100`
        };
      } catch (error) {
        console.error('[COPILOT ACTION] Erro ao calcular score:', error);
        return { success: false, error: 'Erro ao calcular score' };
      }
    }
  },

  {
    name: 'update_lead_status',
    description: 'Atualiza o status de um lead',
    parameters: [
      {
        name: 'lead_id',
        type: 'string',
        description: 'UUID do lead',
        required: true
      },
      {
        name: 'status',
        type: 'string',
        description: 'Novo status (NOVO, CONTATO_REALIZADO, QUALIFICADO, etc.)',
        required: true
      },
      {
        name: 'observacao',
        type: 'string',
        description: 'Observação sobre a mudança de status',
        required: false
      }
    ],
    handler: async ({ lead_id, status, observacao }: any, context: any) => {
      try {
        const lead = await prisma.lead.update({
          where: { 
            id: lead_id,
            empresaId: context.empresaId
          },
          data: {
            status,
            observacoes: observacao 
              ? `${new Date().toISOString()}: ${observacao}\n${lead.observacoes || ''}`
              : undefined
          }
        });

        return {
          success: true,
          lead: {
            id: lead.id,
            status: lead.status
          },
          message: `Status atualizado para ${status}`
        };
      } catch (error) {
        console.error('[COPILOT ACTION] Erro ao atualizar status:', error);
        return { success: false, error: 'Erro ao atualizar status' };
      }
    }
  },

  {
    name: 'get_empresa_context',
    description: 'Obtém o contexto de IA configurado pela empresa (tom de voz, área de negócio, etc.)',
    parameters: [],
    handler: async (_params: any, context: any) => {
      try {
        const empresaContext = await prisma.copilotEmpresaContext.findUnique({
          where: { empresaId: context.empresaId }
        });

        if (!empresaContext) {
          return {
            success: true,
            context: null,
            message: 'Empresa ainda não configurou contexto de IA'
          };
        }

        return {
          success: true,
          context: {
            toneOfVoice: empresaContext.toneOfVoice,
            businessArea: empresaContext.businessArea,
            companySummary: empresaContext.companySummary,
            keyDetails: empresaContext.keyDetails
          }
        };
      } catch (error) {
        console.error('[COPILOT ACTION] Erro ao buscar contexto:', error);
        return { success: false, error: 'Erro ao buscar contexto' };
      }
    }
  }
];

// ============================================
// CRIAR RUNTIME DO COPILOTKIT
// ============================================

const copilotRuntime = new CopilotRuntime({
  actions: copilotActions
});

// ============================================
// CONTROLLER HANDLER
// ============================================

export async function copilotRuntimeHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Contexto com dados do usuário autenticado
    const context = {
      empresaId: request.user.empresaId,
      userId: request.user.id,
      userEmail: request.user.email
    };

    console.log('🤖 [COPILOT RUNTIME] Processing request:', {
      empresaId: context.empresaId,
      userId: context.userId,
      timestamp: new Date().toISOString()
    });

    // Configurar adapter do OpenAI
    const serviceAdapter = new OpenAIAdapter({
      openai,
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview'
    });

    // Processar requisição do CopilotKit
    const response = await copilotRuntime.process({
      serviceAdapter,
      request: request.raw,
      context
    });

    console.log('✅ [COPILOT RUNTIME] Request processed successfully');

    // Retornar resposta com headers corretos
    return reply
      .headers(response.headers || {})
      .status(response.status || 200)
      .send(response.body);

  } catch (error: any) {
    console.error('❌ [COPILOT RUNTIME] Error processing request:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return reply.status(500).send({
      success: false,
      error: 'Erro ao processar requisição do CopilotKit',
      message: error.message
    });
  }
}

// Exportar também para uso em health checks
export { copilotRuntime };
```

---

### 2. Registrar Rota no Backend

No arquivo de rotas principal (ex: `routes/index.ts` ou `app.ts`):

```typescript
import { copilotRuntimeHandler } from './controllers/CopilotRuntimeController';
import { authenticateJWT } from './middleware/auth'; // Ajuste conforme sua estrutura

// Registrar rota do CopilotKit
fastify.post('/api/copilotkit', {
  preHandler: [authenticateJWT], // Middleware de autenticação JWT
  handler: copilotRuntimeHandler
});

// Opcional: Health check para CopilotKit
fastify.get('/api/copilotkit/health', {
  handler: async (_request, reply) => {
    return reply.send({
      success: true,
      status: 'CopilotKit runtime is running',
      timestamp: new Date().toISOString()
    });
  }
});
```

---

### 3. Variáveis de Ambiente

Adicionar ao `.env` do backend:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-... # Sua chave da OpenAI
OPENAI_MODEL=gpt-4-turbo-preview # ou gpt-4, gpt-3.5-turbo, etc.

# CopilotKit Configuration (opcional)
COPILOT_DEBUG=true # Para logs detalhados em desenvolvimento
```

---

### 4. Schema do Prisma (se ainda não existir)

Adicionar tabela para contexto de empresa:

```prisma
model CopilotEmpresaContext {
  id             String   @id @default(uuid())
  empresaId      String   @unique
  toneOfVoice    String?  @db.Text // Tom de voz da empresa
  businessArea   String?  @db.Text // Área de negócio
  companySummary String?  @db.Text // Resumo da empresa
  keyDetails     Json?    // Detalhes adicionais em JSON
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  empresa Empresa @relation(fields: [empresaId], references: [id], onDelete: Cascade)

  @@map("copilot_empresa_context")
}

// Adicionar relação em Empresa
model Empresa {
  // ... campos existentes
  copilotContext CopilotEmpresaContext?
}
```

**Executar migration:**
```bash
npx prisma migrate dev --name add_copilot_empresa_context
```

---

## 🔄 Fluxo de Funcionamento

1. **Frontend** envia mensagem via `<CopilotChat>`
2. **Backend** recebe em `POST /api/copilotkit`
3. **CopilotRuntime** processa:
   - Interpreta intenção do usuário
   - Decide quais ações executar
   - Chama handlers das ações
4. **OpenAI** gera resposta inteligente baseada nos dados
5. **Backend** retorna resposta ao frontend
6. **Frontend** exibe no chat

---

## 🧪 Testando

### 1. Health Check
```bash
curl http://localhost:3000/api/copilotkit/health
```

### 2. Testar via Frontend
Após implementar, o frontend já estará configurado:
- Abrir página de Lead Agent
- Digitar no chat: "Analise este lead"
- A IA deve executar `analyze_lead` automaticamente

### 3. Logs
O controller tem logs detalhados. Verificar console do backend:
```
🤖 [COPILOT RUNTIME] Processing request...
✅ [COPILOT RUNTIME] Request processed successfully
```

---

## 📊 Endpoints Disponíveis Após Implementação

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/copilotkit` | POST | Runtime do CopilotKit (chat) |
| `/api/copilotkit/health` | GET | Health check |
| `/copilot/messages` | POST | Endpoint REST alternativo (já existe) |
| `/copilot/conversations/:id` | GET | Histórico (já existe) |
| `/copilot/graphql` | POST | GraphQL (já existe) |

---

## 🔐 Segurança

✅ **Implementado:**
- Autenticação JWT obrigatória
- Filtragem por `empresaId` em todas as ações
- Validação de permissões

⚠️ **Recomendações Adicionais:**
- Rate limiting no endpoint `/api/copilotkit`
- Monitoramento de custos da OpenAI
- Logs de auditoria para ações sensíveis

---

## 💰 Custos da OpenAI

Monitorar uso com:

```typescript
// Adicionar após cada requisição
const usage = response.usage;
console.log('OpenAI Usage:', {
  promptTokens: usage.prompt_tokens,
  completionTokens: usage.completion_tokens,
  totalTokens: usage.total_tokens,
  estimatedCost: calculateCost(usage) // Implementar cálculo
});
```

---

## 🐛 Troubleshooting

### Erro: "OpenAI API key not configured"
**Solução:** Verificar `OPENAI_API_KEY` no `.env`

### Erro: "Action 'analyze_lead' not found"
**Solução:** Verificar nome da ação no código do controller

### Erro: "Lead não encontrado"
**Solução:** Verificar se `lead_id` é válido e se usuário tem permissão

### Frontend não conecta
**Solução:** Verificar se rota está registrada e se CORS está configurado

---

## 📚 Referências

- [CopilotKit Docs](https://docs.copilotkit.ai/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Fastify Documentation](https://fastify.dev/)

---

## ✅ Checklist de Implementação

- [ ] Instalar dependências (`@copilotkit/runtime`, `openai`)
- [ ] Criar `CopilotRuntimeController.ts`
- [ ] Registrar rota `/api/copilotkit`
- [ ] Adicionar `OPENAI_API_KEY` no `.env`
- [ ] Executar migration do Prisma (se necessário)
- [ ] Testar health check
- [ ] Testar chat no frontend
- [ ] Configurar rate limiting
- [ ] Monitorar logs e custos

---

**Dúvidas?** Entre em contato com o time de frontend.

**Data:** 9 de novembro de 2025
**Versão:** 1.0.0
