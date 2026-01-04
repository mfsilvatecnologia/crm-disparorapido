/**
 * Design System Components
 * 
 * CRM-specific design components for LeadsRapido.
 * These components build on top of shadcn/ui primitives.
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 */

// Components
export { StatusBadge } from './StatusBadge';
export { ScoreBadge } from './ScoreBadge';
export { RelativeTime } from './RelativeTime';
export { StatsWidget } from './StatsWidget';
export { QuickFilters } from './QuickFilters';
export { FilterChip } from './FilterChip';
export { ViewSwitcher } from './ViewSwitcher';
export { Toolbar } from './Toolbar';
export { SmartButton } from './SmartButton';
export { PageHeader } from './PageHeader';

// Types
export type { StatusBadgeProps } from './StatusBadge';
export type { ScoreBadgeProps } from './ScoreBadge';
export type { RelativeTimeProps } from './RelativeTime';
export type { StatsWidgetProps, StatItem } from './StatsWidget';
export type { QuickFiltersProps, QuickFilterOption } from './QuickFilters';
export type { FilterChipProps, FilterChipOption } from './FilterChip';
export type { ViewSwitcherProps, ViewMode } from './ViewSwitcher';
export type { ToolbarProps } from './Toolbar';
export type { SmartButtonProps } from './SmartButton';
export type { PageHeaderProps, BreadcrumbItem } from './PageHeader';

// Re-export design tokens for convenience
export {
  leadStatusConfig,
  opportunityStatusConfig,
  campaignStatusConfig,
  contractStatusConfig,
  customerStatusConfig,
  scoreConfig,
  getScoreConfig,
  getScoreRange,
} from '@/config/design-tokens';

export type {
  LeadStatus,
  OpportunityStatus,
  CampaignStatus,
  ContractStatus,
  CustomerStatus,
  ScoreRange,
} from '@/config/design-tokens';
