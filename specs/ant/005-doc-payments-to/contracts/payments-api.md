# API Contracts - Payments

**Feature**: Payments, Subscriptions, and Credits Management  
**Version**: 1.0  
**Date**: 2025-01-08

---

## Overview

This document defines the API contracts for payment-related endpoints. All endpoints require authentication via JWT bearer token in the `Authorization` header.

---

## Base URL

```
https://api.example.com/api
```

---

## Authentication

All endpoints require authentication:

```
Authorization: Bearer <jwt_token>
```

---

## 1. List Payments

**Endpoint**: `GET /payments`

**Description**: Retrieve a paginated list of payments with optional filters.

### Request

**Query Parameters**:

| Parameter  | Type     | Required | Default | Description                     |
|------------|----------|----------|---------|--------------------------------|
| page       | integer  | No       | 1       | Page number (1-indexed)        |
| limit      | integer  | No       | 10      | Items per page (max: 100)      |
| status     | string   | No       | -       | Filter by payment status       |
| startDate  | string   | No       | -       | Start date (ISO 8601)          |
| endDate    | string   | No       | -       | End date (ISO 8601)            |

**Status Values**:
- `pending`: Payment initiated but not processed
- `completed`: Payment successfully processed
- `failed`: Payment processing failed
- `cancelled`: Payment manually cancelled
- `refunded`: Completed payment that was refunded

**Example Request**:

```http
GET /payments?page=1&limit=10&status=completed&startDate=2025-01-01T00:00:00Z&endDate=2025-01-31T23:59:59Z
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response

**Success Response** (200 OK):

```json
{
  "payments": [
    {
      "id": "pay_1234567890",
      "amount": 9900,
      "status": "completed",
      "method": "credit_card",
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:05Z",
      "description": "Assinatura Premium - Mensal",
      "subscriptionId": "sub_0987654321",
      "metadata": {
        "plan": "premium",
        "billingCycle": "monthly"
      }
    },
    {
      "id": "pay_0987654321",
      "amount": 29900,
      "status": "completed",
      "method": "pix",
      "createdAt": "2025-01-10T14:20:00Z",
      "updatedAt": "2025-01-10T14:22:00Z",
      "description": "Compra de Créditos - 300 leads",
      "metadata": {
        "credits": 300
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 47,
    "itemsPerPage": 10
  }
}
```

**Error Responses**:

- **400 Bad Request**: Invalid query parameters

```json
{
  "error": {
    "message": "Invalid status value",
    "code": "INVALID_PARAMETER",
    "details": {
      "parameter": "status",
      "allowedValues": ["pending", "completed", "failed", "cancelled", "refunded"]
    }
  }
}
```

- **401 Unauthorized**: Missing or invalid authentication token

```json
{
  "error": "Token de autenticação inválido ou expirado"
}
```

- **403 Forbidden**: User does not have permission to view payments

```json
{
  "error": "Acesso negado"
}
```

---

## 2. Get Payment Details

**Endpoint**: `GET /payments/:id`

**Description**: Retrieve detailed information about a specific payment.

### Request

**Path Parameters**:

| Parameter | Type   | Required | Description   |
|-----------|--------|----------|---------------|
| id        | string | Yes      | Payment ID    |

**Example Request**:

```http
GET /payments/pay_1234567890
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response

**Success Response** (200 OK):

```json
{
  "id": "pay_1234567890",
  "amount": 9900,
  "status": "completed",
  "method": "credit_card",
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:05Z",
  "description": "Assinatura Premium - Mensal",
  "subscriptionId": "sub_0987654321",
  "metadata": {
    "plan": "premium",
    "billingCycle": "monthly"
  },
  "transactionId": "txn_abc123def456",
  "receiptUrl": "https://api.example.com/receipts/pay_1234567890.pdf"
}
```

**Error Responses**:

- **404 Not Found**: Payment not found

```json
{
  "error": "Pagamento não encontrado"
}
```

- **401 Unauthorized**: Missing or invalid authentication token

```json
{
  "error": "Token de autenticação inválido ou expirado"
}
```

- **403 Forbidden**: User does not have permission to view this payment

```json
{
  "error": "Acesso negado"
}
```

---

## 3. Cancel Payment

**Endpoint**: `POST /payments/:id/cancel`

**Description**: Cancel a pending payment.

### Request

**Path Parameters**:

| Parameter | Type   | Required | Description   |
|-----------|--------|----------|---------------|
| id        | string | Yes      | Payment ID    |

**Request Body**:

```json
{
  "reason": "Cliente solicitou cancelamento"
}
```

**Body Schema**:

| Field  | Type   | Required | Max Length | Description               |
|--------|--------|----------|------------|---------------------------|
| reason | string | No       | 500        | Reason for cancellation   |

**Example Request**:

```http
POST /payments/pay_1234567890/cancel
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "reason": "Cliente desistiu da compra"
}
```

### Response

**Success Response** (200 OK):

```json
{
  "success": true,
  "payment": {
    "id": "pay_1234567890",
    "amount": 9900,
    "status": "cancelled",
    "method": "credit_card",
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T11:00:00Z",
    "description": "Assinatura Premium - Mensal",
    "subscriptionId": "sub_0987654321",
    "metadata": {
      "plan": "premium",
      "billingCycle": "monthly",
      "cancellationReason": "Cliente desistiu da compra"
    }
  },
  "message": "Pagamento cancelado com sucesso"
}
```

**Error Responses**:

- **400 Bad Request**: Payment cannot be cancelled (wrong status)

```json
{
  "error": {
    "message": "Pagamento não pode ser cancelado",
    "code": "INVALID_OPERATION",
    "details": {
      "currentStatus": "completed",
      "reason": "Only pending payments can be cancelled"
    }
  }
}
```

- **404 Not Found**: Payment not found

```json
{
  "error": "Pagamento não encontrado"
}
```

- **401 Unauthorized**: Missing or invalid authentication token

```json
{
  "error": "Token de autenticação inválido ou expirado"
}
```

- **403 Forbidden**: User does not have permission to cancel this payment

```json
{
  "error": "Acesso negado"
}
```

---

## 4. Refund Payment

**Endpoint**: `POST /payments/:id/refund`

**Description**: Refund a completed payment.

### Request

**Path Parameters**:

| Parameter | Type   | Required | Description   |
|-----------|--------|----------|---------------|
| id        | string | Yes      | Payment ID    |

**Request Body**:

```json
{
  "reason": "Produto não entregue"
}
```

**Body Schema**:

| Field  | Type   | Required | Max Length | Description          |
|--------|--------|----------|------------|----------------------|
| reason | string | No       | 500        | Reason for refund    |

**Example Request**:

```http
POST /payments/pay_1234567890/refund
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "reason": "Solicitação do cliente"
}
```

### Response

**Success Response** (200 OK):

```json
{
  "success": true,
  "payment": {
    "id": "pay_1234567890",
    "amount": 9900,
    "status": "refunded",
    "method": "credit_card",
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-16T09:00:00Z",
    "description": "Assinatura Premium - Mensal",
    "subscriptionId": "sub_0987654321",
    "metadata": {
      "plan": "premium",
      "billingCycle": "monthly",
      "refundReason": "Solicitação do cliente",
      "refundedAt": "2025-01-16T09:00:00Z"
    }
  },
  "message": "Pagamento reembolsado com sucesso. O valor será creditado em até 10 dias úteis."
}
```

**Error Responses**:

- **400 Bad Request**: Payment cannot be refunded (wrong status)

```json
{
  "error": {
    "message": "Pagamento não pode ser reembolsado",
    "code": "INVALID_OPERATION",
    "details": {
      "currentStatus": "pending",
      "reason": "Only completed payments can be refunded"
    }
  }
}
```

- **404 Not Found**: Payment not found

```json
{
  "error": "Pagamento não encontrado"
}
```

- **401 Unauthorized**: Missing or invalid authentication token

```json
{
  "error": "Token de autenticação inválido ou expirado"
}
```

- **403 Forbidden**: User does not have permission to refund this payment

```json
{
  "error": "Acesso negado"
}
```

---

## Data Models

### Payment Object

```typescript
{
  id: string;                        // Unique payment identifier
  amount: number;                    // Amount in cents (e.g., 9900 = R$ 99,00)
  status: PaymentStatus;             // Current payment status
  method: PaymentMethod;             // Payment method used
  createdAt: string;                 // ISO 8601 datetime
  updatedAt: string;                 // ISO 8601 datetime
  description: string;               // Human-readable description
  subscriptionId?: string;           // Related subscription (optional)
  metadata?: Record<string, unknown>; // Additional custom data (optional)
  transactionId?: string;            // External transaction ID (details only)
  receiptUrl?: string;               // Receipt URL (details only)
}
```

### Payment Status Enum

```typescript
type PaymentStatus = 
  | 'pending'    // Payment initiated but not processed
  | 'completed'  // Payment successfully processed
  | 'failed'     // Payment processing failed
  | 'cancelled'  // Payment manually cancelled
  | 'refunded';  // Completed payment that was refunded
```

### Payment Method Enum

```typescript
type PaymentMethod = 
  | 'credit_card' // Credit or debit card
  | 'pix'         // Brazilian instant payment
  | 'boleto';     // Brazilian bank slip
```

### Pagination Metadata

```typescript
{
  currentPage: number;    // Current page number (1-indexed)
  totalPages: number;     // Total number of pages
  totalItems: number;     // Total number of items
  itemsPerPage: number;   // Items per page
}
```

---

## Rate Limiting

All endpoints are subject to rate limiting:

- **Rate Limit**: 100 requests per minute per user
- **Headers**:
  - `X-RateLimit-Limit`: Maximum requests per minute
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

**Rate Limit Exceeded Response** (429 Too Many Requests):

```json
{
  "error": "Taxa de requisições excedida. Tente novamente em 60 segundos."
}
```

---

## Changelog

### Version 1.0 (2025-01-08)
- Initial API contract documentation
- Payment list endpoint with filtering and pagination
- Payment details endpoint
- Cancel payment endpoint
- Refund payment endpoint

---

**Document Status**: ✅ Complete  
**Last Updated**: 2025-01-08  
**Next Contract**: `credits-api.md`
