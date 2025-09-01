# Plano de Alterações - Frontend LeadsRapido
## Adaptação para Backend Separado

**Data:** 31 de agosto de 2025  
**Responsável:** AI Assistant  
**Contexto:** Backend removido para aplicação separada. Frontend agora consome APIs do backend.

---

## 🎯 OBJETIVO

Adaptar o frontend React/Vite do LeadsRapido para operar como cliente puro do backend, implementando todas as funcionalidades descritas no documento `INTERFACE_UX.md` através de chamadas API.

## 📋 ANÁLISE DO DOCUMENTO INTERFACE_UX.md

### Principais Requisitos Identificados:

1. **Dashboard Principal**
   - KPIs em tempo real (leads, qualidade, ROI)
   - Widgets de campanhas ativas, leads recentes, performance analytics
   - Monitor de uso e limites

2. **Gestão de Campanhas**
   - Lista de campanhas com status e métricas
   - Wizard multi-step para criação de campanhas
   - Configurações de scraping e segmentação

3. **Leads Database**
   - Interface avançada com filtros, busca e visualizações múltiplas
   - Card view, table view e kanban view
   - Sistema de qualificação e pipeline

4. **Integrações**
   - Dashboard de integrações ativas (CRM, webhooks)
   - Configuração de webhooks com mapeamento de campos
   - API tokens e documentação

5. **Sistema de Design**
   - Paleta de cores B2B específica
   - Componentes padronizados
   - Layout responsivo

## 🔧 MUDANÇAS NECESSÁRIAS

### 1. Infraestrutura de API

#### **API Client**
- Implementar cliente HTTP (Axios/Fetch) centralizado
- Configurar base URL do backend
- Implementar interceptors para autenticação
- Tratamento de erros padronizado

#### **Autenticação**
- Integrar AuthContext com backend
- Implementar login/logout via API
- Gerenciamento de tokens JWT
- Refresh token automático

#### **Estado Global**
- Atualizar OrganizationContext para consumir dados do backend
- Implementar React Query/SWR para cache e sincronização
- Loading states e error boundaries

### 2. Componentes do Dashboard

#### **KPIs e Métricas**
- Substituir dados mock por chamadas API
- Implementar real-time updates (WebSocket/Polling)
- Tratamento de estados de carregamento

#### **Widgets**
- Campanhas Ativas: `/api/campaigns/active`
- Leads Recentes: `/api/leads/recent`
- Performance Analytics: `/api/analytics/performance`
- Usage Monitor: `/api/billing/usage`

### 3. Gestão de Campanhas

#### **Lista de Campanhas**
- Endpoint: `/api/campaigns`
- Filtros e paginação
- Ações: pausar, configurar, relatórios

#### **Wizard de Criação**
- Multi-step form com validação
- Integração com APIs de segmentação
- Preview e estimativas em tempo real

#### **Configurações**
- Scraping settings via API
- Agendamento e automação

### 4. Leads Database

#### **Interface Principal**
- Busca e filtros: `/api/leads/search`
- Múltiplas visualizações (cards, table, kanban)
- Ações em lote (export, tags, delete)

#### **Sistema de Qualificação**
- Pipeline de qualificação
- Score calculation via backend
- Histórico de interações

#### **Export e Integração**
- Geração de exports via API
- Webhooks para CRM

### 5. Integrações

#### **CRM Integrations**
- Lista de CRMs conectados: `/api/integrations/crm`
- Configuração OAuth flow
- Status de sincronização

#### **Webhooks**
- CRUD operations: `/api/webhooks`
- Test functionality
- Logs e monitoring

#### **API Management**
- Token generation: `/api/tokens`
- Usage tracking
- Rate limiting display

### 6. UI/UX Implementation

#### **Design System**
- Implementar variáveis CSS conforme paleta definida
- Componentes shadcn/ui padronizados
- Responsividade mobile-first

#### **Layout Base**
- Sidebar navigation
- Header com search e notifications
- Breadcrumb system

#### **Estados e Feedback**
- Loading skeletons
- Error states com retry
- Success notifications
- Empty states

## ✅ PROGRESSO IMPLEMENTADO

