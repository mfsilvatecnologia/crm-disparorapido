# Resumo da Integração - Payments API Frontend

## Data: 2025-10-19

## Objetivo
Ajustar o feature `sales` do frontend para corresponder à especificação da API de pagamentos do backend documentada em [`doc/BACKEND/controller-payment.md`](BACKEND/controller-payment.md).

## Mudanças Realizadas

### 1. Tipos Atualizados ([`src/features/sales/types/payment.types.ts`](../src/features/sales/types/payment.types.ts))

#### PaymentStatus
- **Antes**: `'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'`
- **Depois**: `'PENDING' | 'RECEIVED' | 'CONFIRMED' | 'OVERDUE' | 'REFUNDED' | 'CANCELLED'`
- **Motivo**: Corresponder aos enums do backend

#### BillingType (anteriormente PaymentMethod)
- **Antes**: `'credit_card' | 'pix' | 'boleto'`
- **Depois**: `'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED'`
- **Motivo**: Corresponder aos enums do backend

#### Payment Interface
```typescript
// Antes
interface Payment {
  id: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  createdAt: string;
  updatedAt: string;
  description: string;
  subscriptionId?: string;
  metadata?: Record<string, unknown>;
}

// Depois
interface Payment {
  id: string;
  empresaId: string | null;
  value: number;
  netValue: number;
  description: string;
  billingType: BillingType;
  status: PaymentStatus;
  dueDate: string;
  paymentDate: string | null;
  invoiceUrl: string;
  createdAt: string;
}
```

#### PaymentListParams
```typescript
// Antes
interface PaymentListParams {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  startDate?: string;
  endDate?: string;
}

// Depois
interface PaymentListParams {
  limit?: number;
  offset?: number;
  status?: PaymentStatus;
  startDate?: string;
  endDate?: string;
}
```

#### PaymentListResponse
```typescript
// Antes
interface PaymentListResponse {
  payments: Payment[];
  pagination: PaginationMeta;
}

// Depois
interface PaymentListResponse {
  totalCount: number;
  limit: number;
  offset: number;
  data: Payment[];
}
```

#### Novos Tipos Adicionados
- `SummaryItem`: Para itens agregados no resumo financeiro
- `FinancialSummary`: Resumo financeiro completo do backend
- `FinancialSummaryParams`: Parâmetros para filtrar o resumo financeiro

### 2. Tipos de Crédito Atualizados ([`src/features/sales/types/credit.types.ts`](../src/features/sales/types/credit.types.ts))

#### CreditTransactionType
- **Antes**: `'earned' | 'spent' | 'bonus' | 'refund'`
- **Depois**: `'compra' | 'uso' | 'reembolso' | 'bonus'`
- **Motivo**: Corresponder aos enums do backend em português

#### CreditTransaction Interface
```typescript
// Antes
interface CreditTransaction {
  id: string;
  amount: number;
  type: CreditTransactionType;
  description: string;
  createdAt: string;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: string;
  balanceAfter: number;
}

// Depois
interface CreditTransaction {
  id: string;
  empresaId: string;
  type: CreditTransactionType;
  quantity: number;
  previousBalance: number;
  newBalance: number;
  amountPaid: number | null;
  paymentId: string | null;
  lead: {
    id: string;
    name: string;
  } | null;
  description: string;
  createdAt: string;
}
```

#### CreditTransactionListResponse
- **Antes**: Objeto com `transactions` e `pagination`
- **Depois**: Array direto de `CreditTransaction[]`

### 3. Schemas de Validação Atualizados

#### [`src/features/sales/schemas/payment.schema.ts`](../src/features/sales/schemas/payment.schema.ts)
- Atualizado `paymentStatusSchema` com novos valores
- Renomeado `paymentMethodSchema` para `billingTypeSchema`
- Atualizado `paymentSchema` com nova estrutura
- Atualizado `paymentListParamsSchema` (offset em vez de page)
- Atualizado `paymentListResponseSchema` com nova estrutura
- Adicionado `summaryItemSchema`
- Adicionado `financialSummarySchema`
- Adicionado `financialSummaryParamsSchema`

#### [`src/features/sales/schemas/credit.schema.ts`](../src/features/sales/schemas/credit.schema.ts) (Novo)
- Criado `creditTransactionTypeSchema`
- Criado `creditTransactionSchema`
- Criado `creditTransactionListParamsSchema`
- Criado `creditTransactionListResponseSchema`

### 4. APIs Atualizadas

#### [`src/features/sales/api/paymentsApi.ts`](../src/features/sales/api/paymentsApi.ts)
- **Renomeado**: `getPayments()` → `getPaymentHistory()`
- **Endpoint**: `/payments` → `/payments/history`
- **Removido**: `cancelPayment()` e `refundPayment()` (não estão na spec do backend)
- **Adicionado**: `getFinancialSummary()` para `/payments/summary`

