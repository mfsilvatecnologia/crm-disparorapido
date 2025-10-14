import React from 'react';
import { useTenant } from '@/shared/contexts/TenantContext';
import { cn } from '@/shared/utils/utils';

interface TenantLogoProps {
  /** Logo variant to display */
  variant?: 'default' | 'light';
  /** Size of the logo */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Additional CSS classes */
  className?: string;
  /** Alt text for accessibility */
  alt?: string;
}

const sizeClasses = {
  sm: 'h-6',     // 24px
  md: 'h-8',     // 32px  
  lg: 'h-12',    // 48px
  xl: 'h-16',    // 64px
};

/**
 * TenantLogo Component
 * 
 * Displays the appropriate logo for the current tenant.
 * Automatically switches between default and light variants based on usage context.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <TenantLogo />
 * 
 * // With size and variant
 * <TenantLogo size="lg" variant="light" />
 * 
 * // With custom styling
 * <TenantLogo className="mx-auto" size="xl" />
 * ```
 */
export function TenantLogo({ 
  variant = 'default', 
  size = 'md', 
  className,
  alt
}: TenantLogoProps) {
  const { tenant } = useTenant();

  // Determine logo source based on variant
  const logoSrc = variant === 'light' && tenant.branding.logoLight 
    ? tenant.branding.logoLight 
    : tenant.branding.logo;

  // Generate alt text if not provided
  const logoAlt = alt || `${tenant.branding.companyName} Logo`;

  return (
    <img
      src={logoSrc}
      alt={logoAlt}
      className={cn(
        'w-auto object-contain',
        sizeClasses[size],
        className
      )}
      onError={(e) => {
        // Fallback to default logo if light variant fails to load
        if (variant === 'light' && tenant.branding.logoLight) {
          const target = e.target as HTMLImageElement;
          target.src = tenant.branding.logo;
        }
      }}
    />
  );
}

/**
 * TenantLogoWithText Component
 * 
 * Displays logo with company name and tagline text.
 * Useful for hero sections and branding areas.
 */
interface TenantLogoWithTextProps extends Omit<TenantLogoProps, 'alt'> {
  /** Show company tagline */
  showTagline?: boolean;
  /** Text alignment */
  textAlign?: 'left' | 'center' | 'right';
  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
}

export function TenantLogoWithText({
  variant = 'default',
  size = 'lg',
  className,
  showTagline = true,
  textAlign = 'left',
  direction = 'horizontal'
}: TenantLogoWithTextProps) {
  const { tenant } = useTenant();

  const containerClasses = cn(
    'flex items-center',
    direction === 'vertical' ? 'flex-col space-y-2' : 'space-x-3',
    textAlign === 'center' && 'justify-center text-center',
    textAlign === 'right' && 'justify-end text-right',
    className
  );

  const textContainerClasses = cn(
    'flex flex-col',
    textAlign === 'center' && 'items-center',
    textAlign === 'right' && 'items-end'
  );

  return (
    <div className={containerClasses}>
      <TenantLogo 
        variant={variant} 
        size={size}
        alt={`${tenant.branding.companyName} Logo`}
      />
      
      <div className={textContainerClasses}>
        <h1 className="font-bold text-lg leading-tight">
          {tenant.branding.companyName}
        </h1>
        {showTagline && (
          <p className="text-sm text-muted-foreground">
            {tenant.branding.companyTagline}
          </p>
        )}
      </div>
    </div>
  );
}

export default TenantLogo;