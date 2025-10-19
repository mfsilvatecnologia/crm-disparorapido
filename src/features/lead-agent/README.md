# Lead Agent - Gerenciamento Inteligente de Leads com IA

Feature de gerenciamento de leads com assistente de IA integrado usando CopilotKit e Mastra.

## 📋 Visão Geral

Esta feature permite gerenciar leads de forma interativa com auxílio de um assistente de IA que pode:
- Analisar e sugerir melhorias nos dados do lead
- Calcular scores de qualificação automaticamente
- Adicionar e gerenciar contatos
- Registrar atividades de prospecção
- Atualizar status e informações em tempo real

## 🏗️ Arquitetura

### Componentes Principais

```
lead-agent/
├── components/
│   └── LeadAgentCard.tsx      # Card interativo do lead
├── pages/
│   └── LeadAgentPage.tsx      # Página principal com chat
├── types/
│   └── agent.ts               # TypeScript types
├── styles/
│   └── lead-agent.css         # Estilos customizados
└── index.ts                   # Exports públicos
```

### Integração com Mastra

O agente está configurado em `/ag-ui/dojo/src/mastra/index.ts`:

```typescript
lead_manager: new Agent({
  name: "lead_manager",
  model: openai("gpt-4o"),
  memory: new Memory({
    workingMemory: {
      schema: z.object({
        lead: z.object({
          nomeEmpresa: z.string(),
          status: z.enum([...]),
          score: z.number(),
          contacts: z.array(...),
          activities: z.array(...),
          // ... outros campos
        })
      })
    }
  })
})
```

## 🚀 Como Usar

### 1. Acessar a Página

Navegue para `/app/lead-agent` após fazer login.

### 2. Gerenciar Lead

#### Dados da Empresa
- **Nome da Empresa**: Clique no título para editar
- **CNPJ**: Formato 00.000.000/0000-00
- **Segmento**: Área de atuação da empresa
- **Porte**: MEI, Micro, Pequena, Média ou Grande
- **Status**: Novo, Qualificado, Contatado, Interessado, Desqualificado, Convertido
- **Score**: 0-100 (calculado automaticamente ou manual)

#### Contatos
- Clique em **"+ Adicionar Contato"** para adicionar novos contatos
- Preencha: Nome, Cargo, Email, Telefone
- Remova contatos desnecessários com o botão ×

#### Atividades
- Clique em **"+ Adicionar Atividade"** para registrar interações
- Tipos disponíveis: 📧 Email, 📞 Chamada, 🤝 Reunião, 📝 Nota, 📄 Proposta
- Registre data e descrição de cada atividade

#### Tags
- Adicione tags separadas por vírgula
- Útil para categorização e filtros

#### Observações
- Campo de texto livre para anotações importantes

### 3. Usar o Assistente de IA

#### Chat Lateral (Desktop)
O chat aparece automaticamente no lado direito da tela.

#### Chat Pull-Up (Mobile)
- Toque no botão inferior para abrir o chat
- Arraste a barra superior para ajustar o tamanho
- Feche tocando fora ou no X

#### Comandos Úteis

```
"Analise este lead e sugira melhorias"
"Calcule o score ideal para este lead"
"Adicione um contato de tecnologia"
"Registre uma reunião para amanhã"
"Mude o status para qualificado"
"Adicione tags: tecnologia, cloud, SaaS"
```

### 4. Botões de Ação Rápida

**🤖 Analisar com IA**
- Solicita análise completa do lead
- Recebe sugestões de melhorias
- Identifica campos faltantes

**📊 Calcular Score**
- Calcula score baseado em:
  - Quantidade e qualidade de contatos
  - Número de atividades
  - Porte da empresa
  - Completude dos dados

## 🎨 Funcionalidades Visuais

### Ping Animation
Campos atualizados pelo agente exibem uma animação de "ping" azul no canto superior direito.

### Score com Cores
- 🟢 80-100: Verde (Lead quente)
- 🔵 60-79: Azul (Qualificado)
- 🟡 40-59: Amarelo (Precisa atenção)
- 🔴 0-39: Vermelho (Baixa qualidade)

### Status com Labels
Cada status tem cor e label específicos para fácil identificação.

## 🔧 Configuração Técnica

### Dependências Necessárias

```json
{
  "@copilotkit/react-core": "1.10.6",
  "@copilotkit/react-ui": "1.10.6",
  "@copilotkit/runtime-client-gql": "latest",
  "@mastra/core": "^0.20.2",
  "@ai-sdk/openai": "^2.0.42",
  "zod": "3.25"
}
```

### Variáveis de Ambiente

