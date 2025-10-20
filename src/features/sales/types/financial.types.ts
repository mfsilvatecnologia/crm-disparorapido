/**
 * Financial Types
 * TypeScript interfaces for financial summary entities
 *
 * Note: Financial summary types are now defined in payment.types.ts
 * to match the backend API structure from /payments/summary
 */

// Re-export from payment.types.ts for backwards compatibility
export type { FinancialSummary, FinancialSummaryParams, SummaryItem } from './payment.types';
