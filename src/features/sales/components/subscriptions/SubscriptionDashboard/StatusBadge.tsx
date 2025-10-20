import { SubscriptionStatus } from '../../../types/subscription.types';
import { getStatusLabel, getStatusColor } from '../../../services/subscriptionService';

// Status values from API (Portuguese)
type ApiStatus = 'trial' | 'trialing' | 'ativa' | 'expirada' | 'cancelada' | 'suspensa';

interface StatusBadgeProps {
  status: SubscriptionStatus | ApiStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

// Helper to convert API status to SubscriptionStatus enum
function normalizeStatus(status: SubscriptionStatus | ApiStatus): SubscriptionStatus {
  const statusMap: Record<string, SubscriptionStatus> = {
    'trial': SubscriptionStatus.TRIALING,
    'trialing': SubscriptionStatus.TRIALING,
    'ativa': SubscriptionStatus.ACTIVE,
    'expirada': SubscriptionStatus.EXPIRED,
    'cancelada': SubscriptionStatus.CANCELED,
    'suspensa': SubscriptionStatus.SUSPENDED,
  };
  
  // If it's already a SubscriptionStatus enum value, return it
  if (Object.values(SubscriptionStatus).includes(status as SubscriptionStatus)) {
    return status as SubscriptionStatus;
  }
  
  // Otherwise, map from API status
  return statusMap[status as ApiStatus] || SubscriptionStatus.ACTIVE;
}

export function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const normalizedStatus = normalizeStatus(status);
  const label = getStatusLabel(normalizedStatus);
  const colorClasses = getStatusColor(normalizedStatus);

  // Tamanhos
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  // Ícones por status
  const icons: Record<SubscriptionStatus, JSX.Element> = {
    [SubscriptionStatus.TRIALING]: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    [SubscriptionStatus.TRIAL]: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    [SubscriptionStatus.ACTIVE]: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    [SubscriptionStatus.ACTIVE_EN]: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    [SubscriptionStatus.PAST_DUE]: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    [SubscriptionStatus.CANCELED]: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    [SubscriptionStatus.CANCELED_EN]: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    [SubscriptionStatus.SUSPENDED]: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
        />
      </svg>
    ),
    [SubscriptionStatus.SUSPENDED_EN]: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
        />
      </svg>
    ),
    [SubscriptionStatus.EXPIRED]: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    [SubscriptionStatus.EXPIRED_EN]: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${sizeClasses[size]}
        ${colorClasses}
      `}
      role="status"
      aria-label={`Status: ${label}`}
    >
      {showIcon && icons[normalizedStatus]}
      <span>{label}</span>
    </span>
  );
}
