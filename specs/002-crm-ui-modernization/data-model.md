# Data Model: Modernização UI/UX do CRM

**Branch**: `002-crm-ui-modernization` | **Date**: 2026-01-03 | **Phase**: 1
**Input**: Feature specification + Research decisions

---

## 1. Design Tokens

### 1.1 Color Tokens

```typescript
// src/config/design-tokens.ts

/**
 * Status colors for CRM entities
 * Maps to CSS variables and Tailwind classes
 */
export const statusColors = {
  // Lead Status
  lead: {
    novo: { bg: 'bg-primary-100', text: 'text-primary-700', border: 'border-primary-500' },
    qualificado: { bg: 'bg-success-100', text: 'text-success-700', border: 'border-success-500' },
    contatado: { bg: 'bg-warning-100', text: 'text-warning-700', border: 'border-warning-500' },
    convertido: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-500' },
    descartado: { bg: 'bg-danger-100', text: 'text-danger-700', border: 'border-danger-500' },
  },
  // Opportunity Status
  opportunity: {
    prospeccao: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-500' },
    qualificacao: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-500' },
    proposta: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-500' },
    negociacao: { bg: 'bg-warning-100', text: 'text-warning-700', border: 'border-warning-500' },
    fechado_ganho: { bg: 'bg-success-100', text: 'text-success-700', border: 'border-success-500' },
    fechado_perdido: { bg: 'bg-danger-100', text: 'text-danger-700', border: 'border-danger-500' },
  },
  // Campaign Status
  campaign: {
    rascunho: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-400' },
    agendada: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-500' },
    ativa: { bg: 'bg-success-100', text: 'text-success-700', border: 'border-success-500' },
    pausada: { bg: 'bg-warning-100', text: 'text-warning-700', border: 'border-warning-500' },
    concluida: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-400' },
  },
  // Contract Status
  contract: {
    ativo: { bg: 'bg-success-100', text: 'text-success-700', border: 'border-success-500' },
    inativo: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-400' },
    suspenso: { bg: 'bg-warning-100', text: 'text-warning-700', border: 'border-warning-500' },
    cancelado: { bg: 'bg-danger-100', text: 'text-danger-700', border: 'border-danger-500' },
  },
} as const;

/**
 * Score color ranges for qualification badges
 */
export const scoreColors = {
  low: { range: [0, 50], color: 'danger', label: 'Baixo' },
  medium: { range: [51, 70], color: 'warning', label: 'Médio' },
  high: { range: [71, 89], color: 'info', label: 'Alto' },
  excellent: { range: [90, 100], color: 'success', label: 'Excelente' },
} as const;

/**
 * Spacing scale (4px base)
 */
export const spacing = {
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
} as const;
```

---

## 2. Component Types

### 2.1 StatusBadge

```typescript
// src/shared/components/design-system/types/status-badge.ts

import { LucideIcon } from 'lucide-react';

export type LeadStatus = 'novo' | 'qualificado' | 'contatado' | 'convertido' | 'descartado';
export type OpportunityStatus = 'prospeccao' | 'qualificacao' | 'proposta' | 'negociacao' | 'fechado_ganho' | 'fechado_perdido';
export type CampaignStatus = 'rascunho' | 'agendada' | 'ativa' | 'pausada' | 'concluida';
export type ContractStatus = 'ativo' | 'inativo' | 'suspenso' | 'cancelado';
export type CustomerStatus = 'ativo' | 'inativo' | 'prospecto' | 'churned';

export type StatusType = 'lead' | 'opportunity' | 'campaign' | 'contract' | 'customer';

export type StatusValue<T extends StatusType> = 
  T extends 'lead' ? LeadStatus :
  T extends 'opportunity' ? OpportunityStatus :
  T extends 'campaign' ? CampaignStatus :
  T extends 'contract' ? ContractStatus :
  T extends 'customer' ? CustomerStatus :
  never;

export interface StatusBadgeProps<T extends StatusType = 'lead'> {
  /** Type of entity (determines status options) */
  type: T;
  /** Current status value */
  status: StatusValue<T>;
  /** Visual variant */
  variant?: 'solid' | 'soft' | 'outline';
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Show icon alongside text */
  showIcon?: boolean;
  /** Custom icon override */
  icon?: LucideIcon;
  /** Additional CSS classes */
  className?: string;
}

export interface StatusConfig {
  label: string;
  icon: LucideIcon;
  colors: {
    bg: string;
    text: string;
    border: string;
  };
}
```