### **Fase 1: Infraestrutura (COMPLETA)**
- ✅ Configurar API client (Axios já estava disponível)
- ✅ Implementar autenticação JWT (atualizada para usar `/api/v1/auth/login`)
- ✅ Atualizar contextos (AuthContext já implementado)
- ✅ Setup React Query (já configurado)
- ✅ Implementar error handling global (ApiError class já implementada)
- ✅ **NOVO:** Corrigir compatibilidade com backend (campos `email` + `senha` para login)
- ✅ **NOVO:** Corrigir endpoints API (`/api/v1/leads` em vez de `/api/leads`)
- ✅ **NOVO:** Atualizar schemas Zod para incluir campos obrigatórios do backend

### **Fase 2: Core Features (EM ANDAMENTO)**
- ✅ Dashboard funcional com dados reais
- ✅ Leads database básica com API real
- ✅ **NOVO:** Login funcionando com backend real
- 🔄 Campanhas CRUD (ainda mock)
- 🔄 Integrações (ainda mock)

### **Problemas Resolvidos:**

#### **1. Erro de Login "Failed to make request"**
- **Causa:** Backend requeria campos `email` + `senha` (swagger dizia apenas `password`)
- **Solução:** Atualizar `LoginSchema` para usar apenas `password` conforme documentação
- **Status:** ✅ RESOLVIDO - Login funcionando com formato correto:
  ```json
  {
    "email": "joao@leadsrapido.com.br",
    "password": "password123"
  }
  ```

#### **2. Endpoints Incorretos**
- **Causa:** Alguns endpoints usando `/api/leads` em vez de `/api/v1/leads`
- **Solução:** Atualizar todos os endpoints para usar versão correta da API
- **Status:** ✅ RESOLVIDO - Todos os endpoints corrigidos

#### **3. Tipos de Dados Faltando**
- **Causa:** `CreateLeadDTO` e `UpdateLeadDTO` não exportados
- **Solução:** Adicionar exportações dos tipos no `schemas.ts`
- **Status:** ✅ RESOLVIDO - Todos os tipos disponíveis

### **Mudanças Implementadas:**

#### **1. API Client Atualizado**
- URL base alterada para `http://localhost:3000`
- Endpoints atualizados conforme swagger.json
- Método de login usando `/api/v1/auth/login`
- Métodos para leads usando `/api/leads`

#### **2. Schemas Atualizados**
- `PaginatedResponseSchema` adicionado
- `CreateLeadDTO` e `UpdateLeadDTO` criados
- Estrutura de resposta alinhada com swagger

#### **3. Hooks React Query**
- `useLeads` hook criado para buscar leads
- Suporte a filtros, paginação e busca
- Cache inteligente com staleTime

#### **4. Componentes Atualizados**
- **Dashboard**: KPIs usando dados reais de leads
- **LeadsPage**: Tabela usando campos corretos do swagger
- **Estatísticas**: Cálculos baseados em dados reais

#### **5. Configuração**
- Arquivo `.env.local` criado com variáveis necessárias
- Base URL configurada para backend

## 🔄 PRÓXIMOS PASSOS

### **Imediato (Esta Semana)**
1. **Testar Integração**: Iniciar backend e testar endpoints
2. **Ajustes de UI**: Corrigir campos que podem estar undefined
3. **Loading States**: Melhorar UX durante carregamento
4. **Error Handling**: Tratar casos de erro da API

### **Curto Prazo (Próximas 2 Semanas)**
1. **Campanhas**: Implementar CRUD completo
2. **Filtros Avançados**: Segmentação, status, qualidade
3. **Export**: Funcionalidade de exportar leads
4. **Analytics**: Gráficos com dados reais

### **Médio Prazo (Mês Seguinte)**
1. **Integrações**: CRM, webhooks, API keys
2. **Multi-tenant**: Suporte completo a organizações
3. **Performance**: Otimização de queries e cache
4. **Testes**: Unitários e E2E

## 🧪 TESTE DA INTEGRAÇÃO

Para testar a integração:

1. **Backend**: Certificar que está rodando na porta 3000
2. **Frontend**: `npm run dev` (porta 8080)
3. **Login**: Usar credenciais `teste@leadsrapido.com.br` / `password123`
4. **Dashboard**: Verificar se KPIs e gráficos carregam dados reais
5. **Leads**: Testar busca e filtros na página de leads

### **Credenciais de Teste:**
- **Email:** `teste@leadsrapido.com.br`
- **Password:** `password123`

### **Formato de Login:**
```json
{
  "email": "teste@leadsrapido.com.br",
  "password": "password123"
}
```

