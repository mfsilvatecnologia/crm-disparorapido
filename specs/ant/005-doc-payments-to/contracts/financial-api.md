# API Contracts - Financial Summary

**Feature**: Payments, Subscriptions, and Credits Management  
**Version**: 1.0  
**Date**: 2025-01-08

---

## Overview

This document defines the API contracts for financial summary endpoints. All endpoints require authentication via JWT bearer token in the `Authorization` header.

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

## 1. Get Financial Summary

**Endpoint**: `GET /financial/summary`

**Description**: Retrieve aggregated financial metrics for a specified time period.

### Request

**Query Parameters**:

| Parameter  | Type   | Required | Default        | Description                |
|------------|--------|----------|----------------|----------------------------|
| startDate  | string | No       | 30 days ago    | Start date (ISO 8601)      |
| endDate    | string | No       | Today          | End date (ISO 8601)        |

**Example Request**:

```http
GET /financial/summary?startDate=2025-01-01T00:00:00Z&endDate=2025-01-31T23:59:59Z
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response

**Success Response** (200 OK):

```json
{
  "totalSpent": 29900,
  "totalEarned": 1500,
  "activeSubscriptions": 2,
  "pendingPayments": 1,
  "period": {
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": "2025-01-31T23:59:59Z"
  }
}
```

**Field Descriptions**:

| Field               | Type    | Description                                      |
|---------------------|---------|--------------------------------------------------|
| totalSpent          | integer | Total amount spent in cents during the period    |
| totalEarned         | integer | Total credits earned during the period           |
| activeSubscriptions | integer | Number of active subscriptions                   |
| pendingPayments     | integer | Number of pending payments                       |
| period.startDate    | string  | Period start date (ISO 8601)                     |
| period.endDate      | string  | Period end date (ISO 8601)                       |

**Error Responses**:

- **400 Bad Request**: Invalid query parameters

```json
{
  "error": {
    "message": "Invalid date range",
    "code": "INVALID_PARAMETER",
    "details": {
      "reason": "Start date must be before end date"
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

- **403 Forbidden**: User does not have permission to view financial summary

```json
{
  "error": "Acesso negado"
}
```

---

## Data Models

### Financial Summary Object

```typescript
{
  totalSpent: number;          // Total amount spent in cents (e.g., 29900 = R$ 299,00)
  totalEarned: number;         // Total credits earned
  activeSubscriptions: number; // Number of active subscriptions
  pendingPayments: number;     // Number of pending payments
  period: {
    startDate: string;         // ISO 8601 datetime
    endDate: string;           // ISO 8601 datetime
  };
}
```

---

## Business Rules

### Total Spent Calculation

- Includes all completed payments in the period
- Excludes cancelled and refunded payments
- Amounts are in cents (e.g., R$ 99,00 = 9900)

### Total Earned Calculation

- Includes all credit transactions of type `earned` in the period
- Does not include bonus credits (use separate query for detailed breakdown)

### Active Subscriptions

- Counts subscriptions with status `active` or `trial`
- Excludes cancelled and expired subscriptions

### Pending Payments

- Counts payments with status `pending`
- Includes payments initiated but not yet processed

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
- Get financial summary endpoint with date range filtering

---

**Document Status**: ✅ Complete  
**Last Updated**: 2025-01-08  
**Contracts Directory**: Complete (payments, credits, financial)
