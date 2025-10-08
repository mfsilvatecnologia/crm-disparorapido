# Implementation Plan: Página de Vendas com Sistema de Assinaturas

**Branch**: `004-pagina-de-vendas` | **Date**: 2025-10-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-pagina-de-vendas/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → ✓ Loaded successfully
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → ✓ Project Type: Web (frontend React + backend Fastify)
   → ✓ Structure Decision: Feature-based architecture
3. Fill the Constitution Check section
   → Constitution file is template - using general best practices
4. Evaluate Constitution Check section
   → ✓ No violations identified
   → ✓ Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → In progress
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, claude.md
   → Pending
7. Re-evaluate Constitution Check section
   → Pending
8. Plan Phase 2 → Describe task generation approach
   → Pending
9. STOP - Ready for /tasks command
   → Pending
```

**IMPORTANT**: The /plan command STOPS at step 9. Phase 2 execution is handled by /tasks command.

## Summary

Implementação de uma página de vendas completa com **dois modelos de monetização**:

### 1. Sistema de Assinaturas (Recorrente)
- Exibição de planos de assinatura com comparação de features
- Sistema de trial gratuito sem cobrança inicial
- Fluxo de checkout e confirmação
- Dashboard de gerenciamento de assinaturas
- Sistema de notificações para eventos de trial e billing
- Suporte a múltiplos ciclos de cobrança

### 2. Sistema de Créditos (One-Time Payment)
- Marketplace de leads com preview mascarado
- Pacotes de créditos com bônus progressivos
- Compra de acesso individual a leads
- Gerenciamento de saldo e histórico de transações
- Sistema de controle de acesso aos leads comprados

### Integração Dual
- Empresas podem ter AMBOS: assinatura ativa + saldo de créditos
- Assinatura: acesso à plataforma e funcionalidades
- Créditos: compra individual de leads no marketplace
- Gateway de pagamento único (Asaas) diferencia tipos via webhook

A feature integra-se com o sistema de autenticação existente e requer integração com gateway de pagamento externo. O foco é criar uma experiência fluida desde a visualização dos planos/pacotes até o uso efetivo dos recursos adquiridos.

## Technical Context

**Language/Version**: TypeScript 5.8+, React 18.3+, Node.js (via Fastify 5.4)
**Primary Dependencies**:
- Frontend: React, React Router, TanStack Query, Radix UI, Tailwind CSS, Zod, React Hook Form
- Backend: Fastify, Prisma ORM, JWT, Bcrypt
- Testing: Vitest, Testing Library, MSW
**Storage**: PostgreSQL (via Prisma), Redis (ioredis) para sessões
**Testing**: Vitest com configurações separadas (unit, integration, contract)
**Target Platform**: Web (navegadores modernos), mobile-responsive
**Project Type**: Web (frontend + backend monorepo)
**Performance Goals**:
- Página de preços carrega em <2s
- Transição entre steps do checkout <500ms
- Resposta da API para criação de subscription <1s
**Constraints**:
- Autenticação obrigatória antes de trial
- Trial único por produto por empresa
- Dados sensíveis de pagamento armazenados apenas no gateway externo
- Conformidade com LGPD para dados de usuário
**Scale/Scope**:
- **Assinaturas**: 3-5 planos de assinatura simultâneos
- **Créditos**: 5 pacotes de créditos pré-configurados (seed)
- **Marketplace**: Sistema de leads com mascaramento/preview
- ~20-25 componentes React novos (assinaturas + créditos + marketplace)
- 12-15 endpoints de API (6-8 assinaturas + 6-7 créditos/leads)
- ~35-40 testes automatizados

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Como a constituição está em formato template, aplicamos princípios gerais de boas práticas:

### ✅ Passes
- **Separation of Concerns**: Feature isolada em `src/features/sales`
- **Test-First**: Contratos e testes serão criados antes da implementação
- **Type Safety**: TypeScript com Zod para validação em runtime
- **Reusabilidade**: Componentes compartilhados em `src/shared/`
- **Integração**: Aproveita sistema de autenticação existente

### ⚠️ Considerations
- **Payment Gateway Integration**: Necessita integração externa (Stripe/PagSeguro) - será abstraído em service layer
- **Session Limits**: Enforcement de limites por plano requer tracking de sessões ativas
- **Data Retention**: Política de 30 dias após cancelamento precisa ser confirmada

## Project Structure

### Documentation (this feature)
```
specs/004-pagina-de-vendas/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
│   ├── products.contract.json
│   └── subscriptions.contract.json
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
src/features/sales/
├── components/
│   ├── subscriptions/
│   │   ├── PricingCard.tsx
│   │   ├── PricingTable.tsx
│   │   ├── FeatureComparison.tsx
│   │   ├── CheckoutFlow/
│   │   │   ├── PlanSelection.tsx
│   │   │   ├── CheckoutConfirmation.tsx
│   │   │   └── SuccessPage.tsx
│   │   ├── SubscriptionDashboard/
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── SubscriptionDetails.tsx
│   │   │   └── CancelDialog.tsx
│   │   └── TrialBanner.tsx
│   ├── credits/
│   │   ├── CreditBalanceCard.tsx
│   │   ├── CreditPackagesGrid.tsx
│   │   ├── PackageCard.tsx
│   │   ├── TransactionHistory.tsx
│   │   └── PurchasePackageModal.tsx
│   └── marketplace/
│       ├── LeadMarketplaceGrid.tsx
│       ├── LeadMarketplaceCard.tsx
│       ├── LeadPreview.tsx
│       ├── PurchaseLeadModal.tsx
│       └── LeadFilters.tsx
├── hooks/
│   ├── subscriptions/
│   │   ├── useProducts.ts
│   │   ├── useSubscription.ts
│   │   ├── useTrialActivation.ts
│   │   └── useCancelSubscription.ts
│   ├── credits/
│   │   ├── useCreditBalance.ts
│   │   ├── useCreditPackages.ts
│   │   ├── usePurchasePackage.ts
│   │   └── useTransactionHistory.ts
│   └── marketplace/
│       ├── useMarketplaceLeads.ts
│       ├── usePurchaseLead.ts
│       └── usePurchasedLeads.ts
├── services/
│   ├── productsService.ts
│   ├── subscriptionsService.ts
│   ├── creditsService.ts
│   ├── marketplaceService.ts
│   └── paymentsService.ts
├── types/
│   ├── product.types.ts
│   ├── subscription.types.ts
│   ├── trial.types.ts
│   ├── credit.types.ts
│   └── lead.types.ts
├── contracts/
│   ├── sales.contracts.ts (Zod - subscriptions)
│   ├── credits.contracts.ts (Zod - credits)
│   └── marketplace.contracts.ts (Zod - leads)
└── pages/
    ├── PricingPage.tsx (subscriptions)
    ├── CheckoutPage.tsx (subscriptions)
    ├── SubscriptionManagementPage.tsx
    ├── CreditPackagesPage.tsx (credits)
    └── MarketplacePage.tsx (leads)

