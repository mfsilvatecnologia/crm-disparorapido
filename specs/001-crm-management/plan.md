# Plano de Implementação: Sistema de Gestão CRM

**Branch**: `001-crm-management` | **Data**: 2026-01-03 | **Spec**: [spec.md](./spec.md)
**Input**: Especificação da funcionalidade de `/specs/001-crm-management/spec.md`

## Sumário

Implementar sistema completo de CRM no frontend para gerenciar Oportunidades, Clientes, Contatos, Atividades e Contratos. O sistema consumirá endpoints REST existentes do backend (documentados em swagger.json) e implementará interface responsiva com React + TypeScript. Inclui formulários com validação (React Hook Form + Zod), gestão de estado de servidor (TanStack Query), e componentes reutilizáveis (shadcn/ui + Tailwind CSS).

## Contexto Técnico

**Linguagem/Versão**: TypeScript 5.8+, React 18.3+
**Dependências Principais**: TanStack Query v5.89 (gestão de estado servidor), React Hook Form v7.62 + Zod v3.25 (formulários + validação), shadcn/ui + Radix UI (componentes), axios v1.11 (HTTP), lucide-react (ícones)
**Armazenamento**: N/A (frontend consome APIs REST; backend gerencia dados)
**Testes**: Vitest v3.2+ para testes unitários, contract e integration; React Testing Library v16.3+ para testes de componentes
**Plataforma Alvo**: Navegadores web modernos (Chrome, Firefox, Safari, Edge - últimas 2 versões), responsivo mobile-first (375px+)
**Tipo de Projeto**: Web application (frontend React + backend REST API)
**Metas de Performance**: Carregamento inicial < 3s, navegação entre páginas < 500ms, operações de API < 1s, paginação suporta 10.000+ registros sem degradação
**Restrições**: Sem lógica de negócio no frontend (validação apenas UX), sem chamadas diretas a terceiros, sem armazenamento de secrets, todas operações via API backend documentada em swagger.json
**Escala/Escopo**: 5 módulos principais (Oportunidades, Clientes, Contatos, Atividades, Contratos), ~20-25 componentes React, 25+ endpoints backend, suporte para datasets de 50.000+ registros

## Verificação da Constituição

*GATE: Deve passar antes da Fase 0 de pesquisa. Re-verificar após design da Fase 1.*

- **API-First Backend Authority**: ✅ **PASSA** - Frontend consumirá exclusivamente endpoints REST documentados em `/leadsrapido_backend/swagger.json`. Nenhuma chamada direta a terceiros ou manipulação de secrets. Endpoints já existem no backend (confirmado via swagger.json); frontend implementará apenas consumo via apiClient existente.

- **Test-First Delivery**: ✅ **PASSA** - Testes de contrato (`npm run test:contract`) validarão contratos de API antes da implementação da UI. Testes de integração (`npm run test:integration`) cobrirão fluxos completos (criar oportunidade → converter → gerenciar cliente). Testes unitários (`npm run test:run`) cobrirão lógica de validação e transformação de dados. Estratégia Red → Green → Refactor será aplicada.

- **Feature-Modular Boundaries**: ✅ **PASSA** - Sistema CRM será implementado como 5 features independentes (`opportunities/`, `customers/`, `contacts/`, `activities/`, `contracts/`) seguindo padrão existente do projeto. Cada feature terá public API via `index.ts`. Features não acessarão internals umas das outras. Cross-feature imports apenas via public APIs. Compartilhamento de componentes UI via `src/shared/components/` apenas se reutilizados por 3+ features.

- **Anti-Entropy Simplicity**: ✅ **PASSA** - Implementação focada em MVP: CRUD completo para 5 entidades sem features especulativas. Sem abstrações prematuras (Repository patterns, Service layers complexos). Documentação executável via `quickstart.md`. Commits serão mantidos < 500 LOC quando possível, com split lógico por módulo CRM.

