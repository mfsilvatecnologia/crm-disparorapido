# Data Model: Sales & Subscriptions

**Feature**: 004-pagina-de-vendas
**Date**: 2025-10-04
**Status**: Design Complete

## Entity Relationship Diagram

```
                        ┌─────────────────┐
                        │   CreditPackage │
                        │    (Produto)    │
                        └─────────────────┘
                                 │
                                 │ N:1
                                 ▼
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Company   │────────<│   Subscription   │>────────│   Product   │
│             │  1:N    │                  │   N:1   │             │
│             │         └──────────────────┘         └─────────────┘
│             │                 │
│             │                 │ 1:1
│             │                 ▼
│             │         ┌──────────────┐
│             │         │ TrialPeriod  │
│             │         │  (embedded)  │
│             │         └──────────────┘
│             │                 │
│             │                 │ 1:N
│             │                 ▼
│             │         ┌──────────────┐
│             │         │   Payment    │
│             │         │   History    │
│             │         └──────────────┘
│             │
│             │         ┌──────────────────┐
│             ├────────<│  CreditBalance   │
│             │  1:1    │   (calculated)   │
│             │         └──────────────────┘
│             │                 │
│             │                 │ 1:N
│             │                 ▼
│             │         ┌──────────────────┐
│             ├────────<│CreditTransaction │
│             │  1:N    │                  │
│             │         └──────────────────┘
│             │
│             │         ┌──────────────────┐
│             ├────────<│  LeadAccess      │
│             │  1:N    │  (lead_acesso_   │
│             │         │   empresas)      │
│             │         └──────────────────┘
│             │                 │
│             │                 │ N:1
└─────────────┘                 ▼
                        ┌──────────────────┐
                        │      Lead        │
                        │  (marketplace)   │
                        └──────────────────┘
```

## Core Entities

### 1. Product (Plano de Assinatura)

Representa um tier/plano de assinatura oferecido aos clientes.

**Fields:**

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|-------------|-----------|-----------|
| id | String (UUID) | Sim | UUID v4 | Identificador único |
| name | String | Sim | 3-50 chars | Nome do plano (ex: "Básico", "Pro", "Enterprise") |
| description | String | Não | Max 500 chars | Descrição do plano |
| priceMonthly | Decimal | Sim | > 0 | Preço mensal em centavos (ex: 9900 = R$ 99,00) |
| billingCycle | Enum | Sim | MONTHLY, QUARTERLY, YEARLY | Ciclo de cobrança |
| features | JSON | Sim | Array de strings | Lista de features incluídas |
| maxSessions | Integer | Sim | > 0 | Limite de sessões simultâneas |
| maxLeads | Integer | Não | > 0 ou null | Limite de leads (null = ilimitado) |
| trialDays | Integer | Não | 0-90 | Duração do trial em dias (0 = sem trial) |
| isActive | Boolean | Sim | - | Se o plano está disponível para venda |
| isMostPopular | Boolean | Sim | - | Badge de "mais popular" |
| position | Integer | Sim | >= 0 | Ordem de exibição |
| asaasProductId | String | Não | - | ID do produto no Asaas (para sincronização) |
| createdAt | DateTime | Sim | - | Data de criação |
| updatedAt | DateTime | Sim | - | Data de última atualização |
| deletedAt | DateTime | Não | - | Soft delete |

**Relationships:**
- `subscriptions`: Subscription[] (one-to-many)

**Indexes:**
```sql
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_position ON products(position);
CREATE UNIQUE INDEX idx_products_asaas ON products(asaas_product_id) WHERE asaas_product_id IS NOT NULL;
```

**Business Rules:**
- Apenas um plano pode ter `isMostPopular = true` por vez
- `position` deve ser único entre planos ativos
- Se `trialDays > 0`, o trial é oferecido
- Preços são armazenados em centavos para evitar problemas de ponto flutuante

**Example:**
```json
{
  "id": "uuid-1234",
  "name": "Plano Pro",
  "description": "Para equipes que precisam de mais poder",
  "priceMonthly": 19900,
  "billingCycle": "MONTHLY",
  "features": [
    "Até 10.000 leads",
    "5 usuários simultâneos",
    "Relatórios avançados",
    "Suporte prioritário"
  ],
  "maxSessions": 5,
  "maxLeads": 10000,
  "trialDays": 14,
  "isActive": true,
  "isMostPopular": true,
  "position": 1
}
```

---

### 2. Subscription (Assinatura)

Representa a assinatura ativa ou passada de uma empresa a um plano.