### 2.2 Toolbar

```typescript
// src/shared/components/design-system/types/toolbar.ts

import { ReactNode } from 'react';

export type ViewMode = 'list' | 'kanban' | 'cards' | 'calendar' | 'timeline';

export interface ToolbarProps {
  children: ReactNode;
  className?: string;
}

export interface ToolbarSearchProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export interface ToolbarFiltersProps {
  children: ReactNode;
  className?: string;
}

export interface ToolbarViewSwitcherProps {
  views: ViewMode[];
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

export interface ToolbarActionsProps {
  children: ReactNode;
  className?: string;
}
```

### 2.3 QuickFilters & FilterChip

```typescript
// src/shared/components/design-system/types/filters.ts

export interface QuickFilterOption {
  id: string;
  label: string;
  count?: number;
  icon?: LucideIcon;
  color?: string;
}

export interface QuickFiltersProps {
  options: QuickFilterOption[];
  selected?: string | string[];
  onChange: (selected: string | string[]) => void;
  multiple?: boolean;
  className?: string;
}

export interface FilterChipOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterChipProps {
  label: string;
  options: FilterChipOption[];
  selected?: string | string[];
  onChange: (selected: string | string[]) => void;
  multiple?: boolean;
  searchable?: boolean;
  className?: string;
}
```

### 2.4 StatsWidget

```typescript
// src/shared/components/design-system/types/stats-widget.ts

import { LucideIcon } from 'lucide-react';

export interface StatItem {
  id: string;
  label: string;
  value: string | number;
  /** Change from previous period (percentage) */
  change?: number;
  /** Direction of change for styling */
  changeDirection?: 'up' | 'down' | 'neutral';
  /** Icon to display */
  icon?: LucideIcon;
  /** Color theme */
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  /** Optional progress value (0-100) */
  progress?: number;
  /** Format type for value */
  format?: 'number' | 'currency' | 'percentage';
}

export interface StatsWidgetProps {
  stats: StatItem[];
  /** Layout orientation */
  layout?: 'horizontal' | 'vertical';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show dividers between stats */
  showDividers?: boolean;
  className?: string;
}
```

### 2.5 SmartButton

```typescript
// src/shared/components/design-system/types/smart-button.ts

import { LucideIcon } from 'lucide-react';

export interface SmartButtonProps {
  /** Label for the button */
  label: string;
  /** Count to display (optional) */
  count?: number;
  /** Icon to display */
  icon?: LucideIcon;
  /** Click handler - typically navigates somewhere */
  onClick?: () => void;
  /** Link destination (alternative to onClick) */
  href?: string;
  /** Show loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Size */
  size?: 'sm' | 'md';
  className?: string;
}
```

### 2.6 PageHeader

```typescript
// src/shared/components/design-system/types/page-header.ts

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { StatItem } from './stats-widget';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: LucideIcon;
}

export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Breadcrumb navigation items */
  breadcrumbs?: BreadcrumbItem[];
  /** Stats to display in compact widget */
  stats?: StatItem[];
  /** Action buttons (right side) */
  actions?: ReactNode;
  /** Icon for the page */
  icon?: LucideIcon;
  className?: string;
}
```

### 2.7 ScoreBadge

```typescript
// src/shared/components/design-system/types/score-badge.ts

export type ScoreRange = 'low' | 'medium' | 'high' | 'excellent';

export interface ScoreBadgeProps {
  /** Score value (0-100) */
  score: number;
  /** Show numeric value */
  showValue?: boolean;
  /** Show label (Baixo, Médio, Alto, Excelente) */
  showLabel?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function getScoreRange(score: number): ScoreRange {
  if (score <= 50) return 'low';
  if (score <= 70) return 'medium';
  if (score <= 89) return 'high';
  return 'excellent';
}
```

### 2.8 RelativeTime

```typescript
// src/shared/components/design-system/types/relative-time.ts

export interface RelativeTimeProps {
  /** Date to format (ISO string or Date object) */
  date: string | Date;
  /** Update interval in ms (0 = no updates) */
  updateInterval?: number;
  /** Prefix text (e.g., "Atualizado") */
  prefix?: string;
  /** Show tooltip with full date */
  showTooltip?: boolean;
  className?: string;
}
```

---

## 3. Tour System Types

