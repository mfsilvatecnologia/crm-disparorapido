# 🚀 Quick Start: Página de Vendas - Frontend

**TL;DR:** API pronta para criar página de vendas com trial gratuito e cobrança recorrente via Asaas.

---

## 📋 Resumo Executivo

Implementamos um sistema completo de **assinaturas com trial gratuito** integrado ao Asaas. A API está pronta e documentada para você criar a interface de vendas.

### O que você precisa fazer:

1. **Página de Pricing** - Mostrar planos disponíveis
2. **Fluxo de Checkout** - Cliente escolhe plano e inicia trial
3. **Confirmação de Sucesso** - Feedback após ativação
4. **Gerenciamento** - Dashboard para gerenciar assinatura

---

## 🔌 Endpoints Principais

### Base URL
```
Development: http://localhost:3000/api/v1
Production: https://api.leadsrapido.com/api/v1
```

### 1. Listar Planos

```http
GET /produtos?categoria=crm_saas&status=ativo
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nome": "Plano Pro",
      "preco": 99.90,
      "precoFormatado": "R$ 99,90",
      "funcionalidades": ["5 usuários", "5k leads/mês", "..."],
      "metadata": { "trialDays": 7, "mostPopular": true }
    }
  ]
}
```

---

### 2. Criar Assinatura (Iniciar Trial)

```http
POST /subscriptions
Authorization: Bearer {token}
Content-Type: application/json

{
  "empresaId": "uuid-da-empresa",
  "produtoId": "uuid-do-plano",
  "billingCycle": "MONTHLY",
  "value": 99.90,
  "hasTrial": true,
  "trialDays": 7
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "sub-uuid",
    "status": "trialing",
    "trialEndDate": "2025-10-11T23:59:59.999Z",
    "nextDueDate": "2025-10-11T00:00:00.000Z",
    "isInTrial": true,
    "value": 99.90
  }
}
```

---

### 3. Listar Assinaturas

```http
GET /subscriptions?empresaId={id}&status=active
Authorization: Bearer {token}
```

---

### 4. Cancelar Assinatura

```http
POST /subscriptions/{id}/cancel
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Motivo do cancelamento"
}
```

---

## 🎯 Fluxo Simplificado

```
1. GET /produtos → Exibe cards de planos
2. User clica "Começar Trial"
3. POST /subscriptions → Cria assinatura
4. Redireciona para /success
5. User começa a usar com trial ativo
```

---

## 💻 Exemplo de Código

### React Hook para criar assinatura

```typescript
import { useState } from 'react';
import api from './api';

export const useCreateSubscription = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSubscription = async (data: {
    empresaId: string;
    produtoId: string;
    billingCycle: 'MONTHLY' | 'YEARLY';
    value: number;
    hasTrial?: boolean;
    trialDays?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/subscriptions', data);

      if (!response.data.success) {
        throw new Error(response.data.error);
      }

      return response.data.data;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erro ao criar assinatura';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return { createSubscription, loading, error };
};

// USO:
const CheckoutPage = () => {
  const { createSubscription, loading, error } = useCreateSubscription();
  const { user } = useAuth();

  const handleStartTrial = async (produto: Produto) => {
    try {
      const subscription = await createSubscription({
        empresaId: user.empresaId,
        produtoId: produto.id,
        billingCycle: 'MONTHLY',
        value: produto.preco,
        hasTrial: true,
        trialDays: 7
      });

      // Sucesso! Redirecionar
      navigate('/checkout/success', { state: { subscription } });
    } catch (err) {
      // Error já está no state
      console.error(err);
    }
  };

  return (
    <div>
      {loading && <LoadingSpinner />}
      {error && <ErrorAlert message={error} />}
      <button onClick={() => handleStartTrial(selectedProduct)}>
        Iniciar Trial Gratuito
      </button>
    </div>
  );
};
```

---

## 🎨 Componentes Sugeridos

### PricingCard

```tsx
interface PricingCardProps {
  produto: Produto;
  onSelect: (produtoId: string) => void;
}

const PricingCard = ({ produto, onSelect }: PricingCardProps) => {
  const isPopular = produto.metadata?.mostPopular;
  const trialDays = produto.metadata?.trialDays || 7;

  return (
    <div className={`pricing-card ${isPopular ? 'popular' : ''}`}>
      {isPopular && <Badge>Mais Popular</Badge>}

      <h3>{produto.nome}</h3>
      <p>{produto.descricao}</p>

      <div className="price">
        <span className="currency">R$</span>
        <span className="value">{produto.preco}</span>
        <span className="period">/mês</span>
      </div>

      <ul className="features">
        {produto.funcionalidades.map(feat => (
          <li key={feat}>
            <CheckIcon /> {feat}
          </li>
        ))}
      </ul>

      <div className="trial-badge">
        🎁 {trialDays} dias grátis
      </div>

      <button onClick={() => onSelect(produto.id)}>
        Começar Trial Gratuito
      </button>
    </div>
  );
};
```

---

### SubscriptionStatus Widget

