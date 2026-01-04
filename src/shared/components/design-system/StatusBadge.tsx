/**
 * StatusBadge Component
 * 
 * Displays entity status with consistent colors, icons, and labels.
 * Supports lead, opportunity, campaign, contract, and customer statuses.
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 */

import React from 'react';
import { cn } from '@/shared/utils/utils';
import {
  leadStatusConfig,
  opportunityStatusConfig,
  campaignStatusConfig,
  contractStatusConfig,
  customerStatusConfig,
  type LeadStatus,
  type OpportunityStatus,
  type CampaignStatus,
  type ContractStatus,
  type CustomerStatus,
  type StatusConfig,
} from '@/config/design-tokens';
import type { LucideIcon } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

export type EntityType = 'lead' | 'opportunity' | 'campaign' | 'contract' | 'customer';

export type StatusValue<T extends EntityType> = 
  T extends 'lead' ? LeadStatus :
  T extends 'opportunity' ? OpportunityStatus :
  T extends 'campaign' ? CampaignStatus :
  T extends 'contract' ? ContractStatus :
  T extends 'customer' ? CustomerStatus :
  never;

export interface StatusBadgeProps<T extends EntityType = 'lead'> {
  /** Type of entity - determines available status values */
  type: T;
  /** Current status value (type-safe based on entity type) */
  status: StatusValue<T>;
  /** Visual variant */
  variant?: 'solid' | 'soft' | 'outline';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show icon alongside label */
  showIcon?: boolean;
  /** Custom icon override */
  icon?: LucideIcon;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// SIZE STYLES
// =============================================================================

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-sm gap-1.5',
  lg: 'px-3 py-1.5 text-base gap-2',
};

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

// =============================================================================
// VARIANT STYLES
// =============================================================================

function getVariantClasses(
  variant: 'solid' | 'soft' | 'outline',
  colors: StatusConfig['colors']
): string {
  switch (variant) {
    case 'solid':
      return `${colors.bg} ${colors.text}`;
    case 'soft':
      return `${colors.bg}/50 ${colors.text}`;
    case 'outline':
      return `bg-transparent border ${colors.border} ${colors.text}`;
    default:
      return `${colors.bg} ${colors.text}`;
  }
}

// =============================================================================
// CONFIG GETTER
// =============================================================================

function getStatusConfigByType<T extends EntityType>(
  type: T,
  status: StatusValue<T>
): StatusConfig | undefined {
  switch (type) {
    case 'lead':
      return leadStatusConfig[status as LeadStatus];
    case 'opportunity':
      return opportunityStatusConfig[status as OpportunityStatus];
    case 'campaign':
      return campaignStatusConfig[status as CampaignStatus];
    case 'contract':
      return contractStatusConfig[status as ContractStatus];
    case 'customer':
      return customerStatusConfig[status as CustomerStatus];
    default:
      return undefined;
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * StatusBadge displays the status of an entity with appropriate styling.
 * 
 * @example
 * // Lead status
 * <StatusBadge type="lead" status="qualificado" />
 * 
 * @example
 * // Opportunity status with outline variant
 * <StatusBadge type="opportunity" status="proposta" variant="outline" />
 * 
 * @example
 * // Campaign status without icon
 * <StatusBadge type="campaign" status="ativa" showIcon={false} />
 */
export function StatusBadge<T extends EntityType = 'lead'>({
  type,
  status,
  variant = 'soft',
  size = 'md',
  showIcon = true,
  icon: customIcon,
  className,
}: StatusBadgeProps<T>) {
  const config = getStatusConfigByType(type, status);
  
  if (!config) {
    console.warn(`StatusBadge: Unknown status "${status}" for type "${type}"`);
    return null;
  }

  const Icon = customIcon || config.icon;
  const variantClasses = getVariantClasses(variant, config.colors);

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        sizeClasses[size],
        variantClasses,
        className
      )}
    >
      {showIcon && Icon && (
        <Icon className={cn(iconSizes[size], 'shrink-0')} />
      )}
      {config.label}
    </span>
  );
}

// Default export for convenience
export default StatusBadge;