**Fields:**

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|-------------|-----------|-----------|
| id | String (UUID) | Sim | UUID v4 | Identificador único |
| companyId | String (UUID) | Sim | FK to Company | Empresa que possui a assinatura |
| productId | String (UUID) | Sim | FK to Product | Plano assinado |
| status | Enum | Sim | Ver SubscriptionStatus | Status atual |
| billingCycle | Enum | Sim | MONTHLY, QUARTERLY, YEARLY | Ciclo de cobrança |
| priceAmount | Decimal | Sim | >= 0 | Valor cobrado (centavos) |
| hasTrial | Boolean | Sim | - | Se possui período de trial |
| trialDurationDays | Integer | Não | 0-90 | Duração do trial |
| trialStartDate | DateTime | Não | - | Início do trial |
| trialEndDate | DateTime | Não | - | Fim do trial |
| isInTrial | Boolean | Sim | - | Se está atualmente em trial |
| startDate | DateTime | Sim | - | Data de início da assinatura |
| nextDueDate | DateTime | Não | - | Próxima data de cobrança |
| lastPaymentDate | DateTime | Não | - | Última cobrança bem-sucedida |
| canceledAt | DateTime | Não | - | Data de cancelamento |
| cancellationReason | String | Não | Max 500 chars | Motivo do cancelamento |
| paymentCount | Integer | Sim | >= 0 | Número de pagamentos realizados |
| asaasSubscriptionId | String | Não | - | ID da subscription no Asaas |
| asaasCustomerId | String | Não | - | ID do customer no Asaas |
| metadata | JSON | Não | - | Dados adicionais |
| createdAt | DateTime | Sim | - | Data de criação |
| updatedAt | DateTime | Sim | - | Data de última atualização |
| deletedAt | DateTime | Não | - | Soft delete (30 dias após cancelamento) |

**Enums:**

```typescript
enum SubscriptionStatus {
  TRIALING = 'trialing',      // Trial ativo
  ACTIVE = 'active',           // Pagando normalmente
  PAST_DUE = 'past_due',       // Pagamento atrasado
  CANCELED = 'canceled',       // Cancelada pelo usuário
  SUSPENDED = 'suspended',     // Suspensa por falta de pagamento
  EXPIRED = 'expired'          // Trial expirado sem conversão
}

enum BillingCycle {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMIANNUALLY = 'semiannually',
  YEARLY = 'yearly'
}
```

**Relationships:**
- `company`: Company (many-to-one)
- `product`: Product (many-to-one)
- `payments`: PaymentHistory[] (one-to-many)

**Indexes:**
```sql
CREATE INDEX idx_subscriptions_company ON subscriptions(company_id);
CREATE INDEX idx_subscriptions_product ON subscriptions(product_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_trial_end ON subscriptions(trial_end_date) WHERE is_in_trial = true;
CREATE INDEX idx_subscriptions_next_due ON subscriptions(next_due_date) WHERE status IN ('active', 'past_due');
CREATE INDEX idx_subscriptions_deleted ON subscriptions(deleted_at);
CREATE UNIQUE INDEX idx_subscriptions_asaas ON subscriptions(asaas_subscription_id) WHERE asaas_subscription_id IS NOT NULL;
```

**State Transitions:**

```
TRIALING ──payment_success──> ACTIVE
    │
    ├──trial_expires_no_payment──> EXPIRED
    │
    └──user_cancels──> CANCELED

ACTIVE ──payment_fails──> PAST_DUE
    │
    └──user_cancels──> CANCELED

PAST_DUE ──payment_recovered──> ACTIVE
    │
    └──multiple_failures──> SUSPENDED

SUSPENDED ──payment_recovered──> ACTIVE
```

**Business Rules:**
- Uma empresa pode ter apenas uma subscription ACTIVE ou TRIALING por produto
- Se `hasTrial = true`, deve ter `trialDurationDays`, `trialStartDate`, `trialEndDate`
- `isInTrial = true` apenas se status = TRIALING e data atual < trialEndDate
- `nextDueDate` é calculado como: trialEndDate + 1 day (se trial) ou lastPaymentDate + billingCycle
- Após cancelamento, `deletedAt` é setado após 30 dias (soft delete)
- `paymentCount` inicia em 0 e incrementa a cada pagamento confirmado

**Example:**
```json
{
  "id": "sub-uuid-1234",
  "companyId": "company-uuid-5678",
  "productId": "product-uuid-9012",
  "status": "trialing",
  "billingCycle": "monthly",
  "priceAmount": 19900,
  "hasTrial": true,
  "trialDurationDays": 14,
  "trialStartDate": "2025-10-04T00:00:00Z",
  "trialEndDate": "2025-10-18T23:59:59Z",
  "isInTrial": true,
  "startDate": "2025-10-04T00:00:00Z",
  "nextDueDate": "2025-10-19T00:00:00Z",
  "paymentCount": 0,
  "asaasSubscriptionId": "sub_abc123"
}
```