- **Spec-Driven Change Control**: ✅ **PASSA** - Plan gerado a partir de spec.md aprovada. Versão da constituição: v2.2.0. Change-id implícito no branch `001-crm-management`. Contratos backend já existem (swagger.json); frontend validará conformidade via testes de contrato.

**Status do Gate**: ✅ APROVADO - Prosseguir para Fase 0

## Estrutura do Projeto

### Documentação (esta feature)

```text
specs/001-crm-management/
├── plan.md              # Este arquivo (output do comando /speckit.plan)
├── research.md          # Output da Fase 0 (comando /speckit.plan)
├── data-model.md        # Output da Fase 1 (comando /speckit.plan)
├── quickstart.md        # Output da Fase 1 (comando /speckit.plan)
├── contracts/           # Output da Fase 1 (comando /speckit.plan)
│   ├── opportunities.contract.ts    # Testes de contrato para Opportunities API
│   ├── customers.contract.ts        # Testes de contrato para Customers API
│   ├── contacts.contract.ts         # Testes de contrato para Contacts API
│   ├── activities.contract.ts       # Testes de contrato para Activities API
│   └── contracts.contract.ts        # Testes de contrato para Contracts API
└── tasks.md             # Output da Fase 2 (comando /speckit.tasks - NÃO criado por /speckit.plan)
```

### Código Fonte (raiz do repositório)

