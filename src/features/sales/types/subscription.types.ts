/**
 * Subscription Types
 * 
 * TypeScript interfaces for subscription management
 */

/**
 * Subscription status enum
 */
export enum SubscriptionStatus {
  /** In trial period */
  TRIALING = 'trialing',
  
  /** Active subscription with payments up to date */
  ACTIVE = 'active',
  
  /** Payment overdue */
  PAST_DUE = 'past_due',
  
  /** Subscription canceled */
  CANCELED = 'canceled',
  
  /** Subscription suspended (e.g., fraud) */
  SUSPENDED = 'suspended',
  
  /** Trial or subscription expired */
  EXPIRED = 'expired'
}

/**
 * Subscription interface
 */
export interface Subscription {
  /** Unique identifier */
  id: string;
  
  /** User ID */
  userId: string;
  
  /** Product/Plan ID */
  produtoId: string;
  
  /** License start date */
  dataInicio: string;
  
  /** License expiration date */
  dataExpiracao: string;
  
  /** Current license status */
  status: 'trial' | 'ativa' | 'expirada' | 'cancelada' | 'suspensa';
  
  /** License type */
  tipo: 'trial' | 'paga' | 'vitalicia';
  
  /** Amount paid (null for trial) */
  valorPago: number | null;
  
  /** Asaas payment ID */
  asaasPaymentId: string | null;
  
  /** Billing day (null for trial) */
  diaCobranca: number | null;
  
  /** Days remaining until expiration */
  diasRestantes: number;
  
  /** Whether the license is currently active */
  isActive: boolean;
  
  /** Whether the license is expiring soon */
  isExpirando: boolean;
  
  /** Status description (e.g., "Expirando em 6 dias") */
  descricaoStatus: string;
  
  /** Creation timestamp */
  createdAt: string;
  
  /** Last update timestamp */
  updatedAt: string;
  
  // Backward compatibility fields (optional)
  /** @deprecated Use userId */
  companyId?: string;
  /** @deprecated Use produtoId */
  productId?: string;
  /** @deprecated Use dataInicio */
  trialStart?: string | null;
  /** @deprecated Use dataExpiracao */
  trialEnd?: string | null;
  /** @deprecated Use dataExpiracao */
  nextDueDate?: string | null;
  /** @deprecated Use valorPago */
  amount?: number;
  /** Billing cycle */
  billingCycle?: string;
  /** @deprecated Use asaasPaymentId */
  asaasSubscriptionId?: string | null;
  /** Cancellation reason (if canceled) */
  cancellationReason?: string | null;
  /** Cancellation date */
  canceledAt?: string | null;
  /** Soft delete timestamp */
  deletedAt?: string | null;
}

/**
 * Subscription with relations
 */
export interface SubscriptionWithRelations extends Subscription {
  /** Related product */
  product?: {
    id: string;
    name: string;
    priceMonthly: number;
    features: string[];
    maxSessions: number;
    maxLeads: number | null;
  };
  
  /** Related company */
  company?: {
    id: string;
    name: string;
  };
}

/**
 * Create Trial Subscription DTO
 */
export interface CreateTrialSubscriptionDTO {
  /** Product ID to subscribe to */
  productId: string;
}

/**
 * Cancel Subscription DTO
 */
export interface CancelSubscriptionDTO {
  /** Optional cancellation reason */
  reason?: string;
}

/**
 * Subscription with computed fields
 */
export interface SubscriptionWithComputed extends Subscription {
  /** Whether subscription is currently in trial */
  isInTrial: boolean;
  
  /** Days remaining in trial (0 if not in trial) */
  daysRemainingInTrial: number;
  
  /** Whether subscription is active (trialing or active status) */
  isActive: boolean;
  
  /** Whether payment is overdue */
  isOverdue: boolean;
  
  /** Whether can be canceled */
  canCancel: boolean;
  
  /** Formatted next due date */
  formattedNextDueDate: string | null;
}

/**
 * Status badge colors
 */
export const SubscriptionStatusColors: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.TRIALING]: 'blue',
  [SubscriptionStatus.ACTIVE]: 'green',
  [SubscriptionStatus.PAST_DUE]: 'yellow',
  [SubscriptionStatus.CANCELED]: 'red',
  [SubscriptionStatus.SUSPENDED]: 'orange',
  [SubscriptionStatus.EXPIRED]: 'gray'
};

/**
 * Status labels in Portuguese
 */
export const SubscriptionStatusLabels: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.TRIALING]: 'Em período de teste',
  [SubscriptionStatus.ACTIVE]: 'Ativa',
  [SubscriptionStatus.PAST_DUE]: 'Pagamento atrasado',
  [SubscriptionStatus.CANCELED]: 'Cancelada',
  [SubscriptionStatus.SUSPENDED]: 'Suspensa',
  [SubscriptionStatus.EXPIRED]: 'Expirada'
};

/**
 * Helper function to check if subscription is in trial
 */
export function isTrialActive(subscription: Subscription): boolean {
  // Use new field names with fallback to old ones
  const status = subscription.status;
  const tipo = subscription.tipo;
  
  return (status === 'trial' || tipo === 'trial') && subscription.diasRestantes > 0;
}

/**
 * Helper function to calculate days remaining in trial
 */
export function getDaysRemainingInTrial(subscription: Subscription): number {
  // Use the diasRestantes field directly from API
  if (subscription.diasRestantes !== undefined) {
    return subscription.diasRestantes;
  }
  
  // Fallback to calculation for backward compatibility
  const expirationDate = subscription.dataExpiracao || subscription.trialEnd;
  if (!expirationDate) return 0;
  
  const now = new Date();
  const expiration = new Date(expirationDate);
  const diff = expiration.getTime() - now.getTime();
  
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Helper function to calculate next due date
 */
export function calculateNextDueDate(
  startDate: Date,
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
): Date {
  const nextDate = new Date(startDate);
  
  switch (billingCycle) {
    case 'MONTHLY':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'QUARTERLY':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'YEARLY':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }
  
  return nextDate;
}

/**
 * Helper function to check if subscription can be canceled
 */
export function canCancelSubscription(subscription: Subscription): boolean {
  // Check both new and old status formats
  const cancelableStatuses = ['trial', 'ativa', 'trialing', 'active', 'past_due'];
  
  // Convert status to lowercase for comparison
  const status = subscription.status?.toLowerCase();
  
  return cancelableStatuses.includes(status);
}