```tsx
const SubscriptionStatus = ({ subscription }: { subscription: Subscription }) => {
  if (!subscription) return null;

  const daysRemaining = calculateDaysRemaining(subscription.trialEndDate);
  const isInTrial = subscription.isInTrial;

  return (
    <div className="subscription-widget">
      {isInTrial ? (
        <>
          <Badge variant="blue">🔥 Trial Ativo</Badge>
          <p>{daysRemaining} dias restantes</p>
          <p>Expira em: {formatDate(subscription.trialEndDate)}</p>
        </>
      ) : (
        <>
          <Badge variant="green">✅ Assinatura Ativa</Badge>
          <p>Próximo pagamento: {formatDate(subscription.nextDueDate)}</p>
        </>
      )}
      <Link to="/account/subscription">Gerenciar</Link>
    </div>
  );
};
```

---

## ✅ Status de Assinatura

| Status | Descrição | Badge | Ação |
|--------|-----------|-------|------|
| `trialing` | Em período de teste | 🔥 Trial Ativo | Mostrar dias restantes |
| `active` | Ativa e pagando | ✅ Ativa | Mostrar próxima cobrança |
| `past_due` | Pagamento atrasado | ⚠️ Pendente | Alertar usuário |
| `canceled` | Cancelada | ❌ Cancelada | Opção de reativar |
| `suspended` | Suspensa | 🚫 Suspensa | Contatar suporte |
| `expired` | Expirada | 📅 Expirada | Oferecer renovação |

---

## 🔒 Autenticação

Todas as requisições precisam do JWT token:

```typescript
// api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1'
});

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

## 📱 Páginas Necessárias

### 1. `/pricing`
- Lista todos os planos
- Badges de "Mais Popular", "Trial Grátis"
- Comparação de features
- CTA para cada plano

### 2. `/checkout`
- Resumo do plano escolhido
- Informações do trial (início, fim, primeira cobrança)
- Termos de uso
- Botão "Iniciar Trial Gratuito"

### 3. `/checkout/success`
- Confirmação de trial ativado
- Datas importantes
- CTA "Começar a usar"

### 4. `/account/subscription`
- Detalhes da assinatura atual
- Status e datas
- Opção de cancelar
- Histórico (futuro)

---

## 🐛 Tratamento de Erros

```typescript
try {
  const subscription = await createSubscription(data);
} catch (error: any) {
  // Erros comuns:

  if (error.message.includes('não encontrado')) {
    // Produto não existe
    showError('Plano não disponível');
  }

  if (error.message.includes('autenticado')) {
    // Não autenticado
    redirectToLogin();
  }

  if (error.message.includes('API')) {
    // Erro do Asaas
    showError('Erro ao processar. Tente novamente.');
  }

  // Erro genérico
  showError('Erro inesperado. Contate o suporte.');
}
```

---

## 📊 TypeScript Types

```typescript
// types/subscription.ts

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  precoFormatado: string;
  tipoCobranca: 'mensal' | 'anual';
  funcionalidades: string[];
  metadata: {
    trialDays?: number;
    mostPopular?: boolean;
    recommended?: boolean;
  };
  status: 'ativo' | 'inativo';
}

export interface Subscription {
  id: string;
  empresaId: string;
  produtoId: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'suspended' | 'expired';
  billingCycle: string;
  value: number;
  valueFormatted: string;
  hasTrial: boolean;
  trialDays: number | null;
  trialEndDate: string | null;
  isInTrial: boolean;
  nextDueDate: string;
  paymentsCount: number;
  createdAt: string;
  updatedAt: string;
}
```

---

## 📖 Documentação Completa

**Documento detalhado:** [FRONTEND_SALES_PAGE_SPEC.md](./FRONTEND_SALES_PAGE_SPEC.md)

Inclui:
- Fluxo completo de usuário
- Todos os endpoints com exemplos
- Componentes React completos
- Validações e regras de negócio
- Design system e UI/UX
- Testes sugeridos
- E muito mais...

---

## 🧪 Testando a API

Use o arquivo [test-subscriptions.http](../contract-first/subscriptions/test-subscriptions.http) com VSCode REST Client ou Postman.

**Exemplos:**
```http
# 1. Listar produtos
GET http://localhost:3000/api/v1/produtos?status=ativo

# 2. Criar assinatura
POST http://localhost:3000/api/v1/subscriptions
Authorization: Bearer {seu-token}
Content-Type: application/json

{
  "empresaId": "uuid",
  "produtoId": "uuid",
  "billingCycle": "MONTHLY",
  "value": 99.90,
  "hasTrial": true,
  "trialDays": 7
}
```

---

## 🚀 Começando

1. **Clone o repositório backend** (se necessário)
2. **Configure variáveis de ambiente** (.env)
3. **Execute `npm run migrate:latest`** para criar tabelas
4. **Inicie o servidor**: `npm run dev:api`
5. **Teste os endpoints** com Postman/REST Client
6. **Comece a desenvolver o frontend!**

---

## 💬 Suporte

**Dúvidas?** Entre em contato:
- Backend Dev: João Silva
- Email: joao@leadsrapido.com
- Slack: #backend-api
- Issues: GitHub com tag `frontend-integration`

---

## ✅ Checklist

Antes de começar:
- [ ] API rodando localmente
- [ ] Token JWT de teste disponível
- [ ] Testou endpoints básicos
- [ ] Leu documento completo
- [ ] Entendeu fluxo de trial
- [ ] Componentes planejados
- [ ] State management definido

---

**Boa implementação!** 🚀💪

Se precisar de ajuda, consulte o [documento completo](./FRONTEND_SALES_PAGE_SPEC.md) ou entre em contato!