---

### 3. PaymentHistory (Histórico de Pagamentos)

Registra todos os pagamentos relacionados a uma assinatura.

**Fields:**

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|-------------|-----------|-----------|
| id | String (UUID) | Sim | UUID v4 | Identificador único |
| subscriptionId | String (UUID) | Sim | FK to Subscription | Assinatura relacionada |
| amount | Decimal | Sim | > 0 | Valor do pagamento (centavos) |
| status | Enum | Sim | PENDING, CONFIRMED, RECEIVED, OVERDUE, REFUNDED | Status do pagamento |
| dueDate | DateTime | Sim | - | Data de vencimento |
| paymentDate | DateTime | Não | - | Data efetiva do pagamento |
| description | String | Não | Max 200 chars | Descrição do pagamento |
| asaasPaymentId | String | Não | - | ID do payment no Asaas |
| asaasInvoiceUrl | String | Não | URL | Link para fatura no Asaas |
| failureReason | String | Não | Max 500 chars | Motivo da falha (se aplicável) |
| createdAt | DateTime | Sim | - | Data de criação |
| updatedAt | DateTime | Sim | - | Data de última atualização |

**Enums:**
```typescript
enum PaymentStatus {
  PENDING = 'pending',         // Aguardando pagamento
  CONFIRMED = 'confirmed',     // Pagamento confirmado
  RECEIVED = 'received',       // Pagamento recebido
  OVERDUE = 'overdue',         // Vencido
  REFUNDED = 'refunded'        // Estornado
}
```

**Relationships:**
- `subscription`: Subscription (many-to-one)

**Indexes:**
```sql
CREATE INDEX idx_payments_subscription ON payment_history(subscription_id);
CREATE INDEX idx_payments_status ON payment_history(status);
CREATE INDEX idx_payments_due_date ON payment_history(due_date);
CREATE UNIQUE INDEX idx_payments_asaas ON payment_history(asaas_payment_id) WHERE asaas_payment_id IS NOT NULL;
```

**Business Rules:**
- Cada tentativa de cobrança gera um registro
- Status atualizado via webhooks do Asaas
- `paymentDate` é preenchido apenas quando status = RECEIVED
- Primeiro pagamento ocorre após trial (se existir)

---

## Prisma Schema

```prisma
// Product/Plan
model Product {
  id               String         @id @default(uuid())
  name             String
  description      String?
  priceMonthly     Int            // Em centavos
  billingCycle     BillingCycle
  features         Json           // Array de strings
  maxSessions      Int
  maxLeads         Int?
  trialDays        Int            @default(0)
  isActive         Boolean        @default(true)
  isMostPopular    Boolean        @default(false)
  position         Int            @default(0)
  asaasProductId   String?        @unique
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  deletedAt        DateTime?

  subscriptions    Subscription[]

  @@index([isActive])
  @@index([position])
  @@map("products")
}

// Subscription
model Subscription {
  id                    String             @id @default(uuid())
  companyId             String
  productId             String
  status                SubscriptionStatus
  billingCycle          BillingCycle
  priceAmount           Int                // Em centavos
  hasTrial              Boolean            @default(false)
  trialDurationDays     Int?
  trialStartDate        DateTime?
  trialEndDate          DateTime?
  isInTrial             Boolean            @default(false)
  startDate             DateTime           @default(now())
  nextDueDate           DateTime?
  lastPaymentDate       DateTime?
  canceledAt            DateTime?
  cancellationReason    String?
  paymentCount          Int                @default(0)
  asaasSubscriptionId   String?            @unique
  asaasCustomerId       String?
  metadata              Json?
  createdAt             DateTime           @default(now())
  updatedAt             DateTime           @updatedAt
  deletedAt             DateTime?

  company               Company            @relation(fields: [companyId], references: [id])
  product               Product            @relation(fields: [productId], references: [id])
  payments              PaymentHistory[]

  @@index([companyId])
  @@index([productId])
  @@index([status])
  @@index([trialEndDate])
  @@index([nextDueDate])
  @@index([deletedAt])
  @@map("subscriptions")
}

// Payment History
model PaymentHistory {
  id               String        @id @default(uuid())
  subscriptionId   String
  amount           Int           // Em centavos
  status           PaymentStatus
  dueDate          DateTime
  paymentDate      DateTime?
  description      String?
  asaasPaymentId   String?       @unique
  asaasInvoiceUrl  String?
  failureReason    String?
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt

  subscription     Subscription  @relation(fields: [subscriptionId], references: [id])

  @@index([subscriptionId])
  @@index([status])
  @@index([dueDate])
  @@map("payment_history")
}

// Enums
enum BillingCycle {
  WEEKLY
  BIWEEKLY
  MONTHLY
  QUARTERLY
  SEMIANNUALLY
  YEARLY
}

enum SubscriptionStatus {
  TRIALING
  ACTIVE
  PAST_DUE
  CANCELED
  SUSPENDED
  EXPIRED
}

enum PaymentStatus {
  PENDING
  CONFIRMED
  RECEIVED
  OVERDUE
  REFUNDED
}
```

