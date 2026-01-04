/**
 * PageHeader Component
 * 
 * A standardized page header that includes breadcrumbs, title, stats, and actions.
 * Provides consistent layout across all CRM pages.
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 */

import React, { ReactNode } from 'react';
import { cn } from '@/shared/utils/utils';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { StatsWidget, type StatItem } from './StatsWidget';

// =============================================================================
// TYPES
// =============================================================================

export interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Navigation href (optional - last item typically has no href) */
  href?: string;
  /** Optional icon */
  icon?: LucideIcon;
}

export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Breadcrumb navigation */
  breadcrumbs?: BreadcrumbItem[];
  /** Stats to display in compact widget */
  stats?: StatItem[];
  /** Action buttons (rendered on right side) */
  actions?: ReactNode;
  /** Page icon */
  icon?: LucideIcon;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// BREADCRUMBS COMPONENT
// =============================================================================

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-2">
      <ol className="flex items-center gap-1 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const Icon = item.icon;

          return (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              )}
              {item.href && !isLast ? (
                <a
                  href={item.href}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {item.label}
                </a>
              ) : (
                <span
                  className={cn(
                    'flex items-center gap-1',
                    isLast && 'text-foreground font-medium'
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// =============================================================================
// PAGE HEADER COMPONENT
// =============================================================================

/**
 * PageHeader provides a consistent header layout for CRM pages.
 * 
 * @example
 * <PageHeader
 *   title="Leads"
 *   subtitle="Gerencie sua base de leads"
 *   breadcrumbs={[
 *     { label: 'Dashboard', href: '/dashboard' },
 *     { label: 'CRM', href: '/crm' },
 *     { label: 'Leads' },
 *   ]}
 *   stats={[
 *     { id: 'total', label: 'Total', value: 1234 },
 *     { id: 'new', label: 'Novos', value: 45, color: 'primary' },
 *   ]}
 *   actions={
 *     <>
 *       <Button variant="outline">Importar</Button>
 *       <Button>Novo Lead</Button>
 *     </>
 *   }
 *   icon={Users}
 * />
 */
export function PageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  stats,
  actions,
  icon: Icon,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}

      {/* Header row: Title + Actions */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* Left: Title and subtitle */}
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Stats widget */}
      {stats && stats.length > 0 && (
        <StatsWidget stats={stats} size="sm" />
      )}
    </div>
  );
}

// Default export for convenience
export default PageHeader;
