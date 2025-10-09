/**
 * Filter Types
 * UI-specific filter state types
 */

import { PaymentStatus } from './payment.types';
import { CreditTransactionType } from './credit.types';

/**
 * Payment Filter State
 * Client-side filter state for payment list
 */
export interface PaymentFilters {
  status?: PaymentStatus;
  startDate?: Date | null;
  endDate?: Date | null;
  page: number;
  limit: number;
}

/**
 * Credit Transaction Filter State
 * Client-side filter state for credit transaction list
 */
export interface CreditTransactionFilters {
  type?: CreditTransactionType;
  page: number;
  limit: number;
}

/**
 * Financial Summary Filter State
 * Client-side filter state for financial summary
 */
export interface FinancialSummaryFilters {
  startDate: Date;
  endDate: Date;
}