### **URLs de Teste:**
- **Frontend:** http://localhost:8080
- **Backend:** http://localhost:3000
- **API Health:** http://localhost:3000/api/v1/health

## 🎯 PRÓXIMOS PASSOS

### **Imediatos (Esta Sessão)**
- ✅ **COMPLETADO:** Resolver erro de login
- ✅ **COMPLETADO:** Corrigir endpoints da API
- ✅ **COMPLETADO:** Atualizar schemas e tipos
- 🔄 Testar Dashboard e LeadsPage com dados reais
- 🔄 Verificar se OrganizationContext funciona
- 🔄 Testar criação/edição de leads

### **Próximas Sessões**
- Implementar Campanhas CRUD com API real
- Sistema de Integrações (CRM, Webhooks)
- Analytics em tempo real
- Sistema de notificações
- Export de dados
- Testes automatizados (Unit + E2E)

### **Pendências Técnicas**
- Analytics ainda usando dados mock (endpoint `/api/v1/analytics` pode não existir)
- Campanhas ainda mock (endpoints não implementados no backend)
- Webhooks e integrações mock
- Sistema de notificações não implementado

## 🚨 POSSÍVEIS PROBLEMAS

### **Durante Teste:**
- **CORS**: Verificar configuração CORS no backend
- **Autenticação**: Tokens JWT devem ser válidos
- **Campos Opcionais**: Alguns campos podem ser undefined
- **Paginação**: Verificar se estrutura de resposta está correta

### **Soluções:**
- Adicionar logs de debug nos interceptors
- Implementar fallbacks para campos undefined
- Criar dados mock para desenvolvimento
- Documentar dependências entre frontend/backend

## 🔗 DEPENDÊNCIAS E INTEGRAÇÕES

### **APIs Necessárias (Backend)**
- `GET /api/auth/login`
- `GET /api/dashboard/metrics`
- `GET /api/campaigns`
- `POST /api/campaigns`
- `GET /api/leads`
- `GET /api/integrations`
- `POST /api/webhooks`

### **Bibliotecas Frontend**
- Axios ou Fetch API
- React Query (TanStack Query)
- React Hook Form
- Zod para validação
- Chart.js ou Recharts para gráficos
- React Router para navegação

## 🧪 TESTES E QUALIDADE

### **Testes Unitários**
- Componentes com dados mock
- API calls com MSW
- Form validations

### **Testes de Integração**
- Fluxos completos (login → dashboard)
- API error handling
- Offline functionality

### **Testes E2E**
- Cypress ou Playwright
- User journeys críticos
- Cross-browser testing

## 📊 MÉTRICAS DE SUCESSO

- Tempo de carregamento < 2s
- API response time < 500ms
- 99% uptime do frontend
- Zero erros de JavaScript em produção
- Score Lighthouse > 90

## ⏰ CRONOGRAMA SUGERIDO

### **Semana 1-2: Infraestrutura**
- API client e autenticação
- Contextos atualizados
- Base setup

### **Semana 3-4: Core Features**
- Dashboard funcional
- Leads database básica
- Campanhas CRUD

### **Semana 5-6: Advanced Features**
- Integrações completas
- Analytics avançados
- UI/UX polish

### **Semana 7-8: Testing & Launch**
- Testes completos
- Performance optimization
- Deploy e monitoramento

## 🚨 RISCOS E MITIGAÇÕES

### **Riscos Técnicos**
- **API Instabilidade**: Implementar circuit breaker e retry logic
- **Rate Limiting**: UI feedback para limites atingidos
- **Offline Support**: Service worker para funcionalidades críticas

### **Riscos de Produto**
- **Mudanças no Backend**: Versionamento de API e contratos
- **Performance**: Lazy loading e code splitting
- **Segurança**: Input sanitization e HTTPS obrigatório

## 📚 RECURSOS NECESSÁRIOS

- **Equipe**: 1-2 desenvolvedores frontend
- **Design**: UI/UX designer para ajustes
- **Backend**: Coordenação com equipe de backend
- **DevOps**: Setup de CI/CD e monitoramento
- **QA**: Testes manuais e automatizados

---

**Próximos Passos:**
1. Revisar este plano com stakeholders
2. Definir endpoints da API com backend team
3. Iniciar implementação da infraestrutura
4. Setup do ambiente de desenvolvimento
