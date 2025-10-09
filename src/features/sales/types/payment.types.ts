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
export type PaymentStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

/**
 * Payment Method
 * - credit_card: Credit or debit card payment
 * - pix: Brazilian instant payment system
 * - boleto: Brazilian bank slip payment
 */
export type PaymentMethod =
  | 'credit_card'
  | 'pix'
  | 'boleto';

/**
 * Payment Entity
 * Represents a single payment transaction
 */
export interface Payment {
  id: string;
  amount: number;                    // Amount in cents (e.g., 9900 = R$ 99,00)
  status: PaymentStatus;
  method: PaymentMethod;
  createdAt: string;                 // ISO 8601 datetime
  updatedAt: string;                 // ISO 8601 datetime
  description: string;               // Human-readable description
  subscriptionId?: string;           // Related subscription (if applicable)
  metadata?: Record<string, unknown>; // Additional custom data
}

/**
 * Payment List Query Parameters
 * Used for filtering and pagination
 */
export interface PaymentListParams {
  page?: number;                     // Page number (1-indexed)
  limit?: number;                    // Items per page (default: 10)
  status?: PaymentStatus;            // Filter by payment status
  startDate?: string;                // Filter by date range start (ISO 8601)
  endDate?: string;                  // Filter by date range end (ISO 8601)
}

/**
 * Pagination Metadata
 * Standard pagination response structure
 */
export interface PaginationMeta {
  currentPage: number;               // Current page number
  totalPages: number;                // Total number of pages
  totalItems: number;                // Total number of items
  itemsPerPage: number;              // Items per page
}

/**
 * Payment List Response
 * Backend API response for GET /api/payments
 */
export interface PaymentListResponse {
  payments: Payment[];
  pagination: PaginationMeta;
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
 * Backend API response for GET /api/payments/:id
 */
export interface PaymentDetailsResponse extends Payment {
  // Additional fields for detailed view (if any)
  transactionId?: string;            // External transaction ID (e.g., from payment gateway)
  receiptUrl?: string;               // URL to payment receipt
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
  paymentMethod?: PaymentMethod;
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
  if (payment.status === PaymentStatus.RECEIVED || 
      payment.status === PaymentStatus.REFUNDED) {
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