#### [`src/features/sales/api/creditTransactionsApi.ts`](../src/features/sales/api/creditTransactionsApi.ts) (Novo)
- Criado `getCreditTransactions()` para `/payments/credits/transactions`

#### [`src/features/sales/api/index.ts`](../src/features/sales/api/index.ts)
- Adicionado export de `creditTransactionsApi`

### 5. Hooks Atualizados/Criados

#### [`src/features/sales/hooks/payments/usePaymentHistory.ts`](../src/features/sales/hooks/payments/usePaymentHistory.ts)
- Atualizado para usar `getPaymentHistory()` em vez de `getPayments()`

#### [`src/features/sales/hooks/credits/useCreditTransactionHistory.ts`](../src/features/sales/hooks/credits/useCreditTransactionHistory.ts) (Novo)
- Hook para buscar histórico de transações de crédito
- Query key: `creditTransactionsKeys`

#### [`src/features/sales/hooks/financial/useFinancialSummary.ts`](../src/features/sales/hooks/financial/useFinancialSummary.ts)
- Atualizado para usar a nova API `getFinancialSummary()`
- Query key: `financialSummaryKeys`

#### [`src/features/sales/hooks/index.ts`](../src/features/sales/hooks/index.ts)
- Adicionado export de `useCreditTransactionHistory`
- Adicionado export de `useFinancialSummary`

### 6. Tipos Financeiros ([`src/features/sales/types/financial.types.ts`](../src/features/sales/types/financial.types.ts))
- Simplificado para re-exportar tipos de `payment.types.ts`
- Mantém compatibilidade com código existente

## Endpoints do Backend Implementados

### ✅ Implementados
1. `GET /payments/history` - Histórico de pagamentos com paginação e filtros
2. `GET /payments/{paymentId}` - Detalhes de um pagamento específico
3. `GET /payments/credits/transactions` - Histórico de transações de crédito
4. `GET /payments/summary` - Resumo financeiro agregado

## Breaking Changes

### Para Desenvolvedores

1. **PaymentStatus**: Valores agora são UPPERCASE
   ```typescript
   // Antes
   if (payment.status === 'pending') { }
   
   // Depois
   if (payment.status === 'PENDING') { }
   ```

2. **BillingType**: Nome e valores mudaram
   ```typescript
   // Antes
   payment.method === 'credit_card'
   
   // Depois
   payment.billingType === 'CREDIT_CARD'
   ```

3. **Payment Interface**: Campos diferentes
   ```typescript
   // Antes
   payment.amount
   
   // Depois
   payment.value // valor bruto
   payment.netValue // valor líquido
   ```

4. **Paginação**: Mudou de page-based para offset-based
   ```typescript
   // Antes
   { page: 1, limit: 10 }
   
   // Depois
   { offset: 0, limit: 10 }
   ```

5. **CreditTransactionType**: Valores em português
   ```typescript
   // Antes
   type === 'earned'
   
   // Depois
   type === 'compra'
   ```

## Componentes que Precisam Ser Atualizados

Os seguintes componentes provavelmente precisarão ser atualizados para usar os novos tipos:

1. [`src/features/sales/components/payments/PaymentCard.tsx`](../src/features/sales/components/payments/PaymentCard.tsx)
2. [`src/features/sales/components/payments/PaymentList.tsx`](../src/features/sales/components/payments/PaymentList.tsx)
3. [`src/features/sales/components/payments/PaymentStatusBadge.tsx`](../src/features/sales/components/payments/PaymentStatusBadge.tsx)
4. [`src/features/sales/components/payments/PaymentFilters.tsx`](../src/features/sales/components/payments/PaymentFilters.tsx)
5. [`src/features/sales/components/credits/CreditTransactionList.tsx`](../src/features/sales/components/credits/CreditTransactionList.tsx)
6. [`src/features/sales/components/credits/TransactionHistory.tsx`](../src/features/sales/components/credits/TransactionHistory.tsx)
7. [`src/features/sales/components/financial/FinancialSummaryCard.tsx`](../src/features/sales/components/financial/FinancialSummaryCard.tsx)

## Próximos Passos

1. ✅ Atualizar tipos e interfaces
2. ✅ Atualizar schemas de validação
3. ✅ Atualizar APIs
4. ✅ Atualizar/criar hooks
5. ⏳ Atualizar componentes para usar novos tipos
6. ⏳ Atualizar testes de contrato
7. ⏳ Testar integração com backend
8. ⏳ Atualizar documentação de uso

## Notas Importantes

- Todos os tipos legados foram mantidos com `@deprecated` para compatibilidade
- A estrutura de paginação mudou significativamente (page → offset)
- Os enums do backend estão em UPPERCASE, diferente do padrão anterior
- Transações de crédito agora retornam um array direto, não um objeto paginado
- O resumo financeiro tem uma estrutura complexa e aninhada

## Referências

- Especificação Backend: [`doc/BACKEND/controller-payment.md`](BACKEND/controller-payment.md)
- Feature Sales: [`src/features/sales/`](../src/features/sales/)