---

## Validation Rules (Zod Schemas)

```typescript
import { z } from 'zod';

// Product
export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).max(50),
  description: z.string().max(500).optional(),
  priceMonthly: z.number().int().positive(),
  billingCycle: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMIANNUALLY', 'YEARLY']),
  features: z.array(z.string()),
  maxSessions: z.number().int().positive(),
  maxLeads: z.number().int().positive().nullable(),
  trialDays: z.number().int().min(0).max(90),
  isActive: z.boolean(),
  isMostPopular: z.boolean(),
  position: z.number().int().min(0),
  asaasProductId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable()
});

export const CreateProductSchema = ProductSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true
});

// Subscription
export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  productId: z.string().uuid(),
  status: z.enum(['trialing', 'active', 'past_due', 'canceled', 'suspended', 'expired']),
  billingCycle: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly', 'semiannually', 'yearly']),
  priceAmount: z.number().int().nonnegative(),
  hasTrial: z.boolean(),
  trialDurationDays: z.number().int().min(0).max(90).nullable(),
  trialStartDate: z.date().nullable(),
  trialEndDate: z.date().nullable(),
  isInTrial: z.boolean(),
  startDate: z.date(),
  nextDueDate: z.date().nullable(),
  lastPaymentDate: z.date().nullable(),
  canceledAt: z.date().nullable(),
  cancellationReason: z.string().max(500).nullable(),
  paymentCount: z.number().int().min(0),
  asaasSubscriptionId: z.string().nullable(),
  asaasCustomerId: z.string().nullable(),
  metadata: z.record(z.any()).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable()
}).refine(
  (data) => {
    if (data.hasTrial) {
      return data.trialDurationDays != null &&
             data.trialStartDate != null &&
             data.trialEndDate != null;
    }
    return true;
  },
  { message: "Trial subscriptions must have trial dates and duration" }
);

export const CreateTrialSubscriptionSchema = z.object({
  companyId: z.string().uuid(),
  productId: z.string().uuid(),
  asaasCustomerId: z.string().optional()
});

export const CancelSubscriptionSchema = z.object({
  reason: z.string().max(500).optional()
});

// Payment
export const PaymentHistorySchema = z.object({
  id: z.string().uuid(),
  subscriptionId: z.string().uuid(),
  amount: z.number().int().positive(),
  status: z.enum(['pending', 'confirmed', 'received', 'overdue', 'refunded']),
  dueDate: z.date(),
  paymentDate: z.date().nullable(),
  description: z.string().max(200).nullable(),
  asaasPaymentId: z.string().nullable(),
  asaasInvoiceUrl: z.string().url().nullable(),
  failureReason: z.string().max(500).nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});
```

---

## Computed Fields & Helpers

```typescript
// Subscription helpers
export function isTrialActive(subscription: Subscription): boolean {
  if (!subscription.hasTrial || !subscription.trialEndDate) return false;
  return new Date() < subscription.trialEndDate && subscription.status === 'trialing';
}

export function getDaysRemainingInTrial(subscription: Subscription): number {
  if (!isTrialActive(subscription) || !subscription.trialEndDate) return 0;
  const now = new Date();
  const end = subscription.trialEndDate;
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function calculateNextDueDate(
  trialEndDate: Date | null,
  lastPaymentDate: Date | null,
  billingCycle: BillingCycle
): Date {
  const baseDate = trialEndDate || lastPaymentDate || new Date();

  switch (billingCycle) {
    case 'WEEKLY':
      return addDays(baseDate, 7);
    case 'BIWEEKLY':
      return addDays(baseDate, 14);
    case 'MONTHLY':
      return addMonths(baseDate, 1);
    case 'QUARTERLY':
      return addMonths(baseDate, 3);
    case 'SEMIANNUALLY':
      return addMonths(baseDate, 6);
    case 'YEARLY':
      return addYears(baseDate, 1);
  }
}

export function canActivateTrial(companyId: string, productId: string): Promise<boolean> {
  // Check if company already had trial for this product
  const existingTrial = await prisma.subscription.findFirst({
    where: {
      companyId,
      productId,
      hasTrial: true,
      deletedAt: null
    }
  });

  return existingTrial == null;
}

// Product helpers
export function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(priceInCents / 100);
}

export function getBillingCycleLabel(cycle: BillingCycle): string {
  const labels = {
    WEEKLY: 'Semanal',
    BIWEEKLY: 'Quinzenal',
    MONTHLY: 'Mensal',
    QUARTERLY: 'Trimestral',
    SEMIANNUALLY: 'Semestral',
    YEARLY: 'Anual'
  };
  return labels[cycle];
}
```

