/**
 * Credit Types
 * TypeScript interfaces for credit transaction entities
 */

import { PaginationMeta } from './payment.types';

/**
 * Credit Transaction Type
 * - earned: Credits earned (e.g., from campaign completion)
 * - spent: Credits spent (e.g., for lead enrichment)
 * - bonus: Bonus credits (e.g., promotional credits)
 * - refund: Credits refunded (e.g., from cancelled payment)
 */
export type CreditTransactionType =
  | 'earned'
  | 'spent'
  | 'bonus'
  | 'refund';

/**
 * Related Entity Type
 * - payment: Transaction related to a payment
 * - subscription: Transaction related to a subscription
 * - campaign: Transaction related to a campaign
 */
export type RelatedEntityType =
  | 'payment'
  | 'subscription'
  | 'campaign';

/**
 * Credit Transaction Entity
 * Represents a single credit transaction
 */
export interface CreditTransaction {
  id: string;
  amount: number;                    // Credit amount (positive for earned, negative for spent)
  type: CreditTransactionType;
  description: string;               // Human-readable description
  createdAt: string;                 // ISO 8601 datetime
  relatedEntityType?: RelatedEntityType; // Type of related entity
  relatedEntityId?: string;          // ID of related entity
  balanceAfter: number;              // Credit balance after this transaction
}

/**
 * Credit Transaction List Query Parameters
 * Used for filtering and pagination
 */
export interface CreditTransactionListParams {
  page?: number;                     // Page number (1-indexed)
  limit?: number;                    // Items per page (default: 10)
  type?: CreditTransactionType;      // Filter by transaction type
}

/**
 * Credit Transaction List Response
 * Backend API response for GET /api/credits/transactions
 */
export interface CreditTransactionListResponse {
  transactions: CreditTransaction[];
  pagination: PaginationMeta;
}

/**
 * Credit Balance
 * Current credit balance for the user/company
 */
export interface CreditBalance {
  balance: number;                   // Current credit balance
  lastUpdated: string;               // ISO 8601 datetime of last update
}