```env
# OpenAI API Key (necessária para o Mastra)
OPENAI_API_KEY=sk-...

# CopilotKit Runtime URL (opcional, usa padrão)
VITE_COPILOTKIT_RUNTIME_URL=/api/copilotkit
```

### Rota do CopilotKit

A rota `/api/copilotkit/:integrationId` deve estar configurada no backend para processar as mensagens do chat.

## 📱 Responsividade

### Desktop (>768px)
- Chat lateral fixo
- Layout de 2 colunas
- Todos os campos visíveis

### Mobile (<768px)
- Chat pull-up modal
- Layout de 1 coluna
- Campos empilhados
- Gestos de arrastar para redimensionar chat

## 🧪 Testes

Para testar a feature:

```bash
# Navegar para a página
/app/lead-agent

# Testar elementos interativos
- data-testid="lead-agent-card"
- data-testid="add-contact-button"
- data-testid="contact-card"
- data-testid="activities-container"
- data-testid="analyze-button"
```

## 🔒 Segurança

- Todos os dados são validados com Zod schemas
- Integração protegida por autenticação
- Estado compartilhado entre UI e agente de forma segura
- Memória do agente isolada por sessão

## 🚧 Próximas Melhorias

- [ ] Integração com API real de leads do backend
- [ ] Salvamento automático de mudanças
- [ ] Histórico de interações com o agente
- [ ] Exportação de relatórios gerados pela IA
- [ ] Análise de sentimento em observações
- [ ] Sugestões de próximas ações baseadas no pipeline
- [ ] Integração com calendário para agendamento de atividades

## 📚 Recursos Adicionais

- [CopilotKit Documentation](https://docs.copilotkit.ai/)
- [Mastra Documentation](https://mastra.ai/docs)
- [Shared State Pattern Example](../../ag-ui/dojo/src/app/[integrationId]/feature/shared_state/)
- **[Guia de Troubleshooting Completo](../../../COPILOTKIT_TROUBLESHOOTING.md)** ⚠️ IMPORTANTE

## 🔧 Status da Implementação Atual

### ✅ Implementado (Sessão Anterior)

1. **Interface Compacta com Cards**
   - Layout 60/40 (painel/chat)
   - Cards sem abas, seções verticais
   - Todos os campos da API integrados
   - Google Maps data display

2. **Integração CopilotKit**
   - `<CopilotKit>` wrapper configurado
   - `<CopilotChat>` no painel direito
   - useCoAgent para estado compartilhado
   - Autenticação com token

3. **Correções de Bugs**
   - Loop infinito no useEffect corrigido
   - Schema validation ajustado
   - CORS headers adicionados
   - Token retrieval corrigido

4. **Serviço API Refatorado**
   - Usa `apiClient.request()` pattern
   - Zod schemas para validação
   - Logging detalhado
   - Error handling robusto

### ⚠️ Requer Configuração

**Você está aqui**: O CopilotKit está integrado mas precisa de runtime configurado.

**Problema**: Incompatibilidade GraphQL vs REST
- Frontend envia GraphQL queries
- Backend espera REST JSON
- Erro: `"lead_id e message são obrigatórios"`

**Solução**: Configure runtime CopilotKit (15 min - 3 horas dependendo da opção)

**Leia**: [COPILOTKIT_TROUBLESHOOTING.md](../../../COPILOTKIT_TROUBLESHOOTING.md) para instruções completas.

### 🎯 Próximos Passos

1. **Execute o diagnóstico**:
   ```bash
   ./scripts/check-copilot-config.sh
   ```

2. **Escolha uma opção**:
   - **Opção A (15 min)**: CopilotKit Cloud - Configure chaves API
   - **Opção B (2-3h)**: Runtime Auto-Hospedado - Implemente GraphQL
   - **Opção C (1h)**: Adaptador GraphQL-REST - Crie middleware

3. **Configure `.env`**:
   ```bash
   VITE_COPILOT_RUNTIME_URL=https://api.copilotkit.ai/v1/runtime
   VITE_COPILOT_PUBLIC_API_KEY=ck_pub_sua_chave
   ```

4. **Reinicie e teste**:
   ```bash
   npm run dev
   # Abra: http://localhost:8080/lead-agent/:leadId
   ```

## 🤝 Contribuindo

Para adicionar novas funcionalidades ao agente:

1. Atualize o schema em `mastra/index.ts`
2. Adicione campos no `LeadAgentCard.tsx`
3. Atualize os types em `types/agent.ts`
4. Adicione estilos em `styles/lead-agent.css`

## 📄 Licença

Parte do projeto LeadsRapido - Todos os direitos reservados.