---

## Migration Plan

### Step 1: Create Products table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  description TEXT,
  price_monthly INTEGER NOT NULL CHECK (price_monthly > 0),
  billing_cycle VARCHAR(20) NOT NULL,
  features JSONB NOT NULL,
  max_sessions INTEGER NOT NULL CHECK (max_sessions > 0),
  max_leads INTEGER CHECK (max_leads > 0 OR max_leads IS NULL),
  trial_days INTEGER NOT NULL DEFAULT 0 CHECK (trial_days >= 0 AND trial_days <= 90),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_most_popular BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  asaas_product_id VARCHAR(100) UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_position ON products(position);
```

### Step 2: Create Subscriptions table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  product_id UUID NOT NULL REFERENCES products(id),
  status VARCHAR(20) NOT NULL,
  billing_cycle VARCHAR(20) NOT NULL,
  price_amount INTEGER NOT NULL CHECK (price_amount >= 0),
  has_trial BOOLEAN NOT NULL DEFAULT false,
  trial_duration_days INTEGER CHECK (trial_duration_days >= 0 AND trial_duration_days <= 90),
  trial_start_date TIMESTAMP,
  trial_end_date TIMESTAMP,
  is_in_trial BOOLEAN NOT NULL DEFAULT false,
  start_date TIMESTAMP NOT NULL DEFAULT NOW(),
  next_due_date TIMESTAMP,
  last_payment_date TIMESTAMP,
  canceled_at TIMESTAMP,
  cancellation_reason TEXT,
  payment_count INTEGER NOT NULL DEFAULT 0 CHECK (payment_count >= 0),
  asaas_subscription_id VARCHAR(100) UNIQUE,
  asaas_customer_id VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_subscriptions_company ON subscriptions(company_id);
CREATE INDEX idx_subscriptions_product ON subscriptions(product_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_trial_end ON subscriptions(trial_end_date) WHERE is_in_trial = true;
CREATE INDEX idx_subscriptions_next_due ON subscriptions(next_due_date) WHERE status IN ('active', 'past_due');
CREATE INDEX idx_subscriptions_deleted ON subscriptions(deleted_at);
```

### Step 3: Create PaymentHistory table
```sql
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),
  amount INTEGER NOT NULL CHECK (amount > 0),
  status VARCHAR(20) NOT NULL,
  due_date TIMESTAMP NOT NULL,
  payment_date TIMESTAMP,
  description VARCHAR(200),
  asaas_payment_id VARCHAR(100) UNIQUE,
  asaas_invoice_url TEXT,
  failure_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_subscription ON payment_history(subscription_id);
CREATE INDEX idx_payments_status ON payment_history(status);
CREATE INDEX idx_payments_due_date ON payment_history(due_date);
```

---

## 4. Credit Package (Pacote de Créditos)

**Backend Table**: `produtos` (reusa estrutura de Product mas com `tipo = 'creditos'`)

Representa um pacote de créditos para compra one-time.

**Fields:**

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|-------------|-----------|-----------|
| id | String (UUID) | Sim | UUID v4 | Identificador único |
| nome | String | Sim | 3-100 chars | Nome do pacote (ex: "Pacote Pro") |
| descricao | String | Não | Max 500 chars | Descrição do pacote |
| preco_centavos | Integer | Sim | > 0 | Preço em centavos |
| quantidade_creditos | Integer | Sim | > 0 | Créditos base inclusos |
| bonus_creditos | Integer | Sim | >= 0 | Créditos bônus (padrão: 0) |
| ativo | Boolean | Sim | - | Se o pacote está à venda |
| destaque | Boolean | Sim | - | Badge de "mais popular" |
| ordem | Integer | Sim | >= 0 | Ordem de exibição |
| created_at | DateTime | Sim | - | Data de criação |
| updated_at | DateTime | Sim | - | Data de atualização |

**Computed Fields:**
- `leadsInclusos`: quantidade_creditos / 33 (custo médio por lead)
- `precoFormatado`: formatCurrency(preco_centavos)
- `custoPorLead`: preco_centavos / (quantidade_creditos / 33)

