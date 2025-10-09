/**
 * Financial Types
 * TypeScript interfaces for financial summary entities
 */

/**
 * Financial Summary Query Parameters
 * Used for date range filtering
 */
export interface FinancialSummaryParams {
  startDate?: string;                // ISO 8601 date (default: 30 days ago)
  endDate?: string;                  // ISO 8601 date (default: today)
}

/**
 * Financial Summary
 * Aggregated financial metrics for a time period
 */
export interface FinancialSummary {
  totalSpent: number;                // Total amount spent in cents
  totalEarned: number;               // Total credits earned
  activeSubscriptions: number;       // Number of active subscriptions
  pendingPayments: number;           // Number of pending payments
  period: {
    startDate: string;               // ISO 8601 date
    endDate: string;                 // ISO 8601 date
  };
}
