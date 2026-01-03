# Modelo de Dados: CRM Management System

**Feature**: 001-crm-management
**Data**: 2026-01-03
**Baseado em**: `/leadsrapido_backend/swagger.json`

## Sumário

Este documento mapeia entidades do backend para tipos TypeScript no frontend, incluindo:
- Interfaces de tipos principais
- Request/Response DTOs
- Validações Zod
- Transformações de dados (API ↔ UI)

---

## 1. Oportunidades (Opportunities)

### 1.1 Tipos TypeScript

```typescript
// src/features/crm/types/opportunity.ts

export type OpportunityStage =
  | 'Lead'
  | 'Qualificado'
  | 'Proposta'
  | 'Negociacao'
  | 'Ganha'
  | 'Perdida';

export type OpportunityStatus = 'active' | 'won' | 'lost';

export interface Opportunity {
  id: string;
  leadId: string | null;
  nome: string;
  descricao: string | null;
  valorEstimado: number;
  probabilidade: number; // 0-100
  estagio: OpportunityStage;
  status: OpportunityStatus;
  expectedCloseDate: string; // ISO 8601
  motivoPerdida: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OpportunityListItem extends Opportunity {
  // Campos adicionais para lista (se houver)
}

export interface OpportunityDetail extends Opportunity {
  // Campos adicionais para detalhes (ex: atividades)
  activities?: Activity[];
}
```

### 1.2 Request/Response DTOs

```typescript
// Request - POST /opportunities
export interface CreateOpportunityRequest {
  lead_id?: string | null;
  nome: string;
  descricao?: string | null;
  valor_estimado: number;
  probabilidade: number;
  estagio: string;
  expected_close_date: string; // ISO 8601
}

// Response - GET /opportunities (paginado)
export interface OpportunitiesResponse {
  data: Opportunity[];
  nextCursor: string | null;
  total: number;
}

// Response - GET /opportunities/{id}
export interface OpportunityResponse {
  data: Opportunity;
}

// Request - PATCH /opportunities/{id}
export interface UpdateOpportunityRequest {
  nome?: string;
  descricao?: string | null;
  valor_estimado?: number;
  probabilidade?: number;
  estagio?: string;
  expected_close_date?: string;
}

// Request - POST /opportunities/{id}/lose
export interface LoseOpportunityRequest {
  motivo_perdida: string;
}

// Response - POST /opportunities/{id}/win
export interface WinOpportunityResponse {
  data: {
    opportunity: Opportunity;
    customer: Customer;
  };
}
```

### 1.3 Validações Zod

```typescript
// src/features/crm/lib/validations.ts

import { z } from 'zod';

export const opportunityStageSchema = z.enum([
  'Lead',
  'Qualificado',
  'Proposta',
  'Negociacao',
  'Ganha',
  'Perdida',
]);

export const createOpportunitySchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255),
  descricao: z.string().nullable().optional(),
  valorEstimado: z
    .number({ required_error: 'Valor estimado é obrigatório' })
    .positive('Valor deve ser positivo'),
  probabilidade: z
    .number()
    .int()
    .min(0, 'Probabilidade mínima é 0%')
    .max(100, 'Probabilidade máxima é 100%'),
  estagio: opportunityStageSchema,
  expectedCloseDate: z.string().min(1, 'Data prevista é obrigatória'),
  leadId: z.string().uuid().nullable().optional(),
});

export const updateOpportunitySchema = createOpportunitySchema.partial();

export const loseOpportunitySchema = z.object({
  motivoPerdida: z.string().min(3, 'Motivo deve ter no mínimo 3 caracteres'),
});

export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>;
export type UpdateOpportunityInput = z.infer<typeof updateOpportunitySchema>;
export type LoseOpportunityInput = z.infer<typeof loseOpportunitySchema>;
```

### 1.4 Transformações

```typescript
// API → UI
export function transformOpportunityFromAPI(data: any): Opportunity {
  return {
    id: data.id,
    leadId: data.lead_id,
    nome: data.nome,
    descricao: data.descricao,
    valorEstimado: Number(data.valor_estimado),
    probabilidade: data.probabilidade,
    estagio: data.estagio,
    status: data.status,
    expectedCloseDate: data.expected_close_date,
    motivoPerdida: data.motivo_perdida,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// UI → API
export function transformOpportunityToAPI(data: CreateOpportunityInput): CreateOpportunityRequest {
  return {
    lead_id: data.leadId,
    nome: data.nome,
    descricao: data.descricao,
    valor_estimado: data.valorEstimado,
    probabilidade: data.probabilidade,
    estagio: data.estagio,
    expected_close_date: data.expectedCloseDate,
  };
}
```