```typescript
// src/shared/components/tour/types.ts

export interface TourStep {
  /** Unique step ID */
  id: string;
  /** CSS selector for target element */
  target: string;
  /** Tooltip title */
  title: string;
  /** Tooltip content (can be ReactNode) */
  content: React.ReactNode;
  /** Tooltip position relative to target */
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  /** Actions for this step */
  actions?: {
    primary?: { label: string; onClick?: () => void };
    secondary?: { label: string; onClick?: () => void };
  };
  /** Callback when step becomes active */
  onActivate?: () => void;
  /** Callback before leaving step */
  beforeLeave?: () => boolean | Promise<boolean>;
}

export interface TourConfig {
  /** Unique tour ID (for localStorage persistence) */
  id: string;
  /** Display name for the tour */
  name: string;
  /** Tour steps */
  steps: TourStep[];
  /** Show on first visit automatically */
  autoStart?: boolean;
  /** Callback when tour completes */
  onComplete?: () => void;
  /** Callback when tour is skipped */
  onSkip?: () => void;
}

export interface TourState {
  /** Currently active tour ID */
  activeTour: string | null;
  /** Current step index */
  currentStep: number;
  /** Set of completed tour IDs */
  completedTours: Set<string>;
  /** Whether overlay is visible */
  isOverlayVisible: boolean;
}

export interface TourContextValue extends TourState {
  /** Start a tour by ID */
  startTour: (tourId: string) => void;
  /** Go to next step */
  nextStep: () => void;
  /** Go to previous step */
  prevStep: () => void;
  /** Skip current tour */
  skipTour: () => void;
  /** Complete current tour */
  completeTour: () => void;
  /** Check if tour was completed */
  isTourCompleted: (tourId: string) => boolean;
  /** Reset a tour (allow replay) */
  resetTour: (tourId: string) => void;
  /** Register a tour configuration */
  registerTour: (config: TourConfig) => void;
}
```

---

## 4. Command Palette Types

```typescript
// src/shared/components/command-palette/types.ts

import { LucideIcon } from 'lucide-react';

export type CommandCategory = 
  | 'navigation'  // Go to pages
  | 'action'      // Create, edit, delete
  | 'search'      // Search results
  | 'recent'      // Recently accessed
  | 'settings';   // User settings

export interface CommandItem {
  /** Unique command ID */
  id: string;
  /** Display label */
  label: string;
  /** Optional description */
  description?: string;
  /** Category for grouping */
  category: CommandCategory;
  /** Icon to display */
  icon?: LucideIcon;
  /** Keyboard shortcut hint (display only) */
  shortcut?: string;
  /** Command handler */
  onSelect: () => void;
  /** Search keywords (in addition to label) */
  keywords?: string[];
  /** Whether command is currently disabled */
  disabled?: boolean;
}

export interface CommandGroup {
  id: CommandCategory;
  label: string;
  items: CommandItem[];
}

export interface KeyboardShortcut {
  /** Unique shortcut ID */
  id: string;
  /** Key combination (e.g., 'g l' for G then L) */
  keys: string;
  /** Description for help overlay */
  description: string;
  /** Handler function */
  handler: () => void;
  /** Only active on specific pages */
  scope?: string | string[];
}

export interface CommandPaletteState {
  /** Whether palette is open */
  isOpen: boolean;
  /** Current search query */
  query: string;
  /** Registered commands */
  commands: CommandItem[];
  /** Registered keyboard shortcuts */
  shortcuts: KeyboardShortcut[];
}

export interface CommandPaletteContextValue extends CommandPaletteState {
  /** Open command palette */
  open: () => void;
  /** Close command palette */
  close: () => void;
  /** Toggle command palette */
  toggle: () => void;
  /** Update search query */
  setQuery: (query: string) => void;
  /** Register a command */
  registerCommand: (command: CommandItem) => void;
  /** Unregister a command */
  unregisterCommand: (commandId: string) => void;
  /** Register a keyboard shortcut */
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  /** Show shortcuts help overlay */
  showShortcutsHelp: () => void;
}
```

---

## 5. Entity Extensions

### 5.1 Contact (New standalone page)