src/shared/components/
├── Badge.tsx (reusable for status badges)
├── ConfirmDialog.tsx (reusable for cancellation)
└── NotificationBanner.tsx

tests/contract/features/sales/
├── subscriptions/
│   ├── products.contract.test.ts
│   ├── subscriptions.contract.test.ts
│   ├── trials.contract.test.ts
│   └── payments.contract.test.ts
├── credits/
│   ├── balance.contract.test.ts
│   ├── packages.contract.test.ts
│   └── transactions.contract.test.ts
└── marketplace/
    ├── leads.contract.test.ts
    └── lead-purchase.contract.test.ts

tests/integration/features/sales/
├── subscriptions/
│   ├── pricing-flow.test.tsx
│   ├── trial-activation.test.tsx
│   ├── subscription-management.test.tsx
│   └── cancellation-flow.test.tsx
├── credits/
│   ├── package-purchase.test.tsx
│   ├── balance-display.test.tsx
│   └── transaction-history.test.tsx
└── marketplace/
    ├── browse-leads.test.tsx
    ├── purchase-lead.test.tsx
    └── purchased-leads-access.test.tsx

tests/unit/features/sales/
├── components/
├── hooks/
└── services/
```

**Structure Decision**:
O projeto segue uma arquitetura feature-based já estabelecida. A nova feature `sales` será adicionada em `src/features/` seguindo o padrão existente das outras features (`authentication`, `dashboard`, `leads`, etc.). Componentes compartilháveis serão movidos para `src/shared/components/`. Testes são organizados por tipo (contract, integration, unit) em `tests/`.

## Phase 0: Outline & Research

### Research Topics

**Será documentado em research.md:**

1. **Payment Gateway Integration**
   - Decision: Qual gateway usar (Stripe, PagSeguro, Mercado Pago)
   - Rationale: Comparar fees, features de trial, webhooks, SDKs
   - Alternatives: Listar prós/contras de cada opção
   - NEEDS CLARIFICATION → Pesquisar integração com trial automático

2. **Subscription State Management**
   - Decision: Como gerenciar estados de subscription (trialing, active, past_due, etc.)
   - Rationale: Máquina de estados vs. status simples
   - Alternatives: Considerar libraries (XState) vs. implementação manual

3. **Trial Expiration Handling**
   - Decision: Como processar expiração de trial (cron job, scheduled task, webhook)
   - Rationale: Avaliar precisão, escalabilidade, confiabilidade
   - Alternatives: Bull queue, node-cron, external scheduler

4. **Session Limiting per Plan**
   - Decision: Como enforçar limite de sessões simultâneas por tier
   - Rationale: Redis tracking, database counting
   - Alternatives: Considerar trade-offs de performance vs. accuracy

5. **Notification System Integration**
   - Decision: Como integrar notificações (email, in-app, push)
   - Rationale: Verificar sistema existente ou criar novo
   - Alternatives: Nodemailer, SendGrid, sistema próprio

6. **Responsive Design Patterns**
   - Decision: Mobile-first vs. desktop-first para pricing page
   - Rationale: Dados de analytics de acesso mobile
   - Alternatives: Considerar progressive enhancement

7. **Data Retention Policy**
   - Decision: Confirmar período de 30 dias pós-cancelamento
   - Rationale: Requisitos legais LGPD, recuperação de dados
   - Alternatives: Soft delete vs. hard delete, arquivamento

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

### Artefatos a serem gerados:

1. **data-model.md** - Modelo de dados detalhado:
   - Entidade Product/Plan (campos, validações, relacionamentos)
   - Entidade Subscription (estados, transições, validações)
   - Entidade Trial (cálculos de data, flags)
   - Relacionamentos com Company/User existentes
   - Schemas Prisma para migration

2. **contracts/** - Contratos de API (OpenAPI/Zod):

   **Subscriptions:**
   - `GET /api/products` - Listar planos ativos
   - `GET /api/products/:id` - Detalhes de um plano
   - `POST /api/subscriptions/trial` - Iniciar trial
   - `GET /api/subscriptions/current` - Subscription atual do usuário
   - `PATCH /api/subscriptions/:id/cancel` - Cancelar subscription
   - `GET /api/subscriptions/:id/status` - Status detalhado

   **Credits:**
   - `GET /api/v1/credits/balance?empresaId={uuid}` - Saldo de créditos
   - `GET /api/v1/credits/packages` - Listar pacotes de créditos
   - `POST /api/v1/credits/purchase-lead` - Comprar acesso a lead

   **Marketplace:**
   - `GET /api/v1/leads/marketplace` - Listar leads disponíveis
   - `GET /api/v1/leads/:id/preview` - Preview mascarado de lead
   - `GET /api/v1/leads/purchased` - Leads comprados pela empresa

   - **Nota**: Webhook do Asaas já implementado no backend (diferencia subscription vs credit via `payment.subscription` null/populated)

3. **Contract Tests** (failing tests):
   - Testes para cada endpoint verificando schemas
   - Testes de validação de entrada
   - Testes de estados permitidos

4. **quickstart.md** - Cenários de teste end-to-end:
   - Cenário 1: Usuário visualiza planos → seleciona → faz login → ativa trial
   - Cenário 2: Usuário com trial ativo visualiza dashboard → vê dias restantes
   - Cenário 3: Usuário cancela subscription → confirma → vê status cancelado
   - Cenário 4: Trial expira → sistema processa → muda para active (mock payment)

5. **claude.md update** (incremental):
   - Executar: `.specify/scripts/bash/update-agent-context.sh claude`
   - Adicionar: Sales feature, Subscription system, Trial management
   - Manter: Contexto de authentication, payment gateway choice
   - Limitar: ~150 linhas total

**Output**: data-model.md, /contracts/*, failing contract tests, quickstart.md, claude.md atualizado

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

### Task Generation Strategy

O comando `/tasks` irá gerar tasks.md seguindo esta estratégia:

1. **Carregar template** `.specify/templates/tasks-template.md`

2. **Gerar tasks de teste** (TDD - primeiro):
   - Para cada contrato em `contracts/` → task de contract test
   - Para cada cenário em `quickstart.md` → task de integration test
   - Para cada componente → task de unit test

3. **Gerar tasks de modelo**:
   - Criar Prisma schema para Product
   - Criar Prisma schema para Subscription
   - Criar Prisma schema para Trial
   - Executar migration

4. **Gerar tasks de backend**:
   - Implementar productsService
   - Implementar subscriptionsService
   - Implementar trialsService
   - Implementar paymentsService (mock)
   - Criar endpoints Fastify
   - Implementar webhooks handler

5. **Gerar tasks de frontend**:
   - Criar tipos TypeScript (inferidos de Zod)
   - Implementar hooks customizados
   - Criar componentes de UI (Pricing, Checkout, Dashboard)
   - Criar páginas
   - Integrar com React Router
   - Adicionar notificações (toast)

6. **Gerar tasks de integração**:
   - Integrar com AuthContext existente
   - Conectar com payment gateway
   - Configurar webhooks
   - Setup de cron job para trial expiration

### Ordering Strategy

**Ordem de execução** (respeitando dependências):

1. **Testes de Contrato** [P] - Podem rodar em paralelo
2. **Modelos de Dados** [P] - Migration necessária antes de services
3. **Services Backend** - Depende de modelos
4. **Endpoints API** - Depende de services
5. **Tipos Frontend** [P] - Pode rodar paralelo a backend
6. **Hooks React** - Depende de tipos e contratos
7. **Componentes UI** [P] - Podem ser desenvolvidos em paralelo
8. **Páginas** - Depende de componentes
9. **Testes de Integração** - Depende de implementação completa
10. **Integrações Externas** - Payment gateway, webhooks
11. **Ajustes Finais** - Responsividade, acessibilidade

**Estimated Output**: ~30-35 tasks numeradas e ordenadas em tasks.md

### Task Categories

- **[P]** = Parallelizable (independent tasks)
- **Contract Tests**: 6-8 tasks
- **Data Models**: 3-4 tasks
- **Backend Services**: 6-8 tasks
- **Frontend Components**: 10-12 tasks
- **Integration Tests**: 4-5 tasks
- **External Integrations**: 2-3 tasks

**IMPORTANT**: Esta fase será executada pelo comando `/tasks`, NÃO pelo `/plan`

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (comando `/tasks` cria tasks.md)
**Phase 4**: Implementation (executar tasks.md seguindo ordem TDD)
**Phase 5**: Validation (rodar todos os testes, executar quickstart.md, verificar performance)

### Validation Criteria (Phase 5)
- ✅ Todos os contract tests passam
- ✅ Todos os integration tests passam (cenários do quickstart)
- ✅ Cobertura de testes >80%
- ✅ Página de pricing carrega em <2s
- ✅ Checkout flow funciona em mobile e desktop
- ✅ Trial pode ser ativado e gerenciado
- ✅ Webhooks de pagamento são recebidos corretamente
- ✅ Notificações são enviadas nos momentos corretos

## Complexity Tracking
*Vazio - Nenhuma violação de constituição identificada*

Esta feature segue os padrões estabelecidos do projeto e não introduz complexidade desnecessária.

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning approach documented (/plan command)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (N/A - none identified)

**Artifacts Generated**:
- [x] research.md (Payment gateway: Asaas, State management, Trial handling, etc.)
- [x] data-model.md (Product, Subscription, PaymentHistory entities + Prisma schemas)
- [x] contracts/products.contract.json (GET /api/products, GET /api/products/:id)
- [x] contracts/subscriptions.contract.json (POST /api/subscriptions/trial, GET /api/subscriptions/current, etc.)
- [x] quickstart.md (8 end-to-end test scenarios)
- [x] CLAUDE.md updated with feature context

**Note**: Webhook do Asaas (`/api/webhooks/asaas`) já está implementado no backend - não faz parte desta feature

---
*Planning initiated: 2025-10-04*
*Planning completed: 2025-10-04*

**Ready for**: `/tasks` command to generate implementation tasks
