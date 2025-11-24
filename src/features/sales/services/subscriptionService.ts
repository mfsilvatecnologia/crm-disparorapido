/**
 * Subscription Service
 * 
 * Business logic for subscription operations
 */

import { 
  Subscription,
  SubscriptionStatus,
  isTrialSubscription,
  getDaysRemainingInTrial,
  canCancelSubscription,
  SubscriptionStatusColors,
  SubscriptionStatusLabels
} from '../types';

/**
 * Get human-readable label for subscription status
 */
export function getStatusLabel(status: SubscriptionStatus): string {
  return SubscriptionStatusLabels[status];
}

/**
 * Get Tailwind CSS classes for subscription status color
 */
export function getStatusColor(status: SubscriptionStatus): string {
  const colors: Record<SubscriptionStatus, string> = {
    [SubscriptionStatus.TRIALING]: 'bg-blue-100 text-blue-800',
    [SubscriptionStatus.TRIAL]: 'bg-blue-100 text-blue-800',
    [SubscriptionStatus.TRIAL_EXPIRED]: 'bg-red-100 text-red-800',
    [SubscriptionStatus.ACTIVE]: 'bg-green-100 text-green-800',
    [SubscriptionStatus.ACTIVE_EN]: 'bg-green-100 text-green-800',
    [SubscriptionStatus.PAST_DUE]: 'bg-yellow-100 text-yellow-800',
    [SubscriptionStatus.CANCELED]: 'bg-red-100 text-red-800',
    [SubscriptionStatus.CANCELED_EN]: 'bg-red-100 text-red-800',
    [SubscriptionStatus.SUSPENDED]: 'bg-orange-100 text-orange-800',
    [SubscriptionStatus.SUSPENDED_EN]: 'bg-orange-100 text-orange-800',
    [SubscriptionStatus.EXPIRED]: 'bg-gray-100 text-gray-800',
    [SubscriptionStatus.EXPIRED_EN]: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Check if subscription is in good standing
 */
export function isSubscriptionActive(subscription: Subscription): boolean {
  return subscription.status === SubscriptionStatus.ACTIVE || 
         subscription.status === SubscriptionStatus.TRIALING;
}

/**
 * Check if subscription needs attention (payment issues)
 */
export function needsAttention(subscription: Subscription): boolean {
  return subscription.status === SubscriptionStatus.PAST_DUE || 
         subscription.status === SubscriptionStatus.SUSPENDED;
}

/**
 * Get subscription status priority (for sorting)
 */
export function getStatusPriority(status: SubscriptionStatus): number {
  const priorities: Record<SubscriptionStatus, number> = {
    [SubscriptionStatus.TRIAL_EXPIRED]: 0, // Most urgent - needs action
    [SubscriptionStatus.TRIALING]: 1,
    [SubscriptionStatus.TRIAL]: 1,
    [SubscriptionStatus.ACTIVE]: 2,
    [SubscriptionStatus.ACTIVE_EN]: 2,
    [SubscriptionStatus.PAST_DUE]: 3,
    [SubscriptionStatus.SUSPENDED]: 4,
    [SubscriptionStatus.SUSPENDED_EN]: 4,
    [SubscriptionStatus.CANCELED]: 5,
    [SubscriptionStatus.CANCELED_EN]: 5,
    [SubscriptionStatus.EXPIRED]: 6,
    [SubscriptionStatus.EXPIRED_EN]: 6
  };
  return priorities[status] ?? 999;
}

/**
 * Sort subscriptions by status priority
 */
export function sortByStatusPriority(subscriptions: Subscription[]): Subscription[] {
  return [...subscriptions].sort((a, b) =>
    getStatusPriority(a.status as SubscriptionStatus) - getStatusPriority(b.status as SubscriptionStatus)
  );
}

/**
 * Get days until next due date
 */
export function getDaysUntilDue(subscription: Subscription): number | null {
  if (!subscription.nextDueDate) return null;
  
  const now = new Date();
  const dueDate = new Date(subscription.nextDueDate);
  const diff = dueDate.getTime() - now.getTime();
  
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Check if payment is due soon (within 3 days)
 */
export function isPaymentDueSoon(subscription: Subscription): boolean {
  const days = getDaysUntilDue(subscription);
  return days !== null && days >= 0 && days <= 3;
}

/**
 * Check if payment is overdue
 */
export function isPaymentOverdue(subscription: Subscription): boolean {
  const days = getDaysUntilDue(subscription);
  return days !== null && days < 0;
}

/**
 * Filter active subscriptions
 */
export function filterActiveSubscriptions(subscriptions: Subscription[]): Subscription[] {
  return subscriptions.filter(isSubscriptionActive);
}

/**
 * Filter subscriptions needing attention
 */
export function filterSubscriptionsNeedingAttention(subscriptions: Subscription[]): Subscription[] {
  return subscriptions.filter(needsAttention);
}

/**
 * Group subscriptions by status
 */
export function groupByStatus(subscriptions: Subscription[]): Record<SubscriptionStatus, Subscription[]> {
  return subscriptions.reduce((acc, subscription) => {
    const status = subscription.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(subscription);
    return acc;
  }, {} as Record<SubscriptionStatus, Subscription[]>);
}

/**
 * Get subscription health score (0-100)
 */
export function getHealthScore(subscription: Subscription): number {
  let score = 100;
  const status = subscription.status;

  // Penalize based on status (using string literals matching Subscription interface)
  if (status === 'suspensa') score -= 50;
  if (status === 'cancelada') score = 0;
  if (status === 'expirada') score = 0;

  // Bonus for active trial
  if (status === 'trialing' || status === 'trial') {
    const daysRemaining = getDaysRemainingInTrial(subscription);
    if (daysRemaining && daysRemaining > 0) {
      score += 10;
    }
  }

  // Penalize if payment due soon
  if (isPaymentDueSoon(subscription)) score -= 10;

  // Penalize if payment overdue
  if (isPaymentOverdue(subscription)) score -= 20;

  return Math.max(0, Math.min(100, score));
}

/**
 * Get health score color
 */
export function getHealthScoreColor(score: number): string {
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  if (score >= 40) return 'orange';
  return 'red';
}

/**
 * Get recommendations for subscription
 */
export function getSubscriptionRecommendations(subscription: Subscription): string[] {
  const recommendations: string[] = [];
  const status = subscription.status;

  if (status === 'trialing' || status === 'trial') {
    const daysRemaining = getDaysRemainingInTrial(subscription);
    if (daysRemaining !== null && daysRemaining < 0) {
      recommendations.push('Período de teste expirado. Ative sua assinatura para continuar.');
    } else if (daysRemaining !== null && daysRemaining <= 3) {
      recommendations.push('Trial termina em breve. Configure método de pagamento.');
    }
  }

  if (status === 'suspensa') {
    recommendations.push('Assinatura suspensa. Regularize o pagamento para reativar.');
  }

  if (isPaymentDueSoon(subscription)) {
    recommendations.push('Próximo pagamento em breve. Verifique se tem saldo suficiente.');
  }

  return recommendations;
}