**Example:**
```json
{
  "id": "10000000-0000-0000-0000-000000000003",
  "nome": "Pacote Pro",
  "descricao": "Mais popular - 750 leads + 50 bônus",
  "preco_centavos": 25000,
  "quantidade_creditos": 24750,
  "bonus_creditos": 1650,
  "ativo": true,
  "destaque": true,
  "ordem": 2
}
```

---

## 5. Credit Balance (Saldo de Créditos)

**Backend**: Calculado via query (não é tabela)

**Calculation:**
```sql
SELECT
  empresa_id,
  SUM(CASE WHEN tipo IN ('compra', 'bonus') THEN quantidade ELSE -quantidade END) as saldo_centavos
FROM transacoes_credito
WHERE empresa_id = ?
GROUP BY empresa_id
```

**Response Structure:**
```typescript
{
  empresaId: string;
  empresaNome: string;
  saldoCreditosCentavos: number;
  saldoFormatado: string;
  ultimaTransacao?: {
    id: string;
    tipo: 'compra' | 'uso' | 'bonus';
    quantidade: number;
    data: string;
  };
  estatisticas: {
    totalComprado: number;
    totalGasto: number;
    totalBonusRecebido: number;
  };
}
```

---

## 6. Credit Transaction (Transação de Créditos)

**Backend Table**: `transacoes_credito`

Registra todas movimentações de créditos.

**Fields:**

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|-------------|-----------|-----------|
| id | String (UUID) | Sim | UUID v4 | Identificador único |
| empresa_id | String (UUID) | Sim | FK to Company | Empresa relacionada |
| tipo | Enum | Sim | compra, uso, bonus, reembolso | Tipo de transação |
| quantidade | Integer | Sim | > 0 | Quantidade em centavos |
| descricao | String | Não | Max 500 chars | Descrição |
| produto_id | String (UUID) | Não | FK to Produto | Pacote comprado (se tipo=compra) |
| lead_id | String (UUID) | Não | FK to Lead | Lead comprado (se tipo=uso) |
| asaas_payment_id | String | Não | - | ID do payment no Asaas |
| created_at | DateTime | Sim | - | Data da transação |
| updated_at | DateTime | Sim | - | Última atualização |

**Enums:**
```typescript
enum TipoTransacao {
  COMPRA = 'compra',      // Compra de pacote
  USO = 'uso',            // Compra de lead
  BONUS = 'bonus',        // Crédito bônus
  REEMBOLSO = 'reembolso' // Estorno
}
```

**Indexes:**
```sql
CREATE INDEX idx_transacoes_empresa ON transacoes_credito(empresa_id);
CREATE INDEX idx_transacoes_tipo ON transacoes_credito(tipo);
CREATE INDEX idx_transacoes_created ON transacoes_credito(created_at DESC);
```

---

## 7. Lead (Marketplace)

**Backend Table**: `leads`

Lead disponível para compra no marketplace.

**Fields:**

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|-------------|-----------|-----------|
| id | String (UUID) | Sim | UUID v4 | Identificador único |
| empresa_nome | String | Sim | - | Nome da empresa |
| segmento | String | Não | - | Segmento de atuação |
| cidade | String | Não | - | Cidade |
| estado | String | Não | 2 chars | UF |
| telefone | String | Não | - | Telefone (mascarado no preview) |
| email | String | Não | Email | Email (mascarado no preview) |
| custo_creditos_centavos | Integer | Sim | > 0 | Custo em créditos (padrão: 30) |
| status_marketplace | Enum | Sim | publico, vendido, privado, indisponivel | Status |
| created_at | DateTime | Sim | - | Data de criação |
| updated_at | DateTime | Sim | - | Última atualização |

**Enums:**
```typescript
enum StatusMarketplace {
  PUBLICO = 'publico',           // Disponível para compra
  VENDIDO = 'vendido',           // Já vendido (pode ser revendido)
  PRIVADO = 'privado',           // Não aparece no marketplace
  INDISPONIVEL = 'indisponivel'  // Temporariamente fora
}
```

**Preview Masking:**
```typescript
function maskLeadForPreview(lead: Lead) {
  return {
    ...lead,
    telefone: lead.telefone ? lead.telefone.slice(0, -4) + '****' : null,
    email: lead.email ? '***@***.com' : null
  };
}
```

---

## 8. Lead Access (Acesso a Leads)

**Backend Table**: `lead_acesso_empresas`

Registra quais empresas compraram quais leads.

