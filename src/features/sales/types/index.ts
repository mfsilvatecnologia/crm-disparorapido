/**
 * Types Export Index
 * Central export for all type definitions
 */

// Payment types
export type {
  PaymentStatus,
  PaymentMethod,
  Payment,
  PaymentListParams,
  PaginationMeta,
  PaymentListResponse,
  PaymentActionParams,
  PaymentActionResponse,
  PaymentDetailsResponse,
} from './payment.types';

// Credit types
export type {
  CreditTransactionType,
  RelatedEntityType,
  CreditTransaction,
  CreditTransactionListParams,
  CreditTransactionListResponse,
  CreditBalance,
} from './credit.types';

// Financial types
export type {
  FinancialSummaryParams,
  FinancialSummary,
} from './financial.types';

// Filter types
export type {
  PaymentFilters,
  CreditTransactionFilters,
  FinancialSummaryFilters,
} from './filters.types';

// Component props types
export type {
  PaymentCardProps,
  PaymentStatusBadgeProps,
  PaymentActionsProps,
  CreditTransactionCardProps,
  FinancialSummaryCardProps,
  PaginationProps,
} from './components.types';

// Type guards
export {
  isPayment,
  isCreditTransaction,
  isCorruptedPayment,
} from './guards';

// Product types
export {
  BillingCycle,
  BillingCycleLabels,
  type Product,
  type CreateProductDTO,
  type UpdateProductDTO,
  type ProductWithComputed,
  formatPrice,
  getBillingCycleLabel,
  getTrialLabel,
} from './product.types';

// Subscription types
export {
  SubscriptionStatus,
  SubscriptionStatusColors,
  SubscriptionStatusLabels,
  type Subscription,
  type SubscriptionWithRelations,
  type SubscriptionWithComputed,
  type CreateTrialSubscriptionDTO,
  type CancelSubscriptionDTO,
  isTrialActive,
  getDaysRemainingInTrial,
  calculateNextDueDate,
  canCancelSubscription,
} from './subscription.types';

// Lead/Marketplace types
export {
  MarketplaceStatus,
  AccessType,
  InterestLevel,
  MarketplaceStatusColors,
  MarketplaceStatusLabels,
  AccessTypeColors,
  AccessTypeLabels,
  type LeadSegmento,
  type Lead,
  type LeadFull,
  type LeadAccess,
  type LeadAccessWithComputed,
  type LeadWithAccess,
  type LeadSearchFilters,
  isAccessExpired,
  getDaysUntilExpiration,
  isViewLimitReached,
  getRemainingViews,
  canAccessLead,
  maskPhone,
  maskEmail,
} from './lead.types';

// Legacy types (for backwards compatibility)
export {
  LegacyPaymentStatus,
  LegacyPaymentMethod,
  type PaymentHistory,
  type PaymentHistoryWithRelations,
  type CreatePaymentDTO,
  type PaymentHistoryWithComputed,
  LegacyPaymentStatusColors,
  LegacyPaymentStatusLabels,
  LegacyPaymentMethodLabels,
  isPaymentOverdue,
  getDaysUntilDue,
  formatPaymentAmount,
} from './payment.types';
