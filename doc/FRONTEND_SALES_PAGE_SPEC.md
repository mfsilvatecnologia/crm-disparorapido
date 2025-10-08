# 📄 Especificação: Página de Vendas - Sistema de Assinaturas

**Destinatário:** Equipe Frontend
**Data:** 04/10/2025
**Versão:** 1.0
**Status:** ✅ API Completa e Pronta para Integração

---

## 🎯 Objetivo

Criar uma página de vendas que permita aos clientes:
1. Visualizar planos disponíveis
2. Escolher um produto/plano
3. Aproveitar período de trial gratuito
4. Assinar com cobrança recorrente via Asaas

---

## 📋 Índice

1. [Fluxo de Usuário](#-fluxo-de-usuário)
2. [API Endpoints Disponíveis](#-api-endpoints-disponíveis)
3. [Modelos de Dados](#-modelos-de-dados)
4. [Componentes Sugeridos](#-componentes-sugeridos)
5. [Páginas e Layouts](#-páginas-e-layouts)
6. [Validações e Regras de Negócio](#-validações-e-regras-de-negócio)
7. [Estados e Feedback](#-estados-e-feedback)
8. [Casos de Uso Detalhados](#-casos-de-uso-detalhados)
9. [Exemplos de Requisições](#-exemplos-de-requisições)
10. [Design System e UI/UX](#-design-system-e-uiux)

---

## 🚀 Fluxo de Usuário

### Jornada Completa do Cliente

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. LANDING PAGE / PRICING                                        │
│    ↓ Cliente visualiza planos disponíveis                       │
│    ↓ Compara features e preços                                  │
│    ↓ Vê badge "7 DIAS GRÁTIS"                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. SELEÇÃO DO PLANO                                             │
│    ↓ Cliente clica em "Começar Trial Grátis"                   │
│    ↓ Sistema verifica se usuário está autenticado              │
│    ↓ Se não: redireciona para login/cadastro                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. CHECKOUT / CONFIRMAÇÃO                                       │
│    ↓ Resume do plano escolhido                                  │
│    ↓ Destaque: "Teste GRÁTIS por 7 dias"                       │
│    ↓ Informação: "Após trial: R$ 99,90/mês"                    │
│    ↓ Termos de uso e política de cancelamento                  │
│    ↓ Botão: "Iniciar Trial Gratuito"                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. PROCESSAMENTO                                                │
│    ↓ Loading state com mensagem amigável                       │
│    ↓ Backend cria customer no Asaas                            │
│    ↓ Backend cria subscription com trial                       │
│    ↓ Backend retorna dados da assinatura                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. CONFIRMAÇÃO DE SUCESSO                                       │
│    ✅ "Trial ativado com sucesso!"                              │
│    📅 "Seu trial expira em: 11/10/2025"                         │
│    💳 "Primeira cobrança em: 11/10/2025"                        │
│    🎯 Botão: "Começar a usar agora"                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. DASHBOARD DO USUÁRIO                                         │
│    ↓ Badge: "Trial - 7 dias restantes"                         │
│    ↓ Link: "Ver detalhes da assinatura"                        │
│    ↓ Acesso total às funcionalidades                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Endpoints Disponíveis

### Base URL
```
Desenvolvimento: http://localhost:3000/api/v1
Produção: https://api.leadsrapido.com/api/v1
```

### Autenticação
Todas as requisições (exceto webhooks) requerem token JWT no header:
```http
Authorization: Bearer {jwt_token}
```

---

### 1️⃣ **Listar Produtos Disponíveis**

**Endpoint:** `GET /produtos`

**Descrição:** Retorna todos os produtos/planos disponíveis para venda.

**Query Parameters:**
- `categoria` (opcional): `extensao_chrome` | `crm_saas` | `marketplace_leads`
- `status` (opcional): `ativo` | `inativo`

**Request:**
```http
GET /api/v1/produtos?categoria=crm_saas&status=ativo
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod-uuid-123",
      "nome": "Plano Starter",
      "descricao": "Ideal para começar com até 2 usuários simultâneos",
      "asaasProductId": "asaas-prod-123",
      "categoria": "crm_saas",
      "tipoCobranca": "mensal",
      "periodoValidade": 30,
      "preco": 49.90,
      "precoFormatado": "R$ 49,90",
      "funcionalidades": [
        "Até 2 usuários simultâneos",
        "1.000 leads por mês",
        "Suporte por email",
        "Dashboard básico"
      ],
      "maxWebSessions": 2,
      "maxExtensionSessions": 2,
      "metadata": {
        "trialDays": 7,
        "mostPopular": false,
        "recommended": false
      },
      "status": "ativo",
      "createdAt": "2025-10-01T00:00:00.000Z",
      "updatedAt": "2025-10-01T00:00:00.000Z"
    },
    {
      "id": "prod-uuid-456",
      "nome": "Plano Pro",
      "descricao": "Para equipes que precisam de mais poder",
      "categoria": "crm_saas",
      "tipoCobranca": "mensal",
      "preco": 99.90,
      "precoFormatado": "R$ 99,90",
      "funcionalidades": [
        "Até 5 usuários simultâneos",
        "5.000 leads por mês",
        "Suporte prioritário",
        "Dashboard avançado",
        "API Access",
        "Integrações premium"
      ],
      "maxWebSessions": 5,
      "maxExtensionSessions": 5,
      "metadata": {
        "trialDays": 7,
        "mostPopular": true,
        "recommended": true,
        "savings": "Economize 20% no plano anual"
      },
      "status": "ativo"
    },
    {
      "id": "prod-uuid-789",
      "nome": "Plano Business",
      "descricao": "Solução completa para empresas",
      "categoria": "crm_saas",
      "tipoCobranca": "mensal",
      "preco": 199.90,
      "precoFormatado": "R$ 199,90",
      "funcionalidades": [
        "Até 10 usuários simultâneos",
        "Leads ilimitados",
        "Suporte 24/7",
        "Dashboard personalizado",
        "API ilimitada",
        "Todas as integrações",
        "Account manager dedicado"
      ],
      "maxWebSessions": 10,
      "maxExtensionSessions": 10,
      "metadata": {
        "trialDays": 14,
        "mostPopular": false,
        "recommended": false,
        "enterprise": true
      },
      "status": "ativo"
    }
  ]
}
```

---

### 2️⃣ **Criar Assinatura (Iniciar Trial)**

**Endpoint:** `POST /subscriptions`

**Descrição:** Cria uma nova assinatura com período de trial.

**Request Body:**
```json
{
  "empresaId": "empresa-uuid",       // ID da empresa do usuário logado
  "produtoId": "prod-uuid-456",       // ID do produto escolhido
  "billingCycle": "MONTHLY",          // WEEKLY | BIWEEKLY | MONTHLY | QUARTERLY | SEMIANNUALLY | YEARLY
  "value": 99.90,                     // Valor do plano
  "hasTrial": true,                   // Ativar trial?
  "trialDays": 7,                     // Dias de trial (obrigatório se hasTrial=true)
  "description": "Assinatura Plano Pro",
  "externalReference": "WEB-CHECKOUT-001"  // Opcional: referência do seu sistema
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "sub-uuid-abc",
    "empresaId": "empresa-uuid",
    "produtoId": "prod-uuid-456",
    "asaasSubscriptionId": "sub_asaas_xyz",
    "asaasCustomerId": "cus_asaas_123",
    "status": "trialing",               // Status atual
    "billingCycle": "MONTHLY",
    "billingCycleDescription": "Mensal",
    "value": 99.90,
    "valueFormatted": "R$ 99,90",

    // Trial Information
    "hasTrial": true,
    "trialDays": 7,
    "trialEndDate": "2025-10-11T23:59:59.999Z",
    "isInTrial": true,

    // Payment Information
    "nextDueDate": "2025-10-11T00:00:00.000Z",   // Primeira cobrança
    "firstPaymentDate": null,                     // Ainda não houve pagamento
    "lastPaymentDate": null,
    "maxPayments": null,                          // null = recorrente ilimitado
    "paymentsCount": 0,
    "remainingPayments": null,                    // null = ilimitado

    "description": "Assinatura Plano Pro",
    "externalReference": "WEB-CHECKOUT-001",
    "metadata": {},

    // Dates
    "startDate": "2025-10-04T00:00:00.000Z",
    "endDate": null,
    "canceledAt": null,
    "suspendedAt": null,
    "createdAt": "2025-10-04T12:30:00.000Z",
    "updatedAt": "2025-10-04T12:30:00.000Z"
  }
}
```

**Response (400) - Erro:**
```json
{
  "success": false,
  "error": "Produto não encontrado"
}
```

**Possíveis Erros:**
- `400` - Dados inválidos
- `401` - Não autenticado
- `404` - Produto não encontrado
- `500` - Erro interno do servidor

---

### 3️⃣ **Listar Assinaturas do Usuário**

**Endpoint:** `GET /subscriptions`

**Descrição:** Lista assinaturas com filtros.

**Query Parameters:**
- `empresaId` (opcional): Filtrar por empresa
- `produtoId` (opcional): Filtrar por produto
- `status` (opcional): `active` | `trialing` | `past_due` | `canceled` | `suspended` | `expired`
- `limit` (opcional, padrão: 10): Quantidade de resultados
- `offset` (opcional, padrão: 0): Paginação

**Request:**
```http
GET /api/v1/subscriptions?empresaId=empresa-uuid&status=trialing&limit=10
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "sub-uuid-abc",
      "status": "trialing",
      "isInTrial": true,
      "trialEndDate": "2025-10-11T23:59:59.999Z",
      "value": 99.90,
      "billingCycle": "MONTHLY",
      // ... outros campos
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

---

### 4️⃣ **Buscar Assinatura por ID**

**Endpoint:** `GET /subscriptions/{id}`

**Request:**
```http
GET /api/v1/subscriptions/sub-uuid-abc
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "sub-uuid-abc",
    // ... todos os campos da assinatura
  }
}
```

---

### 5️⃣ **Cancelar Assinatura**

**Endpoint:** `POST /subscriptions/{id}/cancel`

**Request:**
```http
POST /api/v1/subscriptions/sub-uuid-abc/cancel
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Não atendeu minhas expectativas"  // Opcional
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "sub-uuid-abc",
    "status": "canceled",
    "canceledAt": "2025-10-04T12:45:00.000Z",
    // ... outros campos
  },
  "message": "Assinatura cancelada com sucesso"
}
```

---

## 📊 Modelos de Dados

### Produto (Product)

```typescript
interface Produto {
  id: string;
  nome: string;
  descricao: string;
  asaasProductId: string;
  categoria: 'extensao_chrome' | 'crm_saas' | 'marketplace_leads';
  tipoCobranca: 'mensal' | 'anual' | 'unico';
  periodoValidade: number | null;    // dias
  preco: number;                      // BRL
  precoFormatado: string;             // "R$ 99,90"
  funcionalidades: string[];
  maxWebSessions: number;
  maxExtensionSessions: number;
  metadata: {
    trialDays?: number;
    mostPopular?: boolean;
    recommended?: boolean;
    savings?: string;
    [key: string]: any;
  };
  status: 'ativo' | 'inativo';
  createdAt: string;
  updatedAt: string;
}
```

### Assinatura (Subscription)

```typescript
interface Subscription {
  id: string;
  empresaId: string;
  produtoId: string;
  asaasSubscriptionId: string;
  asaasCustomerId: string;

  // Status
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'suspended' | 'expired';

  // Billing
  billingCycle: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY';
  billingCycleDescription: string;
  value: number;
  valueFormatted: string;

  // Trial
  hasTrial: boolean;
  trialDays: number | null;
  trialEndDate: string | null;      // ISO 8601
  isInTrial: boolean;

  // Payment
  nextDueDate: string;               // ISO 8601
  firstPaymentDate: string | null;
  lastPaymentDate: string | null;
  maxPayments: number | null;        // null = unlimited
  paymentsCount: number;
  remainingPayments: number | null;

  // Metadata
  description: string | null;
  externalReference: string | null;
  metadata: Record<string, any>;

  // Dates
  startDate: string;
  endDate: string | null;
  canceledAt: string | null;
  suspendedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🎨 Componentes Sugeridos

### 1. PricingCard

Componente para exibir cada plano na página de pricing.

```tsx
interface PricingCardProps {
  produto: Produto;
  isPopular?: boolean;
  isRecommended?: boolean;
  onSelect: (produtoId: string) => void;
}

<PricingCard
  produto={planoPro}
  isPopular={true}
  onSelect={handleSelectPlan}
/>
```

**Layout sugerido:**
```
┌────────────────────────────────┐
│ [BADGE: MAIS POPULAR]          │
│                                │
│ Plano Pro                      │
│ R$ 99,90/mês                   │
│                                │
│ ✓ Até 5 usuários simultâneos   │
│ ✓ 5.000 leads por mês          │
│ ✓ Suporte prioritário          │
│ ✓ Dashboard avançado           │
│                                │
│ [7 DIAS GRÁTIS]                │
│ [Começar Trial]                │
└────────────────────────────────┘
```

---

### 2. TrialBanner

Banner destacando o trial gratuito.

```tsx
<TrialBanner
  trialDays={7}
  price={99.90}
  billingCycle="mensal"
/>
```

**Output:**
```
┌─────────────────────────────────────────┐
│ 🎉 Experimente GRÁTIS por 7 dias!      │
│ Após o trial: R$ 99,90/mês             │
│ Cancele quando quiser                   │
└─────────────────────────────────────────┘
```

---

### 3. CheckoutSummary

Resumo do plano escolhido antes de confirmar.

```tsx
<CheckoutSummary
  produto={selectedPlan}
  subscription={subscriptionData}
  onConfirm={handleConfirm}
  onCancel={handleCancel}
/>
```

**Layout:**
```
┌────────────────────────────────┐
│ Resumo da Assinatura           │
│                                │
│ Plano: Pro                     │
│ Valor: R$ 99,90/mês            │
│                                │
│ 🎁 Trial Gratuito              │
│ ├─ Início: 04/10/2025          │
│ └─ Término: 11/10/2025         │
│                                │
│ 💳 Primeira Cobrança           │
│ └─ Data: 11/10/2025            │
│                                │
│ [Cancelar] [Confirmar Trial]  │
└────────────────────────────────┘
```

---

### 4. SubscriptionStatus

Widget para mostrar status da assinatura no dashboard.

```tsx
<SubscriptionStatus
  subscription={currentSubscription}
  onManage={handleManageSubscription}
/>
```

**Exemplo - Em Trial:**
```
┌────────────────────────────────┐
│ 🔥 Trial Ativo                 │
│ 7 dias restantes               │
│ Expira em: 11/10/2025          │
│                                │
│ [Gerenciar Assinatura]         │
└────────────────────────────────┘
```

**Exemplo - Ativa:**
```
┌────────────────────────────────┐
│ ✅ Assinatura Ativa            │
│ Plano Pro - R$ 99,90/mês       │
│ Próximo pagamento: 11/11/2025  │
│                                │
│ [Gerenciar Assinatura]         │
└────────────────────────────────┘
```

---

### 5. SubscriptionManager

Página completa para gerenciar assinatura.

```tsx
<SubscriptionManager
  subscription={subscription}
  onCancel={handleCancelSubscription}
  onUpgrade={handleUpgradePlan}
/>
```

---

## 📄 Páginas e Layouts

### Página 1: Pricing (/pricing)

**Objetivo:** Mostrar todos os planos disponíveis e permitir seleção.

**Seções:**
1. Hero com call-to-action
2. Grid de cards de planos (PricingCard)
3. Comparação de features
4. FAQ
5. Depoimentos
6. CTA final

**Dados necessários:**
- `GET /produtos?categoria=crm_saas&status=ativo`

---

### Página 2: Checkout (/checkout)

**Objetivo:** Confirmar escolha e iniciar trial.

**Fluxo:**
1. Usuário chega vindo do `/pricing` com `?produtoId=xxx`
2. Buscar produto: `GET /produtos/{id}` (se necessário)
3. Mostrar CheckoutSummary
4. Ao confirmar: `POST /subscriptions`
5. Redirecionar para `/checkout/success`

**Estados:**
- Loading: Criando assinatura...
- Success: Trial ativado!
- Error: Erro ao processar

---

### Página 3: Checkout Success (/checkout/success)

**Objetivo:** Confirmar sucesso e direcionar usuário.

**Conteúdo:**
- ✅ Mensagem de sucesso
- 📅 Datas importantes (trial end, first payment)
- 🎯 Próximos passos
- Botão: "Começar a usar agora" → `/dashboard`

---

### Página 4: Subscription Management (/account/subscription)

**Objetivo:** Gerenciar assinatura ativa.

**Dados:**
- `GET /subscriptions?empresaId={id}&status=active`

**Ações:**
- Ver detalhes
- Cancelar assinatura
- Atualizar forma de pagamento (futuro)
- Fazer upgrade/downgrade (futuro)

---

## ✅ Validações e Regras de Negócio

### Validações Frontend

```typescript
// Ao criar assinatura
const validateSubscriptionRequest = (data: CreateSubscriptionRequest) => {
  const errors: string[] = [];

  if (!data.produtoId) {
    errors.push('Selecione um plano');
  }

  if (data.hasTrial && (!data.trialDays || data.trialDays <= 0)) {
    errors.push('Trial deve ter pelo menos 1 dia');
  }

  if (data.value <= 0) {
    errors.push('Valor inválido');
  }

  if (!['WEEKLY', 'MONTHLY', 'YEARLY'].includes(data.billingCycle)) {
    errors.push('Ciclo de cobrança inválido');
  }

  return errors;
};
```

### Regras de Trial

1. **Trial é opcional** - Produto pode ter trial ou não (verificar `metadata.trialDays`)
2. **Trial só uma vez** - Verificar se empresa já teve trial deste produto
3. **Trial automático** - Status inicial sempre `trialing` se `hasTrial=true`
4. **Primeira cobrança** - Ocorre em `trialEndDate + 1 dia`

### Regras de Status

```typescript
const getStatusBadge = (status: SubscriptionStatus) => {
  switch (status) {
    case 'trialing':
      return { color: 'blue', text: 'Trial Ativo', icon: '🔥' };
    case 'active':
      return { color: 'green', text: 'Ativa', icon: '✅' };
    case 'past_due':
      return { color: 'orange', text: 'Pagamento Pendente', icon: '⚠️' };
    case 'canceled':
      return { color: 'red', text: 'Cancelada', icon: '❌' };
    case 'suspended':
      return { color: 'red', text: 'Suspensa', icon: '🚫' };
    case 'expired':
      return { color: 'gray', text: 'Expirada', icon: '📅' };
  }
};
```

---

## 🎭 Estados e Feedback

### Loading States

```tsx
// Durante criação de assinatura
<LoadingState>
  <Spinner />
  <Text>Ativando seu trial gratuito...</Text>
  <Text secondary>Isso pode levar alguns segundos</Text>
</LoadingState>
```

### Success States

```tsx
<SuccessState>
  <Icon>✅</Icon>
  <Title>Trial Ativado com Sucesso!</Title>
  <Message>
    Seu período de teste de 7 dias começou agora.
    Aproveite todas as funcionalidades do Plano Pro!
  </Message>
  <Details>
    <Item>Expira em: {trialEndDate}</Item>
    <Item>Primeira cobrança: {nextDueDate}</Item>
  </Details>
  <Button>Começar Agora</Button>
</SuccessState>
```

### Error States

```tsx
<ErrorState>
  <Icon>⚠️</Icon>
  <Title>Não foi possível processar sua assinatura</Title>
  <Message>{error.message}</Message>
  <Actions>
    <Button variant="secondary" onClick={handleRetry}>
      Tentar Novamente
    </Button>
    <Button variant="link" onClick={handleSupport}>
      Falar com Suporte
    </Button>
  </Actions>
</ErrorState>
```

---

## 💼 Casos de Uso Detalhados

### Caso 1: Cliente escolhe plano com trial

**Ator:** Cliente potencial
**Pré-condição:** Cliente não possui assinatura ativa

**Fluxo Principal:**
1. Cliente acessa `/pricing`
2. Visualiza cards dos planos com badge "7 DIAS GRÁTIS"
3. Clica em "Começar Trial" do Plano Pro
4. Sistema verifica autenticação
   - Se não autenticado: redireciona para `/login?redirect=/checkout?produtoId=xxx`
   - Se autenticado: redireciona para `/checkout?produtoId=xxx`
5. Página de checkout exibe resumo do plano
6. Cliente confirma clicando em "Iniciar Trial Gratuito"
7. Sistema envia `POST /subscriptions` com:
   ```json
   {
     "empresaId": "empresa-do-usuario-logado",
     "produtoId": "plano-pro-uuid",
     "billingCycle": "MONTHLY",
     "value": 99.90,
     "hasTrial": true,
     "trialDays": 7
   }
   ```
8. Backend cria subscription no banco e no Asaas
9. Frontend recebe resposta com subscription criada
10. Redireciona para `/checkout/success`
11. Mostra confirmação com datas importantes
12. Cliente clica "Começar a usar" → vai para `/dashboard`

**Fluxo Alternativo - Erro:**
- Se API retornar erro 400: Mostrar mensagem específica
- Se API retornar erro 500: Mostrar "Erro no servidor, tente novamente"
- Permitir retry ou contato com suporte

---

### Caso 2: Cliente visualiza status do trial

**Ator:** Cliente com trial ativo
**Pré-condição:** Cliente possui subscription com `status=trialing`

**Fluxo:**
1. Cliente faz login
2. Sistema busca assinatura ativa: `GET /subscriptions?empresaId={id}&status=trialing`
3. Dashboard exibe widget SubscriptionStatus
4. Widget mostra:
   - Badge "Trial Ativo 🔥"
   - Dias restantes (calculado: `trialEndDate - hoje`)
   - Data de expiração do trial
   - Link "Ver detalhes da assinatura"

**Cálculo de dias restantes:**
```typescript
const calculateRemainingDays = (trialEndDate: string): number => {
  const end = new Date(trialEndDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
};
```

---

### Caso 3: Cliente cancela assinatura

**Ator:** Cliente com assinatura ativa ou em trial
**Pré-condição:** Subscription não está cancelada

**Fluxo:**
1. Cliente acessa `/account/subscription`
2. Sistema busca: `GET /subscriptions?empresaId={id}`
3. Página exibe detalhes da assinatura
4. Cliente clica "Cancelar Assinatura"
5. Sistema exibe modal de confirmação:
   ```
   ⚠️ Tem certeza que deseja cancelar?

   Ao cancelar:
   - Você perderá acesso às funcionalidades premium
   - Seus dados serão mantidos por 30 dias
   - Você pode reativar a qualquer momento

   Motivo do cancelamento: [input opcional]

   [Não, manter assinatura]  [Sim, cancelar]
   ```
6. Se confirmar, envia: `POST /subscriptions/{id}/cancel` com `{ reason }`
7. Backend cancela no banco e no Asaas
8. Frontend recebe confirmação
9. Atualiza UI para mostrar status "Cancelada"
10. Exibe mensagem de sucesso

---

## 📝 Exemplos de Requisições

### Setup do Cliente HTTP

```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

### Função: Buscar Produtos

```typescript
// services/productService.ts
import api from './api';
import { Produto } from '../types/subscription';

export const fetchProducts = async (
  categoria?: string
): Promise<Produto[]> => {
  try {
    const params = new URLSearchParams();
    if (categoria) params.append('categoria', categoria);
    params.append('status', 'ativo');

    const response = await api.get(`/produtos?${params.toString()}`);

    if (!response.data.success) {
      throw new Error('Erro ao buscar produtos');
    }

    return response.data.data;
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    throw error;
  }
};

// Uso no componente
const PricingPage = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts('crm_saas');
        setProdutos(data);
      } catch (err) {
        setError('Erro ao carregar planos. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      {produtos.map(produto => (
        <PricingCard key={produto.id} produto={produto} />
      ))}
    </div>
  );
};
```

---

### Função: Criar Assinatura

```typescript
// services/subscriptionService.ts
import api from './api';
import { Subscription } from '../types/subscription';

interface CreateSubscriptionRequest {
  empresaId: string;
  produtoId: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  value: number;
  hasTrial?: boolean;
  trialDays?: number;
  description?: string;
}

export const createSubscription = async (
  data: CreateSubscriptionRequest
): Promise<Subscription> => {
  try {
    const response = await api.post('/subscriptions', data);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro ao criar assinatura');
    }

    return response.data.data;
  } catch (error: any) {
    // Tratamento de erros específicos
    if (error.response?.status === 404) {
      throw new Error('Produto não encontrado');
    }
    if (error.response?.status === 401) {
      throw new Error('Você precisa estar autenticado');
    }
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Erro ao processar sua assinatura. Tente novamente.');
  }
};

// Uso no componente
const CheckoutPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth(); // Hook customizado
  const { produtoId } = useParams();

  const handleConfirmTrial = async (produto: Produto) => {
    try {
      setLoading(true);
      setError(null);

      const subscription = await createSubscription({
        empresaId: user.empresaId,
        produtoId: produto.id,
        billingCycle: 'MONTHLY',
        value: produto.preco,
        hasTrial: true,
        trialDays: produto.metadata.trialDays || 7,
        description: `Assinatura ${produto.nome}`
      });

      // Salvar no context ou state global
      setCurrentSubscription(subscription);

      // Redirecionar para success
      navigate('/checkout/success', {
        state: { subscription }
      });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CheckoutSummary
      produto={selectedProduct}
      onConfirm={handleConfirmTrial}
      loading={loading}
      error={error}
    />
  );
};
```

---

### Função: Buscar Assinaturas

```typescript
// services/subscriptionService.ts
export const fetchSubscriptions = async (
  filters: {
    empresaId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ data: Subscription[]; total: number }> => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });

    const response = await api.get(`/subscriptions?${params.toString()}`);

    if (!response.data.success) {
      throw new Error('Erro ao buscar assinaturas');
    }

    return {
      data: response.data.data,
      total: response.data.total
    };
  } catch (error) {
    console.error('Erro ao buscar assinaturas:', error);
    throw error;
  }
};

