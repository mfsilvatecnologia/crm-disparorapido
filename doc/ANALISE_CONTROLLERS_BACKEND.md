# Análise Detalhada dos Controllers do Backend

## Sumário Executivo

Este documento apresenta a análise completa dos controllers do backend LeadsRápido, mapeando todas as funcionalidades disponíveis e identificando as necessidades do frontend.

**Controllers Analisados:** 11 controllers  
**Endpoints Mapeados:** 50+ endpoints  
**Funcionalidades Identificadas:** 8 módulos principais  
**Status:** Análise Completa ✅

---

## 1. AuthController (`/auth`)

### Endpoints Disponíveis
- `POST /auth/login` - Login do usuário
- `POST /auth/register` - Registro de usuário e empresa  
- `POST /auth/reset-password` - Redefinição de senha

### Operações CRUD
- **Create**: Registro de usuários e empresas
- **Read**: Validação de credenciais no login

### Funcionalidades Específicas
- ✅ Autenticação JWT
- ✅ Registro simultâneo de usuário e empresa
- ✅ Reset de senha por email/CNPJ
- ✅ Validação de campos obrigatórios
- ✅ Logs de segurança com dados mascarados

### Modelos de Dados
```typescript
interface RegisterRequest {
  email: string;
  password: string;
  cnpj: string;
  empresa: string;
}

interface LoginRequest {
  email: string;
  password: string;
  cnpj?: string;
  empresa_id?: string;
}

interface ResetPasswordRequest {
  email: string;
  cnpj: string;
}
```

---

## 2. UserController (`/api/v1/users`)

### Endpoints Disponíveis
- `POST /api/v1/users` - Criar usuário
- `GET /api/v1/users/{id}` - Buscar usuário por ID
- `GET /api/v1/users` - Listar usuários (com filtros e paginação)
- `PUT /api/v1/users/{id}` - Atualizar usuário
- `DELETE /api/v1/users/{id}` - Desativar usuário (soft delete)
- `POST /api/v1/users/{id}/roles` - Atribuir role ao usuário
- `GET /api/v1/users/me` - Obter perfil próprio
- `PUT /api/v1/users/me` - Atualizar perfil próprio

### Operações CRUD
- **Create**: Criação de usuários com validação hierárquica
- **Read**: Busca individual, listagem com filtros/paginação, perfil próprio
- **Update**: Atualização com controle de permissões, gestão de roles
- **Delete**: Soft delete com proteções (não pode desativar último admin)

### Funcionalidades Específicas
- ✅ Sistema de roles hierárquico (admin > gerente > usuario)
- ✅ Filtragem diferencial baseada em permissões
- ✅ Isolamento multi-tenant por empresa
- ✅ Auditoria completa de operações críticas
- ✅ Proteções contra escalação de privilégios
- ✅ Gestão de perfil próprio

### Modelos de Dados
- `CreateUserData`, `UpdateUserData`
- **Roles**: `admin`, `gerente`, `usuario`

---

## 3. EmpresaController (`/empresas`)

### Endpoints Disponíveis
- `GET /empresas` - Listar todas as empresas
- `GET /empresas/{id}` - Obter empresa por ID
- `POST /empresas` - Criar nova empresa
- `PUT /empresas/{id}` - Atualizar empresa
- `DELETE /empresas/{id}` - Deletar empresa

### Operações CRUD
- **Create**: Criação de empresas
- **Read**: Listagem e busca individual
- **Update**: Atualização completa
- **Delete**: Remoção permanente

### Funcionalidades Específicas
- ✅ Gestão básica de empresas
- ✅ Validação de CNPJ único
- ✅ Associação com usuários criadores

### Modelos de Dados
```typescript
interface CreateEmpresaData {
  nome: string;
  cnpj: string;
  telefone?: string;
  email?: string;
  endereco?: string;
}

interface UpdateEmpresaData extends Partial<CreateEmpresaData> {}
```

---

## 4. LeadController (`/leads`)

### Endpoints Disponíveis
- `POST /leads` - Criar novo lead
- `GET /leads/{id}` - Buscar lead por ID
- `GET /leads` - Listar leads com filtros avançados e paginação
- `PUT /leads/{id}` - Atualizar lead
- `DELETE /leads/{id}` - Deletar lead

