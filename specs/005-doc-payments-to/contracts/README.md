# API Contracts

**Feature**: Payments, Subscriptions, and Credits Management  
**Version**: 1.0  
**Date**: 2025-01-08

---

## Overview

This directory contains the API contract documentation for the Payments, Subscriptions, and Credits Management feature. These contracts define the expected structure of API requests and responses between the frontend and backend.

---

## Contracts

1. **[payments-api.md](./payments-api.md)**: Payment history, details, cancel, and refund endpoints
2. **[credits-api.md](./credits-api.md)**: Credit balance and transaction list endpoints
3. **[financial-api.md](./financial-api.md)**: Financial summary endpoint

---

## Usage

### For Frontend Developers

These contracts serve as the **source of truth** for:
- TypeScript interface definitions
- Zod validation schemas
- API client implementations
- Test data mocking

When implementing API calls, always reference the contract to ensure request/response structures match the documented format.

### For Backend Developers

Use these contracts to:
- Validate API implementation correctness
- Ensure response structure matches frontend expectations
- Document any deviations or breaking changes

---

## Contract Validation

All API responses should be validated against Zod schemas defined in:
- `src/features/sales/schemas/payment.schema.ts`
- `src/features/sales/schemas/credit.schema.ts`
- `src/features/sales/schemas/financial.schema.ts`

Contract tests (in `tests/contract/sales/`) automatically verify that API responses match the documented schemas.

---

## Versioning

Contracts follow semantic versioning:
- **Major version**: Breaking changes (e.g., removed fields, renamed endpoints)
- **Minor version**: New features (e.g., new optional fields, new endpoints)
- **Patch version**: Bug fixes or clarifications (no changes to structure)

Current version: **1.0.0**

---

## Changelog

### Version 1.0.0 (2025-01-08)

- Initial API contract documentation
- Payment endpoints (list, details, cancel, refund)
- Credit endpoints (balance, transactions)
- Financial summary endpoint

---

**Document Status**: ✅ Complete  
**Last Updated**: 2025-01-08