// Uso
const SubscriptionManager = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    const loadSubscriptions = async () => {
      const result = await fetchSubscriptions({
        empresaId: user.empresaId,
        status: 'active'
      });
      setSubscriptions(result.data);
    };

    loadSubscriptions();
  }, [user.empresaId]);

  return (
    <div>
      {subscriptions.map(sub => (
        <SubscriptionCard key={sub.id} subscription={sub} />
      ))}
    </div>
  );
};
```

---

### Função: Cancelar Assinatura

```typescript
// services/subscriptionService.ts
export const cancelSubscription = async (
  subscriptionId: string,
  reason?: string
): Promise<Subscription> => {
  try {
    const response = await api.post(
      `/subscriptions/${subscriptionId}/cancel`,
      { reason }
    );

    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro ao cancelar assinatura');
    }

    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Erro ao cancelar assinatura. Tente novamente.');
  }
};

// Uso com modal de confirmação
const CancelSubscriptionModal = ({ subscription, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    try {
      setLoading(true);
      const updated = await cancelSubscription(subscription.id, reason);
      onSuccess(updated);
      toast.success('Assinatura cancelada com sucesso');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal>
      <h2>Cancelar Assinatura</h2>
      <textarea
        placeholder="Motivo do cancelamento (opcional)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <button onClick={handleCancel} disabled={loading}>
        {loading ? 'Cancelando...' : 'Confirmar Cancelamento'}
      </button>
    </Modal>
  );
};
```

---

## 🎨 Design System e UI/UX

### Paleta de Cores para Status

```css
/* Trial Ativo */
.status-trialing {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* Assinatura Ativa */
.status-active {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

/* Pagamento Atrasado */
.status-past_due {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

/* Cancelada */
.status-canceled {
  background: #e0e0e0;
  color: #666;
}
```

### Tipografia

```css
/* Preços */
.price {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
}

.price-currency {
  font-size: 24px;
  vertical-align: super;
}

.price-period {
  font-size: 16px;
  font-weight: 400;
  color: #666;
}

/* Exemplo: R$ 99,90/mês */
```

### Ícones Sugeridos

Use biblioteca como **Lucide React** ou **Heroicons**:

```tsx
import {
  Check,        // Features incluídas
  X,            // Features não incluídas
  Zap,          // Trial ativo
  CreditCard,   // Pagamento
  Calendar,     // Datas
  AlertCircle,  // Avisos
  CheckCircle   // Confirmações
} from 'lucide-react';
```

### Animações

```css
/* Hover em card de plano */
.pricing-card {
  transition: all 0.3s ease;
}

.pricing-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* Loading spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
}

/* Success checkmark */
@keyframes checkmark {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.success-icon {
  animation: checkmark 0.5s ease;
}
```

---

## 🔔 Notificações e Emails

### Eventos que devem disparar notificações:

1. **Trial Iniciado**
   - Email de boas-vindas
   - Instruções de como começar
   - Lembrete da data de expiração

2. **Trial Expirando (3 dias antes)**
   - Email de lembrete
   - CTA para adicionar forma de pagamento

3. **Trial Expirado / Primeira Cobrança**
   - Email confirmando cobrança
   - Recibo de pagamento

4. **Pagamento Confirmado**
   - Notificação in-app
   - Email de confirmação

5. **Pagamento Atrasado**
   - Notificação urgente
   - Email com instruções

6. **Assinatura Cancelada**
   - Email de confirmação
   - Pesquisa de feedback (opcional)

**Nota:** A lógica de envio de emails ficará no backend via webhooks do Asaas.

---

## 📱 Responsividade

### Breakpoints Sugeridos

```css
/* Mobile first */
.pricing-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

/* Tablet */
@media (min-width: 768px) {
  .pricing-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .pricing-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Mobile Considerations

- Sticky CTA button no mobile
- Cards empilhados verticalmente
- Comparação de features em accordion
- Checkout em múltiplos steps

---

## 🧪 Testes Sugeridos

### Testes de Integração

```typescript
describe('Subscription Flow', () => {
  it('should create subscription with trial', async () => {
    const produto = await fetchProducts();
    const subscription = await createSubscription({
      empresaId: 'test-empresa',
      produtoId: produto[0].id,
      billingCycle: 'MONTHLY',
      value: produto[0].preco,
      hasTrial: true,
      trialDays: 7
    });

    expect(subscription.status).toBe('trialing');
    expect(subscription.hasTrial).toBe(true);
    expect(subscription.isInTrial).toBe(true);
  });

  it('should list active subscriptions', async () => {
    const result = await fetchSubscriptions({
      empresaId: 'test-empresa',
      status: 'active'
    });

    expect(result.data).toBeInstanceOf(Array);
    expect(result.total).toBeGreaterThanOrEqual(0);
  });

  it('should cancel subscription', async () => {
    const subscription = await cancelSubscription(
      'sub-test-id',
      'Test cancellation'
    );

    expect(subscription.status).toBe('canceled');
    expect(subscription.canceledAt).toBeTruthy();
  });
});
```

---

## 🔐 Segurança

### Proteção de Rotas

```typescript
// ProtectedRoute.tsx
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Uso
<Route path="/checkout" element={
  <ProtectedRoute>
    <CheckoutPage />
  </ProtectedRoute>
} />
```

### Validação de Token

```typescript
// Interceptor para refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado, tentar refresh
      try {
        const newToken = await refreshAuthToken();
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return api.request(error.config);
      } catch {
        // Redirect para login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 📊 Analytics e Tracking

### Eventos para rastrear:

```typescript
// services/analytics.ts
export const trackEvent = (event: string, data?: any) => {
  // Google Analytics 4
  gtag('event', event, data);

  // Ou seu provider preferido
};

// Eventos importantes
trackEvent('view_pricing_page');
trackEvent('select_plan', { planId, planName, price });
trackEvent('start_checkout', { planId });
trackEvent('trial_started', { subscriptionId, trialDays });
trackEvent('subscription_created', { subscriptionId, value });
trackEvent('subscription_canceled', { subscriptionId, reason });
```

---

## 📞 Suporte e Ajuda

### Informações para o time de Frontend

**Backend Developer:** João Silva (joao@leadsrapido.com)
**API Documentation:** http://localhost:3000/api-docs (Swagger)
**Postman Collection:** [Link será fornecido]
**Ambiente de Desenvolvimento:**
- API: http://localhost:3000
- Banco: PostgreSQL via Supabase
- Asaas: Modo Sandbox

**Como reportar bugs:**
1. Abrir issue no GitHub com tag `bug` e `frontend-integration`
2. Incluir: endpoint, payload, response, erro esperado vs recebido
3. Mencionar @backend-team

---

## 🚀 Próximos Passos

### Fase 1 (Atual)
- ✅ API de produtos
- ✅ API de assinaturas
- ✅ Webhooks Asaas
- ✅ Trial gratuito

### Fase 2 (Futuro)
- [ ] Upgrade/Downgrade de planos
- [ ] Múltiplas formas de pagamento
- [ ] Cupons de desconto
- [ ] Planos anuais com desconto
- [ ] Histórico de pagamentos

### Fase 3 (Futuro)
- [ ] Billing dashboard completo
- [ ] Notas fiscais automáticas
- [ ] Métricas de assinaturas
- [ ] Churn analysis

---

## 📚 Recursos Adicionais

- [Documentação Asaas](https://docs.asaas.com/)
- [Guia de Integração Backend](contract-first/subscriptions/README.md)
- [Testes HTTP](contract-first/subscriptions/test-subscriptions.http)
- [Swagger API](http://localhost:3000/api-docs)

---

## ✅ Checklist Final

Antes de começar a implementação, confirme:

- [ ] Acesso à API de desenvolvimento configurado
- [ ] Token JWT de teste disponível
- [ ] Entendimento do fluxo de trial
- [ ] Design system alinhado
- [ ] Componentes principais identificados
- [ ] Gerenciamento de estado definido (Context/Redux/Zustand)
- [ ] Tratamento de erros planejado
- [ ] Responsividade considerada
- [ ] Testes de integração planejados

---

**Dúvidas?** Entre em contato com o time de backend! 🚀

**Boa implementação!** 💪