```typescript
// src/features/contacts/types/contact.ts

export interface Contact {
  id: string;
  /** Contact's full name */
  nome: string;
  /** Job title */
  cargo?: string;
  /** Department */
  departamento?: string;
  /** Email address */
  email?: string;
  /** Email verified status */
  emailVerified?: boolean;
  /** Phone number */
  telefone?: string;
  /** LinkedIn profile URL */
  linkedinUrl?: string;
  /** Whether this is the primary contact */
  isPrimary: boolean;
  /** Associated customer ID */
  customerId?: string;
  /** Associated customer name (for display) */
  customerName?: string;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

export interface ContactFilters {
  search?: string;
  customerId?: string;
  cargo?: string;
  departamento?: string;
  isPrimary?: boolean;
  page?: number;
  limit?: number;
}
```

### 5.2 Contract (Complete implementation)

```typescript
// src/features/contracts/types/contract.ts

export type ContractStatus = 'ativo' | 'inativo' | 'suspenso' | 'cancelado';
export type ContractPeriodicity = 'mensal' | 'trimestral' | 'semestral' | 'anual';

export interface Contract {
  id: string;
  /** Contract number/code */
  numero: string;
  /** Associated customer ID */
  customerId: string;
  /** Associated customer name (for display) */
  customerName?: string;
  /** Contract type (e.g., 'SaaS', 'Consultoria') */
  tipo: string;
  /** Total contract value */
  valorTotal: number;
  /** Monthly Recurring Revenue (calculated) */
  mrr: number;
  /** Contract start date */
  dataInicio: string;
  /** Contract renewal/end date */
  dataRenovacao: string;
  /** Payment periodicity */
  periodicidade: ContractPeriodicity;
  /** Current status */
  status: ContractStatus;
  /** Notes/observations */
  observacoes?: string;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

export interface ContractFilters {
  search?: string;
  customerId?: string;
  status?: ContractStatus;
  tipo?: string;
  renovatingInDays?: number; // Contracts renewing in N days
  page?: number;
  limit?: number;
}

/**
 * Calculate MRR based on total value and periodicity
 */
export function calculateMRR(valorTotal: number, periodicidade: ContractPeriodicity): number {
  switch (periodicidade) {
    case 'mensal': return valorTotal;
    case 'trimestral': return valorTotal / 3;
    case 'semestral': return valorTotal / 6;
    case 'anual': return valorTotal / 12;
    default: return valorTotal;
  }
}

/**
 * Calculate contract progress (percentage of period elapsed)
 */
export function calculateContractProgress(dataInicio: string, dataRenovacao: string): number {
  const start = new Date(dataInicio).getTime();
  const end = new Date(dataRenovacao).getTime();
  const now = Date.now();
  
  if (now <= start) return 0;
  if (now >= end) return 100;
  
  return Math.round(((now - start) / (end - start)) * 100);
}
```

---

## 6. View Types

```typescript
// src/shared/types/views.ts

export type ViewMode = 'list' | 'kanban' | 'cards' | 'calendar' | 'timeline';

export interface ViewConfig {
  id: ViewMode;
  label: string;
  icon: LucideIcon;
  /** Whether this view is available for the page */
  enabled?: boolean;
}

export const defaultViewConfigs: Record<ViewMode, Omit<ViewConfig, 'enabled'>> = {
  list: { id: 'list', label: 'Lista', icon: List },
  kanban: { id: 'kanban', label: 'Kanban', icon: Kanban },
  cards: { id: 'cards', label: 'Cards', icon: Grid3X3 },
  calendar: { id: 'calendar', label: 'Calendário', icon: Calendar },
  timeline: { id: 'timeline', label: 'Timeline', icon: GitBranch },
};
```

---

## Summary

| Entity/Component | Location | Status |
|------------------|----------|--------|
| Design Tokens | `src/config/design-tokens.ts` | New file |
| StatusBadge | `src/shared/components/design-system/` | New component |
| Toolbar | `src/shared/components/design-system/` | New component |
| QuickFilters | `src/shared/components/design-system/` | New component |
| FilterChip | `src/shared/components/design-system/` | New component |
| StatsWidget | `src/shared/components/design-system/` | New component |
| SmartButton | `src/shared/components/design-system/` | New component |
| PageHeader | `src/shared/components/design-system/` | New component |
| ScoreBadge | `src/shared/components/design-system/` | New component |
| RelativeTime | `src/shared/components/design-system/` | New component |
| Tour System | `src/shared/components/tour/` | New feature |
| Command Palette | `src/shared/components/command-palette/` | New feature |
| Contact | `src/features/contacts/types/` | Extend existing |
| Contract | `src/features/contracts/types/` | Extend existing |

---

*Data model completed: 2026-01-03*