---

## 2. Clientes (Customers)

### 2.1 Tipos TypeScript

```typescript
// src/features/crm/types/customer.ts

export type CustomerStatus = 'Ativo' | 'EmRisco' | 'Cancelado' | 'Pausado';

export type CustomerSegment = 'Enterprise' | 'SMB' | 'Startup' | 'Outro';

export interface Customer {
  id: string;
  nome: string;
  cnpj: string | null;
  segmento: CustomerSegment | null;
  status: CustomerStatus;
  endereco: string | null;
  telefone: string | null;
  email: string | null;
  notas: string | null;
  healthScore: number | null; // 0-100
  createdAt: string;
  updatedAt: string;
}

export interface CustomerTimeline {
  customerId: string;
  events: TimelineEvent[];
}

export interface HealthScoreResponse {
  score: number; // 0-100
  factors: {
    engagement: number;
    contractValue: number;
    activityRecency: number;
  };
  status: 'healthy' | 'at_risk' | 'critical' | 'insufficient_data';
}
```

### 2.2 Request/Response DTOs

```typescript
// Request - PATCH /customers/{id}
export interface UpdateCustomerRequest {
  nome?: string;
  segmento?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  notas?: string;
}

// Request - PATCH /customers/{id}/status
export interface UpdateCustomerStatusRequest {
  status: CustomerStatus;
}

// Response - GET /customers (paginado)
export interface CustomersResponse {
  data: Customer[];
  nextCursor: string | null;
  total: number;
}

// Response - GET /customers/{id}/timeline
export interface CustomerTimelineResponse {
  data: TimelineEvent[];
}
```

### 2.3 Validações Zod

```typescript
export const customerStatusSchema = z.enum(['Ativo', 'EmRisco', 'Cancelado', 'Pausado']);

export const customerSegmentSchema = z.enum(['Enterprise', 'SMB', 'Startup', 'Outro']);

export const updateCustomerSchema = z.object({
  nome: z.string().min(1).max(255).optional(),
  segmento: customerSegmentSchema.nullable().optional(),
  endereco: z.string().nullable().optional(),
  telefone: z.string().nullable().optional(),
  email: z.string().email('Email inválido').nullable().optional(),
  notas: z.string().nullable().optional(),
});

export const updateCustomerStatusSchema = z.object({
  status: customerStatusSchema,
});

export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type UpdateCustomerStatusInput = z.infer<typeof updateCustomerStatusSchema>;
```

---

## 3. Contatos (Customer Contacts)

### 3.1 Tipos TypeScript

```typescript
// src/features/crm/types/contact.ts

export interface Contact {
  id: string;
  customerId: string;
  nome: string;
  email: string;
  telefone: string | null;
  cargo: string | null;
  departamento: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 3.2 Request/Response DTOs

```typescript
// Request - POST /customers/{customerId}/contacts
export interface CreateContactRequest {
  nome: string;
  email: string;
  telefone?: string | null;
  cargo?: string | null;
  departamento?: string | null;
}

// Request - PATCH /customers/{customerId}/contacts/{id}
export interface UpdateContactRequest {
  nome?: string;
  email?: string;
  telefone?: string | null;
  cargo?: string | null;
  departamento?: string | null;
}

// Response - GET /customers/{customerId}/contacts
export interface ContactsResponse {
  data: Contact[];
}
```

### 3.3 Validações Zod

```typescript
export const createContactSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255),
  email: z.string().email('Email inválido'),
  telefone: z.string().nullable().optional(),
  cargo: z.string().nullable().optional(),
  departamento: z.string().nullable().optional(),
});

export const updateContactSchema = createContactSchema.partial();

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
```

---

## 4. Atividades (Customer Activities)

### 4.1 Tipos TypeScript

```typescript
// src/features/crm/types/activity.ts

export type ActivityType = 'call' | 'meeting' | 'email' | 'note';

