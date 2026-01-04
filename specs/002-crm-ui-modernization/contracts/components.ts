/**
 * UI Components Contract
 * 
 * Defines the interface contracts for all design system components.
 * Implementation must satisfy these interfaces.
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 */

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { StatusEntityType, StatusValue } from './design-tokens';

// =============================================================================
// STATUS BADGE
// =============================================================================

/**
 * StatusBadge component props
 * 
 * @example
 * <StatusBadge type="lead" status="qualificado" />
 * <StatusBadge type="opportunity" status="proposta" variant="soft" />
 */
export interface StatusBadgeProps<T extends StatusEntityType = 'lead'> {
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
// TOOLBAR
// =============================================================================

/**
 * Toolbar root component props
 */
export interface ToolbarProps {
  children: ReactNode;
  className?: string;
}

/**
 * Toolbar.Search component props
 */
export interface ToolbarSearchProps {
  /** Controlled value */
  value?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Toolbar.Filters container props
 */
export interface ToolbarFiltersProps {
  children: ReactNode;
  className?: string;
}

/**
 * Available view modes
 */
export type ViewMode = 'list' | 'kanban' | 'cards' | 'calendar' | 'timeline';

/**
 * Toolbar.ViewSwitcher component props
 */
export interface ToolbarViewSwitcherProps {
  /** Available views to show */
  views: ViewMode[];
  /** Currently active view */
  activeView: ViewMode;
  /** View change handler */
  onViewChange: (view: ViewMode) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Toolbar.Actions container props
 */
export interface ToolbarActionsProps {
  children: ReactNode;
  className?: string;
}

// =============================================================================
// QUICK FILTERS
// =============================================================================

/**
 * Quick filter option configuration
 */
export interface QuickFilterOption {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Optional count to display */
  count?: number;
  /** Optional icon */
  icon?: LucideIcon;
  /** Custom color (CSS class or color value) */
  color?: string;
}

/**
 * QuickFilters component props
 * 
 * @example
 * <QuickFilters
 *   options={[
 *     { id: 'novo', label: 'Novos', count: 12 },
 *     { id: 'qualificado', label: 'Qualificados', count: 8 },
 *   ]}
 *   selected="novo"
 *   onChange={(id) => setFilter(id)}
 * />
 */
export interface QuickFiltersProps {
  /** Available filter options */
  options: QuickFilterOption[];
  /** Currently selected option(s) */
  selected?: string | string[];
  /** Selection change handler */
  onChange: (selected: string | string[]) => void;
  /** Allow multiple selections */
  multiple?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// FILTER CHIP
// =============================================================================

/**
 * Filter chip dropdown option
 */
export interface FilterChipOption {
  /** Option value */
  value: string;
  /** Display label */
  label: string;
  /** Optional count */
  count?: number;
}

/**
 * FilterChip component props
 * 
 * @example
 * <FilterChip
 *   label="Segmento"
 *   options={[
 *     { value: 'tech', label: 'Tecnologia', count: 45 },
 *     { value: 'retail', label: 'Varejo', count: 23 },
 *   ]}
 *   selected={selectedSegment}
 *   onChange={setSelectedSegment}
 * />
 */
export interface FilterChipProps {
  /** Chip label (displayed when collapsed) */
  label: string;
  /** Available options */
  options: FilterChipOption[];
  /** Currently selected value(s) */
  selected?: string | string[];
  /** Selection change handler */
  onChange: (selected: string | string[]) => void;
  /** Allow multiple selections */
  multiple?: boolean;
  /** Enable search within dropdown */
  searchable?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// STATS WIDGET
// =============================================================================

/**
 * Format types for stat values
 */
export type StatFormat = 'number' | 'currency' | 'percentage';

/**
 * Color variants for stats
 */
export type StatColor = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

/**
 * Individual stat item configuration
 */
export interface StatItem {
  /** Unique identifier */
  id: string;
  /** Stat label */
  label: string;
  /** Stat value (will be formatted according to format prop) */
  value: string | number;
  /** Change from previous period (percentage) */
  change?: number;
  /** Direction of change for styling */
  changeDirection?: 'up' | 'down' | 'neutral';
  /** Icon to display */
  icon?: LucideIcon;
  /** Color theme */
  color?: StatColor;
  /** Optional progress value (0-100) */
  progress?: number;
  /** Value format type */
  format?: StatFormat;
}

/**
 * StatsWidget component props
 * 
 * @example
 * <StatsWidget
 *   stats={[
 *     { id: 'total', label: 'Total Leads', value: 1234, change: 12, changeDirection: 'up' },
 *     { id: 'converted', label: 'Convertidos', value: 89, change: -5, changeDirection: 'down' },
 *   ]}
 *   layout="horizontal"
 * />
 */
export interface StatsWidgetProps {
  /** Array of stats to display */
  stats: StatItem[];
  /** Layout orientation */
  layout?: 'horizontal' | 'vertical';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show dividers between stats */
  showDividers?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// SMART BUTTON
// =============================================================================

/**
 * SmartButton component props (Odoo-style navigation buttons)
 * 
 * @example
 * <SmartButton
 *   label="Contratos"
 *   count={3}
 *   icon={FileText}
 *   onClick={() => navigate('/contracts?customerId=' + id)}
 * />
 */
export interface SmartButtonProps {
  /** Button label */
  label: string;
  /** Count to display (shows badge if > 0) */
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
// PAGE HEADER
// =============================================================================

/**
 * Breadcrumb navigation item
 */
export interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Navigation href (optional - last item typically has no href) */
  href?: string;
  /** Optional icon */
  icon?: LucideIcon;
}

/**
 * PageHeader component props
 * 
 * @example
 * <PageHeader
 *   title="Leads"
 *   breadcrumbs={[
 *     { label: 'Dashboard', href: '/dashboard' },
 *     { label: 'CRM', href: '/crm' },
 *     { label: 'Leads' },
 *   ]}
 *   stats={[
 *     { id: 'total', label: 'Total', value: 1234 },
 *   ]}
 *   actions={<Button>Novo Lead</Button>}
 * />
 */
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
// SCORE BADGE
// =============================================================================

/**
 * ScoreBadge component props
 * 
 * @example
 * <ScoreBadge score={85} showValue showLabel />
 */
export interface ScoreBadgeProps {
  /** Score value (0-100) */
  score: number;
  /** Show numeric value */
  showValue?: boolean;
  /** Show label (Baixo, Médio, Alto, Excelente) */
  showLabel?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// RELATIVE TIME
// =============================================================================

/**
 * RelativeTime component props
 * 
 * @example
 * <RelativeTime date={lead.updatedAt} prefix="Atualizado" />
 */
export interface RelativeTimeProps {
  /** Date to format */
  date: string | Date;
  /** Update interval in ms (0 = no live updates) */
  updateInterval?: number;
  /** Prefix text */
  prefix?: string;
  /** Show tooltip with full date on hover */
  showTooltip?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// VIEW CONFIGURATION
// =============================================================================

/**
 * View configuration for pages with multiple view modes
 */
export interface ViewConfig {
  /** View mode identifier */
  id: ViewMode;
  /** Display label */
  label: string;
  /** Icon for the view */
  icon: LucideIcon;
  /** Whether this view is enabled */
  enabled?: boolean;
}
