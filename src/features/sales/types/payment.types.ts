/**
 * Payment Types
 *
 * TypeScript interfaces for payment history and transactions
 */

// ============================================================================
// Legacy Payment Types (existing system)
// ============================================================================

/**
 * Legacy Payment status enum
 * @deprecated Use PaymentStatus type for new features
 */
export enum LegacyPaymentStatus {
  /** Payment pending confirmation */
  PENDING = 'pending',

  /** Payment confirmed by gateway */
  CONFIRMED = 'confirmed',

  /** Payment received and processed */
  RECEIVED = 'received',

  /** Payment overdue */
  OVERDUE = 'overdue',

  /** Payment refunded */
  REFUNDED = 'refunded'
}

/**
 * Legacy Payment method enum
 * @deprecated Use PaymentMethod type for new features
 */
export enum LegacyPaymentMethod {
  /** Credit card */
  CREDIT_CARD = 'CREDIT_CARD',

  /** Bank slip (boleto) */
  BOLETO = 'BOLETO',

  /** PIX instant payment */
  PIX = 'PIX'
}

// ============================================================================
// New Payment Types (Feature 005: Payments, Subscriptions, Credits Management)
// ============================================================================

/**
 * Payment Status
 * - pending: Payment initiated but not yet processed
 * - completed: Payment successfully processed
 * - failed: Payment processing failed
 * - cancelled: Payment manually cancelled before completion
 * - refunded: Completed payment that was refunded
 */
/**
 * Payment Status (Backend API)
 * Matches backend enum: PENDING, RECEIVED, CONFIRMED, OVERDUE, REFUNDED, CANCELLED
 */
export type PaymentStatus =
  | 'PENDING'
  | 'RECEIVED'
  | 'CONFIRMED'
  | 'OVERDUE'
  | 'REFUNDED'
  | 'CANCELLED';

/**
 * Billing Type (Backend API)
 * Matches backend enum: BOLETO, CREDIT_CARD, PIX, UNDEFINED
 */
export type BillingType =
  | 'BOLETO'
  | 'CREDIT_CARD'
  | 'PIX'
  | 'UNDEFINED';

/**
 * Payment Entity (Backend API)
 * Represents a single payment transaction from backend
 */
export interface Payment {
  id: string;
  empresaId: string | null;
  value: number;                     // Payment value
  netValue: number;                  // Net value after fees
  description: string;
  billingType: BillingType;
  status: PaymentStatus;
  dueDate: string;                   // ISO 8601 date
  paymentDate: string | null;        // ISO 8601 date
  invoiceUrl: string;                // URL to invoice
  createdAt: string;                 // ISO 8601 datetime
}

/**
 * Payment List Query Parameters (Backend API)
 * Used for filtering and pagination
 */
export interface PaymentListParams {
  limit?: number;                    // Items per page (default: 10)
  offset?: number;                   // Offset for pagination (default: 0)
  status?: PaymentStatus;            // Filter by payment status
  startDate?: string;                // Filter by date range start (ISO 8601 date)
  endDate?: string;                  // Filter by date range end (ISO 8601 date)
}

/**
 * Pagination Metadata (Backend API)
 * Standard pagination response structure
 */
export interface PaginationMeta {
  totalCount: number;                // Total number of items
  limit: number;                     // Items per page
  offset: number;                    // Current offset
}

/**
 * Payment List Response (Backend API)
 * Backend API response for GET /payments/history
 */
export interface PaymentListResponse {
  totalCount: number;
  limit: number;
  offset: number;
  data: Payment[];
}

/**
 * Payment Action Parameters
 * Used for cancel/refund operations
 */
export interface PaymentActionParams {
  reason?: string;                   // Optional reason for action
}

/**
 * Payment Action Response
 * Backend API response for POST /api/payments/:id/cancel or /refund
 */
export interface PaymentActionResponse {
  success: boolean;
  payment: Payment;                  // Updated payment object
  message?: string;                  // Optional success/error message
}

/**
 * Payment Details Response
 * Backend API response for GET /payments/{paymentId}
 * Same as Payment entity
 */
export type PaymentDetailsResponse = Payment;

/**
 * Summary Item
 * Used in financial summary for aggregated data
 */
export interface SummaryItem {
  count: number;
  amount: number;
}

/**
 * Financial Summary (Backend API)
 * Backend API response for GET /payments/summary
 */
export interface FinancialSummary {
  totalAmountSpent: number;
  payments: {
    totalCount: number;
    pending: SummaryItem;
    received: SummaryItem;
    overdue: SummaryItem;
  };
  credits: {
    currentBalance: number;
    totalPurchased: number;
    totalUsed: number;
    amountSpentOnCredits: number;
  };
  period: {
    startDate: string;               // ISO 8601 date
    endDate: string;                 // ISO 8601 date
  };
}