export interface Activity {
  id: string;
  customerId: string;
  tipo: ActivityType;
  descricao: string;
  dataHora: string; // ISO 8601
  userId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

### 4.2 Request/Response DTOs

```typescript
// Request - POST /customers/{customerId}/activities
export interface CreateActivityRequest {
  tipo: ActivityType;
  descricao: string;
  data_hora: string; // ISO 8601
}

// Request - PATCH /activities/{id}
export interface UpdateActivityRequest {
  tipo?: ActivityType;
  descricao?: string;
  data_hora?: string;
}

// Response - GET /customers/{customerId}/activities
export interface ActivitiesResponse {
  data: Activity[];
}
```

### 4.3 Validações Zod

```typescript
export const activityTypeSchema = z.enum(['call', 'meeting', 'email', 'note']);

export const createActivitySchema = z.object({
  tipo: activityTypeSchema,
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  dataHora: z.string().min(1, 'Data/hora é obrigatória'),
});

export const updateActivitySchema = createActivitySchema.partial();

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
```

---

## 5. Contratos (Customer Contracts)

### 5.1 Tipos TypeScript

```typescript
// src/features/crm/types/contract.ts

export type ContractStatus = 'active' | 'expired' | 'renewed';

export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

export interface Contract {
  id: string;
  customerId: string;
  tipo: string;
  valor: number;
  dataInicio: string; // ISO 8601
  dataFim: string; // ISO 8601
  cicloCobranca: BillingCycle;
  termos: string | null;
  status: ContractStatus;
  contratoAnteriorId: string | null; // Para renovações
  createdAt: string;
  updatedAt: string;
}

export interface NearRenewalContract extends Contract {
  daysUntilRenewal: number;
}
```

### 5.2 Request/Response DTOs

```typescript
// Request - POST /customers/{customerId}/contracts
export interface CreateContractRequest {
  tipo: string;
  valor: number;
  data_inicio: string; // ISO 8601
  data_fim: string; // ISO 8601
  ciclo_cobranca: BillingCycle;
  termos?: string | null;
}

// Request - PATCH /contracts/{id}
export interface UpdateContractRequest {
  tipo?: string;
  valor?: number;
  ciclo_cobranca?: BillingCycle;
  termos?: string | null;
  // Datas não podem ser alteradas para contratos ativos
}

// Request - POST /contracts/{id}/renew
export interface RenewContractRequest {
  data_inicio: string;
  data_fim: string;
  valor: number;
  ciclo_cobranca?: BillingCycle;
  termos?: string | null;
}

// Response - GET /customers/{customerId}/contracts
export interface ContractsResponse {
  data: Contract[];
}

// Response - GET /contracts/near-renewal
export interface NearRenewalResponse {
  data: NearRenewalContract[];
}
```

### 5.3 Validações Zod

```typescript
export const billingCycleSchema = z.enum(['monthly', 'quarterly', 'yearly']);

export const createContractSchema = z.object({
  tipo: z.string().min(1, 'Tipo é obrigatório'),
  valor: z.number().positive('Valor deve ser positivo'),
  dataInicio: z.string().min(1, 'Data de início é obrigatória'),
  dataFim: z.string().min(1, 'Data de fim é obrigatória'),
  cicloCobranca: billingCycleSchema,
  termos: z.string().nullable().optional(),
}).refine(
  (data) => new Date(data.dataFim) > new Date(data.dataInicio),
  {
    message: 'Data de fim deve ser posterior à data de início',
    path: ['dataFim'],
  }
);

export const renewContractSchema = z.object({
  dataInicio: z.string().min(1, 'Data de início é obrigatória'),
  dataFim: z.string().min(1, 'Data de fim é obrigatória'),
  valor: z.number().positive('Valor deve ser positivo'),
  cicloCobranca: billingCycleSchema.optional(),
  termos: z.string().nullable().optional(),
}).refine(
  (data) => new Date(data.dataFim) > new Date(data.dataInicio),
  {
    message: 'Data de fim deve ser posterior à data de início',
    path: ['dataFim'],
  }
);

export type CreateContractInput = z.infer<typeof createContractSchema>;
export type RenewContractInput = z.infer<typeof renewContractSchema>;
```

---

## 6. Timeline Events

### 6.1 Tipos TypeScript

```typescript
// src/features/crm/types/timeline.ts

export type TimelineEventType =
  | 'activity'
  | 'status_change'
  | 'contract_created'
  | 'contract_renewed'
  | 'contract_expired';

export interface BaseTimelineEvent {
  id: string;
  timestamp: string; // ISO 8601
  type: TimelineEventType;
}

export interface ActivityEvent extends BaseTimelineEvent {
  type: 'activity';
  activityType: ActivityType;
  description: string;
  userId: string;
  userName: string;
}

export interface StatusChangeEvent extends BaseTimelineEvent {
  type: 'status_change';
  fromStatus: CustomerStatus;
  toStatus: CustomerStatus;
  userId: string;
  userName: string;
}

export interface ContractEvent extends BaseTimelineEvent {
  type: 'contract_created' | 'contract_renewed' | 'contract_expired';
  contractId: string;
  contractType: string;
  value: number;
}

export type TimelineEvent = ActivityEvent | StatusChangeEvent | ContractEvent;
```

---

## 7. Filtros e Paginação

### 7.1 Tipos de Filtros

```typescript
// src/features/crm/types/filters.ts

export interface OpportunityFilters {
  stage?: OpportunityStage;
  status?: OpportunityStatus;
  minValue?: number;
  maxValue?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface CustomerFilters {
  status?: CustomerStatus;
  segment?: CustomerSegment;
  minHealthScore?: number;
  maxHealthScore?: number;
}

export interface ContractFilters {
  status?: ContractStatus;
  daysUntilRenewal?: number;
}
```

### 7.2 Paginação Cursor-based

```typescript
export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
}

export interface CursorPaginationResponse<T> {
  data: T[];
  nextCursor: string | null;
  total: number;
}
```

---

## 8. Utilitários de Formatação

### 8.1 Formatação de Moeda

```typescript
// src/features/crm/lib/formatters.ts

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
```

### 8.2 Formatação de Datas

```typescript
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDate(dateString: string): string {
  return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
}

export function formatDateTime(dateString: string): string {
  return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
}

export function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), {
    addSuffix: true,
    locale: ptBR,
  });
}
```

### 8.3 Formatação de Status/Stages

```typescript
export const opportunityStageLabels: Record<OpportunityStage, string> = {
  Lead: 'Lead',
  Qualificado: 'Qualificado',
  Proposta: 'Proposta',
  Negociacao: 'Negociação',
  Ganha: 'Ganha',
  Perdida: 'Perdida',
};

export const customerStatusLabels: Record<CustomerStatus, string> = {
  Ativo: 'Ativo',
  EmRisco: 'Em Risco',
  Cancelado: 'Cancelado',
  Pausado: 'Pausado',
};

export const activityTypeLabels: Record<ActivityType, string> = {
  call: 'Chamada',
  meeting: 'Reunião',
  email: 'Email',
  note: 'Nota',
};
```

---

## 9. Constantes

```typescript
// src/features/crm/lib/constants.ts

export const OPPORTUNITY_STAGES: OpportunityStage[] = [
  'Lead',
  'Qualificado',
  'Proposta',
  'Negociacao',
];

export const CUSTOMER_STATUSES: CustomerStatus[] = [
  'Ativo',
  'EmRisco',
  'Cancelado',
  'Pausado',
];

export const ACTIVITY_TYPES: ActivityType[] = ['call', 'meeting', 'email', 'note'];

export const BILLING_CYCLES: BillingCycle[] = ['monthly', 'quarterly', 'yearly'];

export const billingCycleLabels: Record<BillingCycle, string> = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  yearly: 'Anual',
};

// Configurações de paginação
export const DEFAULT_PAGE_LIMIT = 20;
export const RENEWAL_WARNING_DAYS = 90;

// Configurações de health score
export const HEALTH_SCORE_THRESHOLDS = {
  critical: 30,
  at_risk: 60,
  healthy: 100,
};
```

---

## 10. Resumo de Mapeamento Backend → Frontend

| Entidade Backend | Tipo Frontend | Arquivo |
|------------------|---------------|---------|
| Opportunity | `Opportunity` | `src/features/crm/types/opportunity.ts` |
| Customer | `Customer` | `src/features/crm/types/customer.ts` |
| Contact | `Contact` | `src/features/crm/types/contact.ts` |
| Activity | `Activity` | `src/features/crm/types/activity.ts` |
| Contract | `Contract` | `src/features/crm/types/contract.ts` |
| Timeline Events | `TimelineEvent` | `src/features/crm/types/timeline.ts` |

### Convenções de Nomenclatura

- **Backend**: `snake_case` (ex: `expected_close_date`)
- **Frontend**: `camelCase` (ex: `expectedCloseDate`)
- **Transformações**: Funções `transformXFromAPI` e `transformXToAPI` para conversão

### Validação em Camadas

1. **Frontend (UX)**: Zod schemas para feedback imediato ao usuário
2. **Backend (Security)**: Validação real e autorização
3. **Frontend confia no backend** para validações de negócio complexas

---

## Próximos Passos

✅ **Data Model Completo** - Todos os tipos, validações e transformações definidos.

**Próxima Etapa**: Criar arquivos de contrato de API em `contracts/` para testes TDD.
