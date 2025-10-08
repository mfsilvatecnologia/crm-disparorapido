/**
 * Payment Types
 * 
 * TypeScript interfaces for payment history and transactions
 */

/**
 * Payment status enum
 */
export enum PaymentStatus {
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
 * Payment method enum
 */
export enum PaymentMethod {
  /** Credit card */
  CREDIT_CARD = 'CREDIT_CARD',
  
  /** Bank slip (boleto) */
  BOLETO = 'BOLETO',
  
  /** PIX instant payment */
  PIX = 'PIX'
}

/**
 * Payment History interface
 */
export interface PaymentHistory {
  /** Unique identifier */
  id: string;
  
  /** Related subscription ID */
  subscriptionId: string;
  
  /** Payment amount in centavos */
  amount: number;
  
  /** Payment status */
  status: PaymentStatus;
  
  /** Payment method used */
  paymentMethod: PaymentMethod | null;
  
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
 * Payment status colors
 */
export const PaymentStatusColors: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'yellow',
  [PaymentStatus.CONFIRMED]: 'blue',
  [PaymentStatus.RECEIVED]: 'green',
  [PaymentStatus.OVERDUE]: 'red',
  [PaymentStatus.REFUNDED]: 'gray'
};

/**
 * Payment status labels in Portuguese
 */
export const PaymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Pendente',
  [PaymentStatus.CONFIRMED]: 'Confirmado',
  [PaymentStatus.RECEIVED]: 'Recebido',
  [PaymentStatus.OVERDUE]: 'Atrasado',
  [PaymentStatus.REFUNDED]: 'Reembolsado'
};

/**
 * Payment method labels in Portuguese
 */
export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CREDIT_CARD]: 'Cartão de Crédito',
  [PaymentMethod.BOLETO]: 'Boleto Bancário',
  [PaymentMethod.PIX]: 'PIX'
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
