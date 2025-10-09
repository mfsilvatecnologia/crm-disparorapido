/**
 * Component Props Types
 * TypeScript interfaces for component props
 */

import { Payment, PaymentStatus } from './payment.types';
import { CreditTransaction, RelatedEntityType } from './credit.types';
import { FinancialSummary } from './financial.types';

/**
 * Payment Card Props
 */
export interface PaymentCardProps {
  payment: Payment;
  isCorrupted?: boolean;             // Display warning for corrupted data
  onClick?: () => void;              // Navigate to details page
}

/**
 * Payment Status Badge Props
 */
export interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  showLabel?: boolean;               // Show status label text
}

/**
 * Payment Actions Props
 */
export interface PaymentActionsProps {
  payment: Payment;
  onCancel?: (reason?: string) => void;
  onRefund?: (reason?: string) => void;
  isCancelling?: boolean;
  isRefunding?: boolean;
}

/**
 * Credit Transaction Card Props
 */
export interface CreditTransactionCardProps {
  transaction: CreditTransaction;
  onRelatedEntityClick?: (type: RelatedEntityType, id: string) => void;
}

/**
 * Financial Summary Card Props
 */
export interface FinancialSummaryCardProps {
  summary: FinancialSummary;
  isLoading?: boolean;
}

/**
 * Pagination Props
 */
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange?: (limit: number) => void;
}
