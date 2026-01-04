/**
 * SmartButton Component
 * 
 * A button with an optional count badge that typically navigates to related data.
 * Inspired by Odoo's smart buttons pattern.
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 */

import React from 'react';
import { cn } from '@/shared/utils/utils';
import { Loader2, type LucideIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';

// =============================================================================
// TYPES
// =============================================================================

export interface SmartButtonProps {
  /** Button label */
  label: string;
  /** Count to display (shows badge if >= 0) */
  count?: number;
  /** Icon to display */
  icon?: LucideIcon;
  /** Click handler */
  onClick?: () => void;
  /** Alternative: navigation href */
  href?: string;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Size variant */
  size?: 'sm' | 'md';
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * SmartButton displays a button with a count badge.
 * 
 * @example
 * <SmartButton
 *   label="Contratos"
 *   count={3}
 *   icon={FileText}
 *   onClick={() => navigate('/contracts?customerId=' + id)}
 * />
 * 
 * @example
 * // With loading state
 * <SmartButton
 *   label="Oportunidades"
 *   count={opportunitiesCount}
 *   icon={Target}
 *   loading={isLoading}
 *   onClick={handleClick}
 * />
 */
export function SmartButton({
  label,
  count,
  icon: Icon,
  onClick,
  href,
  loading = false,
  disabled = false,
  variant = 'secondary',
  size = 'md',
  className,
}: SmartButtonProps) {
  const buttonVariant = variant === 'primary' ? 'default' : variant;
  const buttonSize = size === 'sm' ? 'sm' : 'default';
  
  const hasCount = count !== undefined && count >= 0;
  const showLoader = loading;

  const handleClick = () => {
    if (href) {
      window.location.href = href;
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <Button
      variant={buttonVariant}
      size={buttonSize}
      onClick={handleClick}
      disabled={disabled || loading}
      className={cn(
        'relative gap-2',
        size === 'sm' ? 'h-8' : 'h-10',
        className
      )}
    >
      {/* Icon or loader */}
      {showLoader ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : Icon ? (
        <Icon className="h-4 w-4" />
      ) : null}

      {/* Label */}
      <span>{label}</span>

      {/* Count badge */}
      {hasCount && (
        <Badge
          variant={variant === 'primary' ? 'secondary' : 'default'}
          className={cn(
            'min-w-[1.25rem] h-5 px-1.5 justify-center',
            size === 'sm' && 'text-xs h-4 min-w-[1rem] px-1'
          )}
        >
          {count}
        </Badge>
      )}
    </Button>
  );
}

// Default export for convenience
export default SmartButton;
