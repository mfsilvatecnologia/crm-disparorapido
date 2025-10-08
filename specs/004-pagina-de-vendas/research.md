# Research: Página de Vendas com Sistema de Assinaturas

**Feature**: 004-pagina-de-vendas
**Date**: 2025-10-04
**Status**: Complete

## Research Topics & Decisions

### 1. Payment Gateway Integration

**Decision**: Asaas (https://docs.asaas.com)

**Rationale**:
- Gateway brasileiro com foco em SaaS e assinaturas recorrentes
- Suporte nativo para cobrança recorrente e trial periods
- Webhooks robustos para eventos de assinatura
- Documentação completa em português
- API RESTful bem documentada
- Taxas competitivas para mercado brasileiro
- Compliance com regulações brasileiras (LGPD, Banco Central)

**Alternatives Considered**:
- **Stripe**: Excelente API mas taxas de câmbio para BRL, complexidade para compliance local
- **PagSeguro**: Limitações em trial automático, webhooks menos robustos
- **Mercado Pago**: Bom para e-commerce mas menos focado em SaaS recorrente

**Implementation Notes**:
- SDK oficial: Não possui SDK TypeScript oficial, usaremos API REST diretamente com axios
- Autenticação: API Key via header `access_token`
- Webhooks: Suporta eventos de `PAYMENT_RECEIVED`, `PAYMENT_OVERDUE`, `SUBSCRIPTION_UPDATED`
- Trial: Implementado via campo `trial` na criação da assinatura

**API Endpoints Principais**:
```
POST /v3/subscriptions - Criar assinatura
GET /v3/subscriptions/:id - Consultar assinatura
DELETE /v3/subscriptions/:id - Cancelar assinatura
POST /v3/payments - Criar cobrança avulsa
GET /v3/customers - Listar/criar clientes
```

---

### 2. Subscription State Management

**Decision**: Enum-based status com validações de transição

**Rationale**:
- Estados do Asaas: `ACTIVE`, `EXPIRED`, `INACTIVE` (cancelada)
- Precisamos mapear estados internos para estados do Asaas
- Trial é indicado por flag `trialPeriodDays` e `trialEndDate`
- Simplicidade: Não justifica uso de library como XState para este caso

**States Definition**:
```typescript
enum SubscriptionStatus {
  TRIALING = 'trialing',      // Trial ativo (mapped: ACTIVE + inTrial=true)
  ACTIVE = 'active',           // Pagando normalmente (mapped: ACTIVE + inTrial=false)
  PAST_DUE = 'past_due',       // Pagamento atrasado (detect via webhook PAYMENT_OVERDUE)
  CANCELED = 'canceled',       // Cancelada pelo usuário (mapped: INACTIVE)
  SUSPENDED = 'suspended',     // Suspensa por falta de pagamento
  EXPIRED = 'expired'          // Trial expirado sem conversão (mapped: EXPIRED)
}
```

**Allowed Transitions**:
- TRIALING → ACTIVE (trial ends, payment success)
- TRIALING → EXPIRED (trial ends, no payment)
- TRIALING → CANCELED (user cancels during trial)
- ACTIVE → PAST_DUE (payment fails)
- ACTIVE → CANCELED (user cancels)
- PAST_DUE → ACTIVE (payment recovered)
- PAST_DUE → SUSPENDED (multiple failures)
- SUSPENDED → ACTIVE (payment recovered)

**Alternatives Considered**:
- XState: Over-engineering para estados relativamente simples
- Status string livre: Dificulta validação e pode causar inconsistências

---

### 3. Trial Expiration Handling

**Decision**: Node-cron para verificação diária + Asaas webhooks

**Rationale**:
- **Primary**: Webhooks do Asaas notificam automaticamente quando trial expira
- **Backup**: Cron job diário às 00:00 verifica trials que vencerão nas próximas 24h
- Precisão: Webhooks são em tempo real, cron é safety net
- Escalabilidade: Asaas gerencia a carga de processamento
- Confiabilidade: Redundância entre webhook e cron

**Implementation**:
```typescript
// Cron job (node-cron)
cron.schedule('0 0 * * *', async () => {
  await checkExpiringTrials(); // Próximas 24h
  await sendTrialExpirationReminders(); // 3 dias antes
});

// Webhook handler
POST /webhooks/asaas (event: SUBSCRIPTION_UPDATED)
  → Se status mudou de ACTIVE para EXPIRED
  → Atualizar subscription no DB
  → Enviar notificação ao usuário
```

**Alternatives Considered**:
- **Bull Queue**: Over-engineering, node-cron é suficiente para escala esperada
- **External Scheduler (AWS EventBridge)**: Adiciona dependência externa desnecessária
- **Polling contínuo**: Ineficiente, desperdiça recursos

**Notification Timing**:
- 3 dias antes do fim do trial: Reminder via email
- 1 dia antes: Reminder via email + in-app notification
- No dia da expiração: Via webhook do Asaas

---

### 4. Session Limiting per Plan

**Decision**: Redis-based session tracking com TTL

**Rationale**:
- Redis já está no projeto (ioredis configurado)
- Performance: O(1) para check e increment
- Accuracy: Real-time tracking de sessões ativas
- TTL automático: Sessões expiram se não renovadas

**Implementation**:
```typescript
// Key pattern: session:limit:{companyId}
// Value: Set de session IDs
// TTL: 24 horas (renovado a cada request autenticado)

async function checkSessionLimit(companyId: string, planMaxSessions: number): Promise<boolean> {
  const activeSessions = await redis.scard(`session:limit:${companyId}`);
  return activeSessions < planMaxSessions;
}

async function registerSession(companyId: string, sessionId: string) {
  await redis.sadd(`session:limit:${companyId}`, sessionId);
  await redis.expire(`session:limit:${companyId}`, 86400); // 24h
}
```

**Alternatives Considered**:
- **Database counting**: Mais lento, carga no PostgreSQL
- **In-memory (Map)**: Perde dados em restart, não funciona com múltiplos servers
- **JWT expiry only**: Não limita sessões simultâneas, apenas duração

**Edge Cases**:
- Usuário atinge limite: Mostrar mensagem clara indicando plano atual e limite
- Upgrade de plano: Recalcular limite imediatamente
- Sessões "presas": TTL garante limpeza automática

---

### 5. Notification System Integration

**Decision**: Sistema híbrido - Email (Nodemailer) + In-app (React Query + WebSocket)

**Rationale**:
- **Email**: Para notificações críticas (trial expiring, payment failed, subscription canceled)
- **In-app**: Para notificações informativas (payment successful, trial activated)
- **No Push**: Não justificado neste momento, pode ser adicionado depois

**Email Setup** (Nodemailer):
```typescript
// Use SMTP configurado em .env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@leadsrapido.com
SMTP_PASS=...

Templates:
- trial-activated.html
- trial-expiring-soon.html (3 dias antes)
- trial-expired.html
- payment-successful.html
- payment-failed.html
- subscription-canceled.html
```

**In-app Notifications**:
```typescript
// Component: NotificationBanner.tsx
// Context: NotificationContext
// Storage: LocalStorage (últimas 10 notificações)
// Polling: TanStack Query com refetchInterval de 30s
```

**Alternatives Considered**:
- **SendGrid/Mailgun**: Adiciona custo, Nodemailer é suficiente para escala atual
- **WebSocket para tudo**: Over-engineering, polling com React Query é suficiente
- **Push Notifications**: Não implementar agora, pode ser adicionado depois se necessário

**Notification Types**:
- SUCCESS: Verde, ícone check, auto-dismiss 5s
- WARNING: Amarelo, ícone alert, auto-dismiss 10s
- ERROR: Vermelho, ícone X, manual dismiss
- INFO: Azul, ícone info, auto-dismiss 7s

---

### 6. Responsive Design Patterns

**Decision**: Mobile-first com Tailwind CSS breakpoints

**Rationale**:
- Projeto já usa Tailwind CSS
- Mobile-first: Garante experiência mobile robusta
- Breakpoints padrão Tailwind: sm (640px), md (768px), lg (1024px), xl (1280px)
- Progressive enhancement: Funcionalidade core no mobile, enhancements no desktop

**Pricing Page Layout**:
```
Mobile (< 768px):
- Cards empilhados verticalmente
- Swipe horizontal para comparação de features
- CTA fixo no bottom (sticky)

Tablet (768px - 1024px):
- 2 cards por linha
- Comparação side-by-side

Desktop (> 1024px):
- 3-4 cards por linha (depende do número de planos)
- Hover effects
- Tabela de comparação expandida
```

**Components Responsivos**:
```typescript
// PricingCard.tsx
<div className="flex flex-col md:flex-row lg:grid lg:grid-cols-3">

// FeatureComparison.tsx
<table className="hidden lg:table">
<div className="lg:hidden"> {/* Mobile swipe view */}

// CheckoutFlow
<div className="w-full md:w-2/3 lg:w-1/2 mx-auto">
```

**Alternatives Considered**:
- **Desktop-first**: Menos comum hoje, mobile usage crescente
- **CSS Grid only**: Tailwind classes são mais produtivas
- **Separate mobile/desktop components**: Aumenta complexidade desnecessariamente

**Touch Considerations**:
- Botões mínimo 44x44px (tap target)
- Swipe gestures para navegação em carrossel
- No hover-only interactions (tudo acessível via tap)

---

### 7. Data Retention Policy

**Decision**: Soft delete com período de 30 dias

**Rationale**:
- LGPD: Usuário tem direito ao esquecimento, mas empresa pode reter dados por período razoável
- Recuperação: Permite reativação de subscription em até 30 dias
- Auditoria: Mantém histórico para análise financeira

**Implementation**:
```typescript
// Prisma schema
model Subscription {
  id String @id
  deletedAt DateTime? // Soft delete marker
  // ... outros campos
}

// Service layer
async function cancelSubscription(id: string, reason?: string) {
  await prisma.subscription.update({
    where: { id },
    data: {
      status: 'CANCELED',
      deletedAt: new Date(),
      cancellationReason: reason
    }
  });
}

// Cron job (mensal)
async function hardDeleteExpiredSubscriptions() {
  const thirtyDaysAgo = subDays(new Date(), 30);
  await prisma.subscription.deleteMany({
    where: {
      deletedAt: { lt: thirtyDaysAgo },
      status: 'CANCELED'
    }
  });
}
```

**Data Retained**:
- Subscription metadata (plan, dates, status)
- Payment history (via Asaas, mantém indefinidamente para compliance)
- Cancellation reason (se fornecido)

**Data Deleted** (após 30 dias):
- Subscription record completo
- Trial information
- Links com Company (mantém Company, apenas remove FK)

**Alternatives Considered**:
- **Hard delete imediato**: Perde dados para análise, dificulta recuperação
- **Retenção indefinida**: Viola princípio de minimização de dados (LGPD)
- **Arquivamento em cold storage**: Over-engineering para escala atual

**LGPD Compliance**:
- Usuário pode solicitar exclusão imediata via suporte
- Dados de pagamento ficam com Asaas (processador, não controlador)
- Privacy policy documenta período de retenção de 30 dias

---

## Technology Stack Summary

### Frontend
- **Framework**: React 18.3 + TypeScript 5.8
- **Routing**: React Router 6.30
- **State Management**: TanStack Query 5.89 (server state)
- **Forms**: React Hook Form 7.62 + Zod 3.25 (validation)
- **UI Components**: Radix UI (primitives) + Tailwind CSS
- **Notifications**: React Hot Toast / Sonner
- **HTTP Client**: Axios 1.11

### Backend
- **Runtime**: Node.js (LTS)
- **Framework**: Fastify 5.4
- **ORM**: Prisma 6.1
- **Database**: PostgreSQL
- **Cache/Sessions**: Redis (ioredis 5.4)
- **Authentication**: JWT (via @fastify/jwt 9.0)
- **Email**: Nodemailer
- **Scheduling**: node-cron

### Testing
- **Test Runner**: Vitest 3.2
- **React Testing**: Testing Library
- **API Mocking**: MSW 2.11
- **Coverage**: Vitest Coverage v8

### External Services
- **Payment Gateway**: Asaas (https://docs.asaas.com)
- **Email SMTP**: Configurável (Gmail, SendGrid, etc.)

---

## Integration Points

### Asaas API Integration
```typescript
// Base URL
const ASAAS_BASE_URL = process.env.ASAAS_ENV === 'production'
  ? 'https://api.asaas.com'
  : 'https://sandbox.asaas.com';

// Headers
Authorization: Bearer $access_token
Content-Type: application/json

// Rate Limits
- 60 requests/minuto (sandbox)
- 200 requests/minuto (produção)
```

### Webhook Configuration

**Nota**: O webhook do Asaas já está implementado no backend do projeto.

```typescript
// Endpoint existente: POST /api/webhooks/asaas (BACKEND)
// Esta feature irá CONSUMIR os eventos processados pelo webhook,
// atualizando a UI quando mudanças ocorrerem nas subscriptions

// Eventos processados pelo backend:
- PAYMENT_CREATED
- PAYMENT_UPDATED
- PAYMENT_CONFIRMED
- PAYMENT_RECEIVED
- PAYMENT_OVERDUE
- SUBSCRIPTION_CREATED
- SUBSCRIPTION_UPDATED
- SUBSCRIPTION_DELETED

// Frontend receberá atualizações via:
// - Polling (TanStack Query refetch)
// - Notificações in-app quando status mudar
```

### Existing System Integration
- **AuthContext**: Verificar autenticação antes de checkout
- **Company Model**: Associar subscription a company (não a user individual)
- **User Model**: Verificar permissões para cancelar subscription

---

## Performance Considerations

### Caching Strategy
```typescript
// Redis cache keys
product:list (TTL: 1 hora)
product:{id} (TTL: 1 hora)
subscription:{companyId} (TTL: 5 minutos)
session:limit:{companyId} (TTL: 24 horas)
```

### Database Indexes
```sql
CREATE INDEX idx_subscriptions_company ON subscriptions(company_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_trial_end ON subscriptions(trial_end_date);
CREATE INDEX idx_subscriptions_deleted ON subscriptions(deleted_at);
```

### Query Optimization
- Use `SELECT` específico (não `SELECT *`)
- Pagination para listagem de subscriptions (limite 50 por página)
- Eager loading de relacionamentos necessários

---

## Security Considerations

### API Security
- Rate limiting: 100 req/min por IP (via @fastify/rate-limit)
- JWT validation em todas as rotas de subscription
- CORS configurado para domínios permitidos
- Helmet para security headers

### Data Security
- Dados de cartão NUNCA armazenados (apenas no Asaas)
- API keys do Asaas em variáveis de ambiente
- Webhook signature validation (HMAC)
- SSL/TLS obrigatório em produção

### User Authorization
- Apenas admin/owner da company pode cancelar subscription
- Apenas usuários autenticados podem iniciar trial
- Verificar ownership antes de qualquer operação em subscription

---

## Monitoring & Observability

### Metrics to Track
- Trial conversion rate (trials iniciados → pagantes)
- Churn rate (cancelamentos / total ativos)
- Average revenue per user (ARPU)
- Trial duration average
- Payment success/failure rate

### Logging
```typescript
// Pino logger (já configurado no projeto)
logger.info({ subscriptionId, companyId }, 'Trial activated');
logger.warn({ subscriptionId, reason }, 'Payment failed');
logger.error({ error, subscriptionId }, 'Webhook processing failed');
```

### Alerts
- Payment failure rate > 10%
- Webhook processing failures
- Trial expiration job failures
- Session limit reached frequentemente (pode indicar upgrade needed)

---

## Next Steps

✅ **Phase 0 Complete** - All research topics resolved
→ **Phase 1**: Generate design artifacts (data-model.md, contracts/, quickstart.md)

**All NEEDS CLARIFICATION items resolved:**
- Payment gateway: Asaas
- State management: Enum-based with transitions
- Trial expiration: Cron + Webhooks
- Session limiting: Redis tracking
- Notifications: Email + In-app
- Responsive: Mobile-first with Tailwind
- Data retention: 30 days soft delete