### Operações CRUD
- **Create**: Criação de leads com validação completa
- **Read**: Busca individual e listagem com filtros avançados
- **Update**: Atualização completa de dados
- **Delete**: Remoção permanente

### Funcionalidades Específicas
- ✅ Filtros avançados (status, score, segmento, porte, fonte, tags, datas)
- ✅ Paginação e ordenação
- ✅ Busca textual
- ✅ Isolamento por empresa
- ✅ Score de qualificação
- ✅ Gestão de tags
- ✅ Dados de endereço com coordenadas
- ✅ Controle de custo de aquisição

### Modelos de Dados
```typescript
interface CreateLeadDTO {
  nomeEmpresa: string;
  nomeContato: string;
  email: string;
  telefone: string;
  endereco?: EnderecoData;
  segmento?: string;
  porte?: string;
  fonte?: string;
  tags?: string[];
  score?: number;
  custoAquisicao?: number;
}

enum LeadStatus {
  NOVO = 'novo',
  CONTATO_INICIAL = 'contato_inicial',
  QUALIFICADO = 'qualificado',
  PROPOSTA = 'proposta',
  FECHADO = 'fechado',
  PERDIDO = 'perdido'
}
```

---

## 5. LeadAdvancedController (`/api/v1/leads`)

### Endpoints Disponíveis
- `POST /api/v1/leads/{id}/enrich` - Enriquecer dados do lead
- `POST /api/v1/leads/{id}/validate-contacts` - Validar contatos (email/telefone)
- `POST /api/v1/leads/detect-duplicates` - Detectar leads duplicados
- `POST /api/v1/leads/{id}/calculate-score` - Calcular score de qualificação

### Funcionalidades Específicas
- **Enriquecimento**: Busca dados adicionais de fontes externas
- **Validação**: Verificação de email e telefone
- **Detecção de Duplicatas**: Algoritmo de similaridade com threshold configurável  
- **Score**: Cálculo automatizado de qualificação com regras personalizáveis

### Modelos de Dados
```typescript
interface EnrichmentResult {
  fonte: string;
  camposAtualizados: string[];
  dadosEncontrados: Record<string, any>;
  confiabilidade: number;
}

interface ValidationResult {
  email: {
    valido: boolean;
    razao?: string;
    deliverability: 'high' | 'medium' | 'low';
  };
  telefone: {
    valido: boolean;
    formato: 'nacional' | 'internacional';
    operadora?: string;
  };
}

interface DuplicateDetectionResult {
  duplicatas: Array<{
    leadId: string;
    similaridade: number;
    camposSimilares: string[];
  }>;
  recomendacao: 'merge' | 'keep_separate' | 'review';
}

interface ScoreCalculationResult {
  score: number;
  breakdown: {
    dadosCompletos: number;
    engagement: number;
    potencialComercial: number;
    timing: number;
  };
  categoria: 'hot' | 'warm' | 'cold';
  proximasAcoes: string[];
}
```

---

## 6. CampanhaController (`/api/v1/campanhas`)

### Endpoints Disponíveis
- `POST /api/v1/campanhas` - Criar nova campanha
- `PUT /api/v1/campanhas/{id}` - Atualizar campanha
- `DELETE /api/v1/campanhas/{id}` - Deletar campanha
- `PATCH /api/v1/campanhas/{id}/status` - Atualizar status

### Operações CRUD
- **Create**: Criação de campanhas
- **Update**: Atualização completa e de status
- **Delete**: Remoção com validações

### Funcionalidades Específicas
- ✅ Gestão de campanhas de geração de leads
- ✅ Controle de status (rascunho, ativa, pausada, concluída, cancelada)
- ✅ Associação com empresa e usuário criador

### Modelos de Dados
```typescript
interface CreateCampanhaData {
  nome: string;
  descricao?: string;
  tipo: 'email' | 'whatsapp' | 'linkedin' | 'telefone';
  configuracao: CampanhaConfig;
  segmentoAlvo?: string[];
  dataInicio?: string;
  dataFim?: string;
}

enum CampanhaStatus {
  RASCUNHO = 'rascunho',
  ATIVA = 'ativa',
  PAUSADA = 'pausada',
  CONCLUIDA = 'concluida',
  CANCELADA = 'cancelada'
}
```