**Fields:**

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|-------------|-----------|-----------|
| id | String (UUID) | Sim | UUID v4 | Identificador único |
| lead_id | String (UUID) | Sim | FK to Lead | Lead comprado |
| empresa_id | String (UUID) | Sim | FK to Company | Empresa compradora |
| usuario_id | String (UUID) | Sim | FK to User | Usuário que comprou |
| tipo_acesso | Enum | Sim | comprado, trial, bonus | Tipo de acesso |
| custo_pago_centavos | Integer | Sim | >= 0 | Créditos pagos |
| limite_visualizacoes | Integer | Sim | > 0 | Limite de views (padrão: 999) |
| visualizacoes_count | Integer | Sim | >= 0 | Contador de views |
| data_compra | DateTime | Sim | - | Data da compra |
| created_at | DateTime | Sim | - | Criação do registro |
| updated_at | DateTime | Sim | - | Última atualização |

**Enums:**
```typescript
enum TipoAcesso {
  COMPRADO = 'comprado',  // Comprado com créditos
  TRIAL = 'trial',        // Acesso via trial
  BONUS = 'bonus'         // Lead bônus
}
```

**Indexes:**
```sql
CREATE INDEX idx_lead_acesso_empresa ON lead_acesso_empresas(empresa_id);
CREATE INDEX idx_lead_acesso_lead ON lead_acesso_empresas(lead_id);
CREATE UNIQUE INDEX idx_lead_acesso_unique ON lead_acesso_empresas(lead_id, empresa_id);
```

**Business Rules:**
- Uma empresa só pode ter um registro de acesso por lead (UNIQUE constraint)
- `visualizacoes_count` incrementa a cada vez que lead é visualizado
- Acesso negado se `visualizacoes_count >= limite_visualizacoes`

---

## Prisma Schema (Extended)

```prisma
// Credit Package (reusa modelo Product)
// Já existe - apenas adicionar tipo = 'creditos'

// Credit Transaction
model CreditTransaction {
  id              String             @id @default(uuid())
  empresaId       String
  tipo            TipoTransacao
  quantidade      Int                // Em centavos
  descricao       String?
  produtoId       String?
  leadId          String?
  asaasPaymentId  String?
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  company         Company            @relation(fields: [empresaId], references: [id])
  produto         Product?           @relation(fields: [produtoId], references: [id])
  lead            Lead?              @relation(fields: [leadId], references: [id])

  @@index([empresaId])
  @@index([tipo])
  @@index([createdAt])
  @@map("transacoes_credito")
}

// Lead
model Lead {
  id                      String              @id @default(uuid())
  empresaNome             String
  segmento                String?
  cidade                  String?
  estado                  String?
  telefone                String?
  email                   String?
  custoCreditosCentavos   Int                 @default(30)
  statusMarketplace       StatusMarketplace   @default(PUBLICO)
  createdAt               DateTime            @default(now())
  updatedAt               DateTime            @updatedAt

  acessos                 LeadAccess[]
  transacoes              CreditTransaction[]

  @@index([statusMarketplace])
  @@index([segmento])
  @@index([cidade])
  @@map("leads")
}

// Lead Access
model LeadAccess {
  id                    String        @id @default(uuid())
  leadId                String
  empresaId             String
  usuarioId             String
  tipoAcesso            TipoAcesso
  custoPagoCentavos     Int           @default(0)
  limiteVisualizacoes   Int           @default(999)
  visualizacoesCount    Int           @default(0)
  dataCompra            DateTime      @default(now())
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt

  lead                  Lead          @relation(fields: [leadId], references: [id])
  company               Company       @relation(fields: [empresaId], references: [id])
  user                  User          @relation(fields: [usuarioId], references: [id])

  @@unique([leadId, empresaId])
  @@index([empresaId])
  @@index([leadId])
  @@map("lead_acesso_empresas")
}

// Enums
enum TipoTransacao {
  COMPRA
  USO
  BONUS
  REEMBOLSO
}

enum TipoAcesso {
  COMPRADO
  TRIAL
  BONUS
}

enum StatusMarketplace {
  PUBLICO
  VENDIDO
  PRIVADO
  INDISPONIVEL
}
```

---

## Validation Rules (Zod Schemas - Credits)