```text
src/
├── features/
│   ├── opportunities/               # Feature: Gestão de Oportunidades
│   │   ├── index.ts                 # Public API: exports de hooks, types, pages
│   │   ├── types/
│   │   │   └── opportunity.ts       # Opportunity, OpportunityStage, OpportunityStatus
│   │   ├── api/
│   │   │   └── opportunities.ts     # useOpportunities, useCreateOpportunity, useWinOpportunity, etc.
│   │   ├── components/
│   │   │   ├── OpportunityList.tsx
│   │   │   ├── OpportunityDetail.tsx
│   │   │   ├── OpportunityForm.tsx
│   │   │   ├── OpportunityPipeline.tsx
│   │   │   └── WinOpportunityDialog.tsx
│   │   ├── pages/
│   │   │   ├── OpportunitiesPage.tsx
│   │   │   └── OpportunityDetailPage.tsx
│   │   ├── lib/
│   │   │   ├── validations.ts       # opportunitySchema, loseOpportunitySchema
│   │   │   ├── formatters.ts        # formatOpportunityStage
│   │   │   └── constants.ts         # OPPORTUNITY_STAGES, stage colors, etc.
│   │   └── hooks/
│   │       └── useOpportunityFilters.ts
│   │
│   ├── customers/                   # Feature: Gestão de Clientes
│   │   ├── index.ts                 # Public API
│   │   ├── types/
│   │   │   ├── customer.ts          # Customer, CustomerStatus, CustomerSegment
│   │   │   └── timeline.ts          # TimelineEvent, ActivityEvent, StatusChangeEvent, etc.
│   │   ├── api/
│   │   │   └── customers.ts         # useCustomers, useCustomer, useCustomerTimeline, useHealthScore
│   │   ├── components/
│   │   │   ├── CustomerList.tsx
│   │   │   ├── CustomerDetail.tsx
│   │   │   ├── CustomerForm.tsx
│   │   │   ├── CustomerTimeline.tsx
│   │   │   └── HealthScoreBadge.tsx
│   │   ├── pages/
│   │   │   ├── CustomersPage.tsx
│   │   │   └── CustomerDetailPage.tsx
│   │   ├── lib/
│   │   │   ├── validations.ts       # customerSchema, updateCustomerStatusSchema
│   │   │   └── constants.ts         # CUSTOMER_STATUSES, CUSTOMER_SEGMENTS, health score thresholds
│   │   └── hooks/
│   │       └── useCustomerFilters.ts
│   │
│   ├── contacts/                    # Feature: Contatos de Clientes
│   │   ├── index.ts                 # Public API
│   │   ├── types/
│   │   │   └── contact.ts           # Contact
│   │   ├── api/
│   │   │   └── contacts.ts          # useContacts, useCreateContact, useSetPrimaryContact
│   │   ├── components/
│   │   │   ├── ContactList.tsx
│   │   │   ├── ContactForm.tsx
│   │   │   └── ContactCard.tsx
│   │   └── lib/
│   │       └── validations.ts       # contactSchema
│   │
│   ├── activities/                  # Feature: Atividades de Clientes
│   │   ├── index.ts                 # Public API
│   │   ├── types/
│   │   │   └── activity.ts          # Activity, ActivityType
│   │   ├── api/
│   │   │   └── activities.ts        # useActivities, useCreateActivity, useUpdateActivity
│   │   ├── components/
│   │   │   ├── ActivityList.tsx
│   │   │   ├── ActivityForm.tsx
│   │   │   └── ActivityCard.tsx
│   │   └── lib/
│   │       ├── validations.ts       # activitySchema
│   │       └── constants.ts         # ACTIVITY_TYPES, activity type icons/labels
│   │
│   └── contracts/                   # Feature: Contratos de Clientes
│       ├── index.ts                 # Public API
│       ├── types/
│       │   └── contract.ts          # Contract, ContractStatus, BillingCycle
│       ├── api/
│       │   └── contracts.ts         # useContracts, useNearRenewal, useRenewContract
│       ├── components/
│       │   ├── ContractList.tsx
│       │   ├── ContractForm.tsx
│       │   ├── ContractCard.tsx
│       │   └── RenewalDashboard.tsx
│       ├── pages/
│       │   └── RenewalsPage.tsx
│       └── lib/
│           ├── validations.ts       # contractSchema, renewContractSchema
│           └── constants.ts         # BILLING_CYCLES, contract status labels
│
├── shared/                          # Código compartilhado (promover após 3+ features usarem)
│   ├── components/
│   │   ├── Timeline.tsx             # Componente genérico de timeline (usado por customers)
│   │   ├── DataTable.tsx            # Tabela com paginação e filtros
│   │   ├── EmptyState.tsx           # Estado vazio reutilizável
│   │   └── ConfirmDialog.tsx        # Diálogo de confirmação
│   └── lib/
│       └── crm/                     # Utils CRM compartilhados
│           └── formatters.ts        # formatCurrency, formatDate (compartilhado entre features)
│
└── lib/
    └── api-client.ts                # Cliente API existente (axios singleton)

tests/
├── contract/                        # Testes de contrato por feature
│   ├── opportunities.contract.test.ts
│   ├── customers.contract.test.ts
│   ├── contacts.contract.test.ts
│   ├── activities.contract.test.ts
│   └── contracts.contract.test.ts
│
├── integration/
│   └── crm/                         # Testes de integração cross-feature
│       ├── opportunity-to-customer.test.tsx
│       ├── customer-management.test.tsx
│       └── contract-renewal.test.tsx
│
└── unit/                            # Testes unitários por feature
    ├── opportunities/
    ├── customers/
    ├── contacts/
    ├── activities/
    └── contracts/
```

**Decisão de Estrutura**: Selecionada **arquitetura modular com features independentes** seguindo o padrão existente do projeto (`leads/`, `campaigns/`, `companies/`, etc.).

**Rationale**:
1. **Consistência**: Alinha com estrutura atual do projeto (15+ features existentes)
2. **Constituição**: Segue Feature-Modular Boundaries - cada entidade CRM é uma feature independente
3. **Escalabilidade**: Adicionar novas entidades CRM não infla uma única pasta
4. **Ownership**: Cada feature pode ter owner/team diferente
5. **Code Splitting**: Lazy loading granular por feature
6. **Reusabilidade**: `customers/` pode ser usado por outras features além do CRM
7. **Independência**: Mudanças em `contacts/` não afetam `opportunities/`

