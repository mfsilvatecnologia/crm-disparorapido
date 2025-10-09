# API de Pagamentos - Guia de Integração Frontend

## Endpoints Disponíveis

### 1. Listar Histórico de Pagamentos
**GET** `/api/v1/payments/history`

Lista pagamentos com paginação e filtros.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `limit` | integer | 10 | Quantidade de itens por página |
| `offset` | integer | 0 | Offset para paginação |
| `status` | string | - | Filtro por status: `PENDING`, `RECEIVED`, `CONFIRMED`, `OVERDUE`, `REFUNDED`, `CANCELLED` |
| `startDate` | string (ISO 8601) | - | Data inicial do filtro |
| `endDate` | string (ISO 8601) | - | Data final do filtro |

**Exemplo de Request:**
```javascript
const response = await fetch('/api/v1/payments/history?limit=20&offset=0&status=CONFIRMED&startDate=2025-01-01&endDate=2025-10-08', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": 10000,
      "status": "CONFIRMED",
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:35:00Z"
    }
  ]
}
```

---

### 2. Obter Detalhes de Pagamento
**GET** `/api/v1/payments/{paymentId}`

Recupera detalhes completos de um pagamento específico.

**Headers:**
```
Authorization: Bearer {token}
```

**Path Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `paymentId` | string | Sim | ID do pagamento |

**Exemplo de Request:**
```javascript
const response = await fetch(`/api/v1/payments/${paymentId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "amount": 10000,
    "status": "CONFIRMED",
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:35:00Z"
  }
}
```

**Response 404:**
```json
{
  "error": "Payment not found"
}
```

---

### 3. Listar Transações de Crédito
**GET** `/api/v1/credits/transactions`

Lista transações de crédito com paginação e filtros.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `limit` | integer | 10 | Quantidade de itens por página |
| `offset` | integer | 0 | Offset para paginação |
| `type` | string | - | Filtro por tipo: `compra`, `uso`, `reembolso`, `bonus` |

**Exemplo de Request:**
```javascript
const response = await fetch('/api/v1/credits/transactions?limit=50&type=compra', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "compra",
      "amount": 5000,
      "createdAt": "2025-01-10T14:20:00Z"
    }
  ]
}
```

---

### 4. Obter Resumo Financeiro
**GET** `/api/v1/payments/summary`

Recupera resumo financeiro agregado da empresa.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `period` | string | `last90days` | Período: `last30days`, `last90days`, `currentMonth`, `allTime` |

**Exemplo de Request:**
```javascript
const response = await fetch('/api/v1/payments/summary?period=currentMonth', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "totalPaid": 150000,
    "totalPending": 25000,
    "totalRefunded": 5000,
    "creditsBalance": 10000,
    "period": "currentMonth"
  }
}
```

---

## Tipos TypeScript

```typescript
// Status de Pagamento
type PaymentStatus =
  | 'PENDING'
  | 'RECEIVED'
  | 'CONFIRMED'
  | 'OVERDUE'
  | 'REFUNDED'
  | 'CANCELLED';

// Tipo de Transação
type TransactionType = 'compra' | 'uso' | 'reembolso' | 'bonus';

// Período de Resumo
type SummaryPeriod = 'last30days' | 'last90days' | 'currentMonth' | 'allTime';

// Payment
interface Payment {
  id: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

// Credit Transaction
interface CreditTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  createdAt: string;
}

// Financial Summary
interface FinancialSummary {
  totalPaid: number;
  totalPending: number;
  totalRefunded: number;
  creditsBalance: number;
  period: SummaryPeriod;
}
```

---

## Tratamento de Erros

Todos os endpoints retornam erros no formato:

**Response 401 (Não Autorizado):**
```json
{
  "error": "Unauthorized"
}
```

**Response 500 (Erro Interno):**
```json
{
  "success": false,
  "error": "Internal Server Error"
}
```

**Implementação Sugerida:**
```typescript
async function handleApiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);

  if (response.status === 401) {
    // Redirecionar para login
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  const data = await response.json();
  return data.data;
}
```

---

## Exemplo de Implementação React

```typescript
import { useState, useEffect } from 'react';

function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPayments() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/v1/payments/history?limit=20', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to load payments');

        const data = await response.json();
        setPayments(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadPayments();
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      {payments.map(payment => (
        <div key={payment.id}>
          {payment.status} - R$ {payment.amount / 100}
        </div>
      ))}
    </div>
  );
}
```
