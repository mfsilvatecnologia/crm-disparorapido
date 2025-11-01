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
  
  /** Legacy trial status */
  TRIAL = 'trial',
  
  /** Active subscription with payments up to date */
  ACTIVE = 'ativa',
  
  /** Legacy active status */
  ACTIVE_EN = 'active',
  
  /** Payment overdue */
  PAST_DUE = 'past_due',
  
  /** Subscription canceled */
  CANCELED = 'cancelada',
  
  /** Legacy canceled status */
  CANCELED_EN = 'canceled',
  
  /** Subscription suspended (e.g., fraud) */
  SUSPENDED = 'suspensa',
  
  /** Legacy suspended status */
  SUSPENDED_EN = 'suspended',
  
  /** Trial or subscription expired */
  EXPIRED = 'expirada',
  
  /** Legacy expired status */
  EXPIRED_EN = 'expired'
}

/**
 * Subscription interface
 */
/**
 * Subscription type matching the current API response
 */
export interface Subscription {
  /** Unique identifier */
  id: string;
  
  /** Company/Enterprise ID */
  empresaId: string;
  
  /** Product/Plan ID */
  produtoId: string;
  
  /** Asaas subscription ID */
  asaasSubscriptionId: string | null;
  
  /** Current subscription status */
  status: 'trialing' | 'trial' | 'ativa' | 'active' | 'expirada' | 'cancelada' | 'suspensa';
  
  /** Billing cycle */
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  
  /** Billing cycle description */
  billingCycleDescription: string;
  
  /** Subscription value */
  value: number;
  
  /** Formatted value string */
  valueFormatted: string;
  
  /** Whether subscription has trial */
  hasTrial: boolean;
  
  /** Trial days count */
  trialDays: number | null;
  
  /** Trial end date */
  trialEndDate: string | null;
  
  /** Whether currently in trial */
  isInTrial: boolean;
  
  /** Next due date */
  nextDueDate: string | null;
  
  /** First payment date */
  firstPaymentDate: string | null;
  
  /** Last payment date */
  lastPaymentDate: string | null;
  
  /** Maximum payments */
  maxPayments: number | null;
  
  /** Payments count */
  paymentsCount: number;
  
  /** Remaining payments */
  remainingPayments: number | null;
  
  /** Subscription description */
  description: string | null;
  
  /** External reference */
  externalReference: string | null;
  
  /** Metadata object */
  metadata: Record<string, any>;
  
  /** Start date */
  startDate: string;
  
  /** End date */
  endDate: string | null;
  
  /** Canceled date */
  canceledAt: string | null;
  
  /** Suspended date */
  suspendedAt: string | null;
  
  /** Creation timestamp */
  createdAt: string;
  
  /** Last update timestamp */
  updatedAt: string;
  
  // For backward compatibility and trial creation
  /** Asaas invoice URL for trial activation */
  asaasInvoiceUrl?: string | null;
  
  /** First charge date (after trial) */
  firstChargeDate?: string;
  
  /** Next steps instructions from API */
  nextSteps?: string[];
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
  [SubscriptionStatus.TRIAL]: 'blue',
  [SubscriptionStatus.ACTIVE]: 'green',
  [SubscriptionStatus.ACTIVE_EN]: 'green',
  [SubscriptionStatus.PAST_DUE]: 'yellow',
  [SubscriptionStatus.CANCELED]: 'red',
  [SubscriptionStatus.CANCELED_EN]: 'red',
  [SubscriptionStatus.SUSPENDED]: 'orange',
  [SubscriptionStatus.SUSPENDED_EN]: 'orange',
  [SubscriptionStatus.EXPIRED]: 'gray',
  [SubscriptionStatus.EXPIRED_EN]: 'gray'
};

/**
 * Status labels in Portuguese
 */
export const SubscriptionStatusLabels: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.TRIALING]: 'Em período de teste',
  [SubscriptionStatus.TRIAL]: 'Em período de teste',
  [SubscriptionStatus.ACTIVE]: 'Ativa',
  [SubscriptionStatus.ACTIVE_EN]: 'Ativa',
  [SubscriptionStatus.PAST_DUE]: 'Pagamento atrasado',
  [SubscriptionStatus.CANCELED]: 'Cancelada',
  [SubscriptionStatus.CANCELED_EN]: 'Cancelada',
  [SubscriptionStatus.SUSPENDED]: 'Suspensa',
  [SubscriptionStatus.SUSPENDED_EN]: 'Suspensa',
  [SubscriptionStatus.EXPIRED]: 'Expirada',
  [SubscriptionStatus.EXPIRED_EN]: 'Expirada'
};

/**
 * Helper function to check if subscription is in trial
 */
export function isTrialSubscription(subscription: Subscription): boolean {
  return subscription.isInTrial || subscription.status === 'trialing' || subscription.status === 'trial';
}

/**
 * Helper function to calculate days remaining in trial
 */
export function getDaysRemainingInTrial(subscription: Subscription): number {
  if (!subscription.trialEndDate) return 0;
  
  const now = new Date();
  const trialEnd = new Date(subscription.trialEndDate);
  const diff = trialEnd.getTime() - now.getTime();
  
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