### Gerenciamento de Dependências Cross-Feature

**Regra de Ouro**: Cross-feature imports **APENAS via Public API** (`index.ts`)

#### Exemplo: Oportunidade → Cliente (Conversão)

```typescript
// ✅ CORRETO: src/features/opportunities/components/WinOpportunityDialog.tsx
import { Customer } from '@/features/customers';  // Via public API
import { useCustomers } from '@/features/customers';

// ❌ ERRADO: Nunca importar internals
import { CustomerDetail } from '@/features/customers/components/CustomerDetail';
```

#### Public API Pattern

```typescript
// src/features/customers/index.ts
export type { Customer, CustomerStatus, CustomerSegment } from './types/customer';
export type { TimelineEvent } from './types/timeline';

export { useCustomers, useCustomer, useCustomerTimeline } from './api/customers';
export { CustomersPage } from './pages/CustomersPage';
export { CustomerDetailPage } from './pages/CustomerDetailPage';

// Componentes NÃO são exportados - apenas para uso interno da feature
```

#### Shared Utilities

Utilitários **realmente compartilhados** (usados por 3+ features) são promovidos para `src/shared/lib/crm/`:

```typescript
// src/shared/lib/crm/formatters.ts
export function formatCurrency(value: number): string { /* ... */ }
export function formatDate(dateString: string): string { /* ... */ }

// Usado por: opportunities/, customers/, contracts/
```

## Rastreamento de Complexidade

> Nenhuma violação da Constituição identificada. Tabela omitida conforme template.

## Fases de Implementação

### Fase 0: Pesquisa & Outline

**Objetivo**: Resolver unknowns técnicos e definir padrões de implementação.

**Questões de Pesquisa**:

1. **Estratégia de Paginação Cursor-based**: Como implementar paginação cursor-based com TanStack Query? Backend usa paginação cursor (endpoints retornam `nextCursor`).
   - Investigar `useInfiniteQuery` vs `usePaginatedQuery`
   - Padrão de gerenciamento de cursors
   - Integração com componentes de lista/tabela

2. **Validação de Formulários Multi-step**: Oportunidade → Cliente é fluxo de conversão. Como validar dados antes de conversão?
   - Schema Zod para validação de oportunidade "pronta para conversão"
   - Tratamento de erro na criação de cliente (rollback de status?)
   - UX de feedback durante operação assíncrona

3. **Timeline Component Pattern**: Customer timeline agrega atividades + eventos de status + contratos. Qual padrão de componente?
   - Componente genérico de timeline vs específico
   - Ordenação cronológica de eventos heterogêneos
   - Performance com histórico longo (lazy loading?)

4. **Health Score Calculation**: Score calculado no backend ou frontend? Spec define "calcular em tempo real".
   - Backend retorna score pré-calculado ou dados brutos?
   - Se frontend: fórmula de cálculo e dados necessários
   - Cache/revalidation strategy

5. **State Management para Filtros**: Persistir filtros e ordenação por sessão (FR-048). Estratégia?
   - URL query params vs localStorage vs sessionStorage
   - Sincronização entre abas/janelas
   - Integração com TanStack Query cache

**Output**: `research.md` com decisões, rationale e exemplos de código

### Fase 1: Design & Contratos

**Pré-requisitos**: `research.md` completo

**Atividades**:

1. **Modelagem de Dados** (`data-model.md`):
   - Mapear entidades backend → tipos TypeScript
   - Definir interfaces de request/response
   - Documentar validações Zod por entidade
   - Especificar transformações de dados (API ↔ UI)

2. **Contratos de API** (`contracts/`):
   - Criar arquivos de contrato por módulo (opportunities, customers, etc.)
   - Definir expectativas de schema de resposta
   - Validar conformidade com swagger.json
   - Implementar testes que DEVEM FALHAR inicialmente