/**
 * Financial Summary Query Parameters
 * Used for period filtering
 */
export interface FinancialSummaryParams {
  period?: 'last30days' | 'last90days' | 'currentMonth' | 'allTime';
}

// ============================================================================
// Legacy Payment History Interface (preserved for backwards compatibility)
// ============================================================================

/**
 * Legacy Payment History interface
 * @deprecated Use Payment interface for new features
 */
export interface PaymentHistory {
  /** Unique identifier */
  id: string;

  /** Related subscription ID */
  subscriptionId: string;

  /** Payment amount in centavos */
  amount: number;

  /** Payment status */
  status: LegacyPaymentStatus;

  /** Payment method used */
  paymentMethod: LegacyPaymentMethod | null;

  /** Due date */
  dueDate: string;

  /** Payment date (null if not paid) */
  paidAt: string | null;

  /** Asaas payment ID */
  asaasPaymentId: string | null;

  /** Invoice URL (if available) */
  invoiceUrl: string | null;

  /** Boleto barcode (if payment method is boleto) */
  boletoBarcode: string | null;

  /** PIX QR code (if payment method is PIX) */
  pixQrCode: string | null;

  /** Creation timestamp */
  createdAt: string;

  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Payment History with relations
 */
export interface PaymentHistoryWithRelations extends PaymentHistory {
  /** Related subscription */
  subscription?: {
    id: string;
    companyId: string;
    productId: string;
    status: string;
  };
}

/**
 * Create Payment DTO
 */
export interface CreatePaymentDTO {
  subscriptionId: string;
  amount: number;
  dueDate: string;
  billingType?: BillingType;
}

/**
 * Payment with computed fields
 */
export interface PaymentHistoryWithComputed extends PaymentHistory {
  /** Formatted amount */
  formattedAmount: string;
  
  /** Formatted due date */
  formattedDueDate: string;
  
  /** Formatted paid date */
  formattedPaidAt: string | null;
  
  /** Whether payment is overdue */
  isOverdue: boolean;
  
  /** Whether payment is pending */
  isPending: boolean;
  
  /** Whether payment is paid */
  isPaid: boolean;
  
  /** Days until due (negative if overdue) */
  daysUntilDue: number;
}

/**
 * Legacy Payment status colors
 */
export const LegacyPaymentStatusColors: Record<LegacyPaymentStatus, string> = {
  [LegacyPaymentStatus.PENDING]: 'yellow',
  [LegacyPaymentStatus.CONFIRMED]: 'blue',
  [LegacyPaymentStatus.RECEIVED]: 'green',
  [LegacyPaymentStatus.OVERDUE]: 'red',
  [LegacyPaymentStatus.REFUNDED]: 'gray'
};

/**
 * Legacy Payment status labels in Portuguese
 */
export const LegacyPaymentStatusLabels: Record<LegacyPaymentStatus, string> = {
  [LegacyPaymentStatus.PENDING]: 'Pendente',
  [LegacyPaymentStatus.CONFIRMED]: 'Confirmado',
  [LegacyPaymentStatus.RECEIVED]: 'Recebido',
  [LegacyPaymentStatus.OVERDUE]: 'Atrasado',
  [LegacyPaymentStatus.REFUNDED]: 'Reembolsado'
};

/**
 * Legacy Payment method labels in Portuguese
 */
export const LegacyPaymentMethodLabels: Record<LegacyPaymentMethod, string> = {
  [LegacyPaymentMethod.CREDIT_CARD]: 'Cartão de Crédito',
  [LegacyPaymentMethod.BOLETO]: 'Boleto Bancário',
  [LegacyPaymentMethod.PIX]: 'PIX'
};

/**
 * Helper function to check if payment is overdue
 */
export function isPaymentOverdue(payment: PaymentHistory): boolean {
  if (payment.status === LegacyPaymentStatus.RECEIVED ||
      payment.status === LegacyPaymentStatus.REFUNDED) {
    return false;
  }
  
  const now = new Date();
  const dueDate = new Date(payment.dueDate);
  
  return now > dueDate;
}

/**
 * Helper function to calculate days until due
 */
export function getDaysUntilDue(payment: PaymentHistory): number {
  const now = new Date();
  const dueDate = new Date(payment.dueDate);
  const diff = dueDate.getTime() - now.getTime();
  
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Helper function to format payment amount
 */
export function formatPaymentAmount(centavos: number): string {
  const reais = centavos / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(reais);
}