---

## 7. WorkerController (`/workers`)

### Endpoints Disponíveis
- `GET /workers/leads-temp/status` - Status do worker de leads temporários
- `POST /workers/leads-temp/start` - Iniciar worker
- `POST /workers/leads-temp/stop` - Parar worker
- `POST /workers/leads-temp/consumer/start` - Iniciar consumer de mensagens
- `POST /workers/leads-temp/consumer/stop` - Parar consumer
- `GET /workers/leads-temp/consumer/status` - Status do consumer

### Funcionalidades Específicas
- ✅ Controle de workers background
- ✅ Monitoramento em tempo real via Realtime Service
- ✅ Gestão de filas de mensagens
- ✅ Estatísticas de processamento

### Modelos de Dados
```typescript
interface WorkerStatus {
  isRunning: boolean;
  startTime?: string;
  errorCount: number;
  processedCount: number;
  config: WorkerConfig;
}

interface WorkerStatistics {
  totalProcessed: number;
  successRate: number;
  averageProcessingTime: number;
  errorsLastHour: number;
}
```

---

## 8. SearchTermController (`/api/v1/search-terms`)

### Endpoints Disponíveis
- `POST /api/v1/search-terms` - Criar termo de busca
- `GET /api/v1/search-terms/{id}` - Buscar termo por ID
- `GET /api/v1/search-terms` - Listar termos com filtros
- `PUT /api/v1/search-terms/{id}` - Atualizar termo
- `DELETE /api/v1/search-terms/{id}` - Remover termo (soft delete)
- `GET /api/v1/search-terms/categories` - Listar categorias
- `GET /api/v1/search-terms/stats` - Estatísticas dos termos

### Operações CRUD
- **Create**: Criação de termos com validação de duplicatas
- **Read**: Busca individual, listagem com filtros, categorias, estatísticas
- **Update**: Atualização completa
- **Delete**: Soft delete

### Funcionalidades Específicas
- ✅ Organização por categorias
- ✅ Controle ativo/inativo
- ✅ Busca textual por termo ou descrição
- ✅ Paginação
- ✅ Estatísticas de uso

### Modelos de Dados
```typescript
interface CreateSearchTermData {
  termo: string;
  categoria: string;
  descricao?: string;
  ativo: boolean;
}

interface SearchTermStats {
  termoId: string;
  termo: string;
  totalBuscas: number;
  leadsGerados: number;
  taxaSucesso: number;
  ultimaExecucao: string;
}
```

---

## 9. GoogleMapsScrapingController (`/scraping`)

### Endpoints Disponíveis
- `GET /scraping/status` - Status do worker de scraping
- `POST /scraping/start` - Iniciar worker
- `POST /scraping/stop` - Parar worker
- `POST /scraping/jobs` - Adicionar job de scraping
- `POST /scraping/jobs/bulk` - Adicionar múltiplos jobs
- `POST /scraping/jobs/segmented` - Jobs por segmento pré-definido
- `GET /scraping/stats` - Estatísticas de leads coletados
- `GET /scraping/templates` - Templates de busca disponíveis

### Funcionalidades Específicas
- ✅ Scraping automatizado do Google Maps
- ✅ Jobs com prioridades
- ✅ Templates por segmento (restaurantes, saúde, serviços, etc.)
- ✅ Filtros avançados (verificados, com telefone, avaliação mínima)
- ✅ Processamento em lote
- ✅ Estatísticas detalhadas

### Modelos de Dados
```typescript
interface GoogleMapsSearchParams {
  termo: string;
  localizacao: string;
  filtros: {
    verificado?: boolean;
    comTelefone?: boolean;
    avaliacaoMinima?: number;
    aberto?: boolean;
  };
  limite: number;
  prioridade: 'low' | 'normal' | 'high';
}

interface ScrapingJobData {
  id: string;
  parametros: GoogleMapsSearchParams;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progresso: number;
  leadsEncontrados: number;
  erros: string[];
  criadoEm: string;
  finalizadoEm?: string;
}

interface ScrapingTemplate {
  id: string;
  nome: string;
  segmento: string;
  parametrosBase: GoogleMapsSearchParams;
  localizacoesSugeridas: string[];
}
```

