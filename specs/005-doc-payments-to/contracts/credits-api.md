# API Contracts - Credits

**Feature**: Payments, Subscriptions, and Credits Management  
**Version**: 1.0  
**Date**: 2025-01-08

---

## Overview

This document defines the API contracts for credit-related endpoints. All endpoints require authentication via JWT bearer token in the `Authorization` header.

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

## 1. Get Credit Balance

**Endpoint**: `GET /credits/balance`

**Description**: Retrieve the current credit balance for the authenticated user/company.

### Request

**Example Request**:

```http
GET /credits/balance
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response

**Success Response** (200 OK):

```json
{
  "balance": 1500,
  "lastUpdated": "2025-01-15T14:30:00Z"
}
```

**Error Responses**:

- **401 Unauthorized**: Missing or invalid authentication token

```json
{
  "error": "Token de autenticação inválido ou expirado"
}
```

- **403 Forbidden**: User does not have permission to view credit balance

```json
{
  "error": "Acesso negado"
}
```

---

## 2. List Credit Transactions

**Endpoint**: `GET /credits/transactions`

**Description**: Retrieve a paginated list of credit transactions with optional filters.

### Request

**Query Parameters**:

| Parameter | Type    | Required | Default | Description                   |
|-----------|---------|----------|---------|-------------------------------|
| page      | integer | No       | 1       | Page number (1-indexed)       |
| limit     | integer | No       | 10      | Items per page (max: 100)     |
| type      | string  | No       | -       | Filter by transaction type    |

**Transaction Type Values**:
- `earned`: Credits earned (e.g., from campaign completion)
- `spent`: Credits spent (e.g., for lead enrichment)
- `bonus`: Bonus credits (e.g., promotional credits)
- `refund`: Credits refunded (e.g., from cancelled payment)

**Example Request**:

```http
GET /credits/transactions?page=1&limit=10&type=earned
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response

**Success Response** (200 OK):

```json
{
  "transactions": [
    {
      "id": "txn_1234567890",
      "amount": 100,
      "type": "earned",
      "description": "Campanha completada: Prospecção Q1",
      "createdAt": "2025-01-15T10:00:00Z",
      "relatedEntityType": "campaign",
      "relatedEntityId": "camp_0987654321",
      "balanceAfter": 1500
    },
    {
      "id": "txn_0987654321",
      "amount": -50,
      "type": "spent",
      "description": "Enriquecimento de 50 leads",
      "createdAt": "2025-01-14T14:30:00Z",
      "relatedEntityType": "campaign",
      "relatedEntityId": "camp_1122334455",
      "balanceAfter": 1400
    },
    {
      "id": "txn_5544332211",
      "amount": 300,
      "type": "bonus",
      "description": "Bônus de boas-vindas",
      "createdAt": "2025-01-01T00:00:00Z",
      "balanceAfter": 1450
    },
    {
      "id": "txn_9988776655",
      "amount": 100,
      "type": "refund",
      "description": "Reembolso de pagamento cancelado",
      "createdAt": "2025-01-13T09:15:00Z",
      "relatedEntityType": "payment",
      "relatedEntityId": "pay_1234567890",
      "balanceAfter": 1350
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 27,
    "itemsPerPage": 10
  }
}
```

**Error Responses**:

- **400 Bad Request**: Invalid query parameters

```json
{
  "error": {
    "message": "Invalid transaction type",
    "code": "INVALID_PARAMETER",
    "details": {
      "parameter": "type",
      "allowedValues": ["earned", "spent", "bonus", "refund"]
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

- **403 Forbidden**: User does not have permission to view credit transactions

```json
{
  "error": "Acesso negado"
}
```

---

## Data Models

### Credit Balance Object

```typescript
{
  balance: number;         // Current credit balance
  lastUpdated: string;     // ISO 8601 datetime of last update
}
```

### Credit Transaction Object

```typescript
{
  id: string;                         // Unique transaction identifier
  amount: number;                     // Credit amount (positive for earned, negative for spent)
  type: CreditTransactionType;        // Transaction type
  description: string;                // Human-readable description
  createdAt: string;                  // ISO 8601 datetime
  relatedEntityType?: RelatedEntityType; // Type of related entity (optional)
  relatedEntityId?: string;           // ID of related entity (optional)
  balanceAfter: number;               // Credit balance after this transaction
}
```

### Credit Transaction Type Enum

```typescript
type CreditTransactionType = 
  | 'earned'  // Credits earned (e.g., from campaign completion)
  | 'spent'   // Credits spent (e.g., for lead enrichment)
  | 'bonus'   // Bonus credits (e.g., promotional credits)
  | 'refund'; // Credits refunded (e.g., from cancelled payment)
```

### Related Entity Type Enum

```typescript
type RelatedEntityType = 
  | 'payment'      // Transaction related to a payment
  | 'subscription' // Transaction related to a subscription
  | 'campaign';    // Transaction related to a campaign
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
- Get credit balance endpoint
- List credit transactions endpoint with filtering and pagination

---

**Document Status**: ✅ Complete  
**Last Updated**: 2025-01-08  
**Next Contract**: `financial-api.md`