3. **Quickstart** (`quickstart.md`):
   - Guia de setup local para desenvolvimento
   - Comandos de teste (contract, integration, unit)
   - Estrutura de pastas e convenções
   - Exemplos de uso da public API da feature

4. **Atualização de Contexto do Agente**:
   - Executar `.specify/scripts/bash/update-agent-context.sh claude`
   - Adicionar tecnologias da feature atual ao `CLAUDE.md`

**Output**: `data-model.md`, `contracts/*`, `quickstart.md`, `CLAUDE.md` atualizado

### Fase 2: Tarefas de Implementação

**Nota**: Esta fase é executada pelo comando `/speckit.tasks`, NÃO por `/speckit.plan`.

O comando `/speckit.tasks` gerará `tasks.md` com breakdown detalhado de:
- Implementação de componentes React
- Configuração de hooks TanStack Query
- Desenvolvimento de formulários e validações
- Implementação de rotas
- Testes unitários e de integração
- Documentação e exemplos

## Próximos Passos

Após conclusão deste comando `/speckit.plan`:

1. ✅ **Fase 0 Completa**: `research.md` criado com decisões técnicas
2. ✅ **Fase 1 Completa**: `data-model.md`, `contracts/`, `quickstart.md` criados
3. ✅ **Contexto Atualizado**: `CLAUDE.md` com nova stack da feature
4. ⏭️ **Próximo Comando**: `/speckit.tasks` para gerar plano de implementação detalhado

## Notas de Implementação

### Arquitetura Multi-Feature

- **Features Independentes**: Cada entidade CRM (`opportunities`, `customers`, `contacts`, `activities`, `contracts`) é uma feature separada com seu próprio ciclo de vida
- **Ordem de Implementação Sugerida**:
  1. `opportunities/` - Base do pipeline de vendas
  2. `customers/` - Destino das conversões de oportunidades
  3. `contacts/` - Extensão de customers
  4. `activities/` - Rastreamento de interações
  5. `contracts/` - Gestão de lifecycle de contratos

- **Cross-Feature Communication**:
  - `opportunities` → `customers`: Conversão via `useWinOpportunity` retorna `Customer` type
  - `customers` → `contacts`: Customer detail page importa `ContactList` component
  - `customers` → `activities`: Timeline importa events de activities
  - `customers` → `contracts`: Customer profile mostra contracts

### Desenvolvimento

- **Integração com Backend**: Endpoints já documentados em `swagger.json`. Verificar disponibilidade e conformidade durante fase de contratos.
- **Multi-tenancy**: Projeto suporta múltiplos tenants via `TENANT_PORT`. Features CRM devem respeitar contexto de tenant (sem lógica específica no frontend; backend gerencia).
- **Autenticação**: Sistema usa JWT via `apiClient.setAccessToken()`. Eventos `auth:unauthorized` disparam logout. Features CRM não gerenciam auth diretamente.
- **Responsividade**: Design mobile-first obrigatório. Componentes devem funcionar em 375px+ (FR-047).
- **Acessibilidade**: Componentes shadcn/ui já incluem suporte ARIA. Validar navegação por teclado e leitores de tela.

### Routing

Cada feature expõe suas próprias páginas via public API:

```typescript
// src/App.tsx ou router config
import { OpportunitiesPage, OpportunityDetailPage } from '@/features/opportunities';
import { CustomersPage, CustomerDetailPage } from '@/features/customers';
import { RenewalsPage } from '@/features/contracts';

const routes = [
  { path: '/crm/opportunities', element: <OpportunitiesPage /> },
  { path: '/crm/opportunities/:id', element: <OpportunityDetailPage /> },
  { path: '/crm/customers', element: <CustomersPage /> },
  { path: '/crm/customers/:id', element: <CustomerDetailPage /> },
  { path: '/crm/renewals', element: <RenewalsPage /> },
];
```