---

## 10. WorkerFeatureToggleController (`/workers/toggles`)

### Endpoints Disponíveis
- `GET /workers/toggles` - Status de todos os workers
- `POST /workers/toggles/{workerName}/enable` - Habilitar worker
- `POST /workers/toggles/{workerName}/disable` - Desabilitar worker
- `PUT /workers/toggles/{workerName}/concurrency` - Atualizar concurrency
- `GET /workers/toggles/{workerName}/config` - Configuração do worker

### Funcionalidades Específicas
- ✅ Controle granular de workers
- ✅ Configuração de concorrência
- ✅ Feature toggles em tempo real
- ✅ Monitoramento centralizado

### Modelos de Dados
```typescript
interface WorkerToggleConfig {
  enabled: boolean;
  concurrency: number;
  maxRetries: number;
  timeout: number;
}

interface WorkerToggleStatus {
  workerName: string;
  enabled: boolean;
  running: boolean;
  config: WorkerToggleConfig;
  stats: {
    totalJobs: number;
    successfulJobs: number;
    failedJobs: number;
    averageExecutionTime: number;
  };
}

// Workers suportados
type SupportedWorkers = 
  | 'googleMapsLinksPublisher'
  | 'googleMapsDetailsConsumer'
  | 'leads-temp-processor';
```

---

## 11. ChatwootWebhookController (`/api/v1/webhooks/chatwoot`)

### Endpoints Disponíveis
- `POST /api/v1/webhooks/chatwoot` - Receber webhook do ChatWoot
- `POST /api/v1/webhooks/chatwoot/test` - Testar processamento
- `GET /api/v1/webhooks/chatwoot/validate` - Validar configuração

### Funcionalidades Específicas
- ✅ Integração com ChatWoot
- ✅ Processamento de conversas
- ✅ Análise de potencial comercial
- ✅ Extração de insights de conversas
- ✅ Cálculo de prioridade e status de qualificação

### Modelos de Dados
```typescript
interface ChatwootWebhookDTO {
  account: {
    id: number;
    name: string;
  };
  conversation: {
    id: number;
    status: string;
    messages: Array<{
      id: number;
      content: string;
      message_type: 'incoming' | 'outgoing';
      created_at: string;
      sender: {
        id: number;
        name: string;
        email?: string;
        phone?: string;
      };
    }>;
  };
  event: 'conversation_updated' | 'message_created' | 'conversation_resolved';
}

interface ChatwootLeadInsight {
  leadPotential: 'high' | 'medium' | 'low';
  interesse: string[];
  sentimento: 'positive' | 'neutral' | 'negative';
  proximaAcao: string;
  prioridade: number;
  tags: string[];
}
```

---

## Resumo de Funcionalidades por Módulo

### 🔐 Autenticação
- ✅ Login/Register implementados
- ❌ Reset de senha (falta implementar no frontend)

### 👤 Gestão de Usuários
- ❌ CRUD completo de usuários
- ❌ Gestão de roles e permissões
- ❌ Perfil do usuário

### 🏢 Gestão de Empresas
- ✅ Cadastro básico implementado
- ❌ CRUD completo e listagem

### 📊 Gestão de Leads
- ✅ CRUD básico implementado
- ❌ Ferramentas avançadas (enriquecimento, validação, duplicatas, score)

### 📧 Campanhas
- ❌ Sistema completo de campanhas

### 🔍 Termos de Busca
- ❌ Gestão de termos para scraping

### 🗺️ Google Maps Scraping
- ❌ Interface de scraping
- ✅ Monitoramento básico de workers implementado

### ⚙️ Workers e Feature Toggles
- ✅ Monitoramento básico implementado
- ❌ Feature toggles granulares

### 🔗 Integrações
- ❌ Integração ChatWoot

---

## Próximos Passos Recomendados

1. **Prioridade Alta**: Completar módulos críticos (Usuários, Campanhas)
2. **Prioridade Média**: Implementar ferramentas avançadas (Lead Tools, Scraping)
3. **Prioridade Baixa**: Integrações e funcionalidades administrativas

**Total de endpoints mapeados**: 50+  
**Controllers analisados**: 11/11 ✅  
**Funcionalidades identificadas**: 8 módulos principais