```typescript
// Credit Package
export const CreditPackageSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(3).max(100),
  descricao: z.string().max(500).optional(),
  preco_centavos: z.number().int().positive(),
  quantidade_creditos: z.number().int().positive(),
  bonus_creditos: z.number().int().min(0),
  ativo: z.boolean(),
  destaque: z.boolean(),
  ordem: z.number().int().min(0),
  created_at: z.date(),
  updated_at: z.date()
});

// Credit Balance Response
export const CreditBalanceSchema = z.object({
  empresaId: z.string().uuid(),
  empresaNome: z.string(),
  saldoCreditosCentavos: z.number().int().min(0),
  saldoFormatado: z.string(),
  ultimaTransacao: z.object({
    id: z.string().uuid(),
    tipo: z.enum(['compra', 'uso', 'bonus', 'reembolso']),
    quantidade: z.number().int(),
    data: z.string().datetime()
  }).optional(),
  estatisticas: z.object({
    totalComprado: z.number().int().min(0),
    totalGasto: z.number().int().min(0),
    totalBonusRecebido: z.number().int().min(0)
  })
});

// Purchase Lead Request
export const PurchaseLeadSchema = z.object({
  empresaId: z.string().uuid(),
  leadId: z.string().uuid(),
  userId: z.string().uuid(),
  tipoAcesso: z.enum(['comprado', 'trial', 'bonus']).default('comprado'),
  limiteVisualizacoes: z.number().int().positive().default(999)
});

// Lead (marketplace)
export const LeadSchema = z.object({
  id: z.string().uuid(),
  empresaNome: z.string(),
  segmento: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().length(2).optional(),
  telefone: z.string().optional(),
  email: z.string().email().optional(),
  custoCreditosCentavos: z.number().int().positive().default(30),
  statusMarketplace: z.enum(['publico', 'vendido', 'privado', 'indisponivel']),
  createdAt: z.date(),
  updatedAt: z.date()
});
```

---

## Computed Fields & Helpers (Credits)

```typescript
// Credit helpers
export function calculateLeadsFromCredits(credits: number, avgCostPerLead = 33): number {
  return Math.floor(credits / avgCostPerLead);
}

export function formatCreditsAsCurrency(credits: number): string {
  return formatPrice(credits); // Reusa helper de Product
}

// Lead helpers
export function canAffordLead(userBalance: number, leadCost: number): boolean {
  return userBalance >= leadCost;
}

export function hasAccessToLead(empresaId: string, leadId: string): Promise<boolean> {
  const access = await prisma.leadAccess.findUnique({
    where: {
      leadId_empresaId: {
        leadId,
        empresaId
      }
    }
  });
  return access != null;
}

export function maskLeadForPreview(lead: Lead) {
  return {
    ...lead,
    telefone: lead.telefone ? lead.telefone.slice(0, -4) + '****' : null,
    email: lead.email ? '***@***.com' : null
  };
}
```

---

## Migration Plan (Extended)

### Step 4: Create Credit Transactions table
```sql
CREATE TABLE transacoes_credito (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES companies(id),
  tipo VARCHAR(20) NOT NULL,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  descricao TEXT,
  produto_id UUID REFERENCES produtos(id),
  lead_id UUID REFERENCES leads(id),
  asaas_payment_id VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transacoes_empresa ON transacoes_credito(empresa_id);
CREATE INDEX idx_transacoes_tipo ON transacoes_credito(tipo);
CREATE INDEX idx_transacoes_created ON transacoes_credito(created_at DESC);
```

### Step 5: Create Leads table
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_nome VARCHAR(200) NOT NULL,
  segmento VARCHAR(100),
  cidade VARCHAR(100),
  estado CHAR(2),
  telefone VARCHAR(20),
  email VARCHAR(200),
  custo_creditos_centavos INTEGER NOT NULL DEFAULT 30 CHECK (custo_creditos_centavos > 0),
  status_marketplace VARCHAR(20) NOT NULL DEFAULT 'publico',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leads_status ON leads(status_marketplace);
CREATE INDEX idx_leads_segmento ON leads(segmento);
CREATE INDEX idx_leads_cidade ON leads(cidade);
```

### Step 6: Create Lead Access table
```sql
CREATE TABLE lead_acesso_empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id),
  empresa_id UUID NOT NULL REFERENCES companies(id),
  usuario_id UUID NOT NULL REFERENCES users(id),
  tipo_acesso VARCHAR(20) NOT NULL,
  custo_pago_centavos INTEGER NOT NULL DEFAULT 0,
  limite_visualizacoes INTEGER NOT NULL DEFAULT 999 CHECK (limite_visualizacoes > 0),
  visualizacoes_count INTEGER NOT NULL DEFAULT 0 CHECK (visualizacoes_count >= 0),
  data_compra TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lead_acesso_empresa ON lead_acesso_empresas(empresa_id);
CREATE INDEX idx_lead_acesso_lead ON lead_acesso_empresas(lead_id);
CREATE UNIQUE INDEX idx_lead_acesso_unique ON lead_acesso_empresas(lead_id, empresa_id);
```

---

## Next Steps

✅ **Data Model Complete** (Subscriptions + Credits + Marketplace)
→ Create API contracts in `/contracts/`
→ Generate contract tests
→ Create quickstart.md scenarios
