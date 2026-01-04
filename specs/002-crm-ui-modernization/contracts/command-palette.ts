/**
 * Command Palette Contract
 * 
 * Defines the interface for the global command palette and keyboard shortcuts.
 * Enables quick navigation and actions via Cmd+K / Ctrl+K.
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 */

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

// =============================================================================
// COMMAND CATEGORIES
// =============================================================================

/**
 * Command category for grouping in the palette
 */
export type CommandCategory = 
  | 'navigation'  // Navigate to pages (G+L, G+C, etc.)
  | 'action'      // Create, edit, delete actions (C+L, etc.)
  | 'search'      // Search results (leads, customers, etc.)
  | 'recent'      // Recently accessed items
  | 'settings';   // User preferences and settings

/**
 * Category display configuration
 */
export interface CategoryConfig {
  id: CommandCategory;
  label: string;
  icon?: LucideIcon;
  order: number;
}

// =============================================================================
// COMMAND ITEM
// =============================================================================

/**
 * Individual command item configuration
 */
export interface CommandItem {
  /** Unique command identifier */
  id: string;
  /** Display label */
  label: string;
  /** Optional description/subtitle */
  description?: string;
  /** Category for grouping */
  category: CommandCategory;
  /** Icon to display */
  icon?: LucideIcon;
  /** Keyboard shortcut hint (for display, e.g., "G L") */
  shortcut?: string;
  /** Command execution handler */
  onSelect: () => void;
  /** Additional search keywords */
  keywords?: string[];
  /** Whether command is currently disabled */
  disabled?: boolean;
  /** Priority for sorting within category (higher = first) */
  priority?: number;
}

/**
 * Command group (category with items)
 */
export interface CommandGroup {
  category: CategoryConfig;
  items: CommandItem[];
}

// =============================================================================
// KEYBOARD SHORTCUTS
// =============================================================================

/**
 * Keyboard shortcut configuration
 */
export interface KeyboardShortcut {
  /** Unique shortcut identifier */
  id: string;
  /** Key sequence (e.g., 'g l' for G then L, 'ctrl+k' for Ctrl+K) */
  keys: string;
  /** Human-readable description */
  description: string;
  /** Shortcut handler */
  handler: () => void;
  /** Scope restriction (page paths where shortcut is active) */
  scope?: string | string[];
  /** Whether to prevent default browser behavior */
  preventDefault?: boolean;
}

/**
 * Registered shortcut with metadata
 */
export interface RegisteredShortcut extends KeyboardShortcut {
  /** Source that registered this shortcut */
  source: string;
  /** Whether shortcut is currently active */
  active: boolean;
}

// =============================================================================
// COMMAND PALETTE STATE
// =============================================================================

/**
 * Command palette runtime state
 */
export interface CommandPaletteState {
  /** Whether palette is open */
  isOpen: boolean;
  /** Current search query */
  query: string;
  /** Registered commands */
  commands: CommandItem[];
  /** Registered keyboard shortcuts */
  shortcuts: RegisteredShortcut[];
  /** Whether shortcuts help overlay is visible */
  isHelpVisible: boolean;
  /** Currently focused command index */
  focusedIndex: number;
}

// =============================================================================
// COMMAND PALETTE CONTEXT
// =============================================================================

/**
 * Command palette context value (provided by CommandPaletteProvider)
 */
export interface CommandPaletteContextValue extends CommandPaletteState {
  // Palette control
  /** Open the command palette */
  open: () => void;
  /** Close the command palette */
  close: () => void;
  /** Toggle the command palette */
  toggle: () => void;
  
  // Search
  /** Update search query */
  setQuery: (query: string) => void;
  /** Get filtered commands based on current query */
  getFilteredCommands: () => CommandGroup[];
  
  // Command management
  /** Register a new command */
  registerCommand: (command: CommandItem) => void;
  /** Unregister a command by ID */
  unregisterCommand: (commandId: string) => void;
  /** Register multiple commands */
  registerCommands: (commands: CommandItem[]) => void;
  /** Clear all commands from a source */
  clearCommands: (source?: string) => void;
  
  // Shortcut management
  /** Register a keyboard shortcut */
  registerShortcut: (shortcut: KeyboardShortcut, source?: string) => void;
  /** Unregister a shortcut by ID */
  unregisterShortcut: (shortcutId: string) => void;
  /** Register multiple shortcuts */
  registerShortcuts: (shortcuts: KeyboardShortcut[], source?: string) => void;
  /** Clear all shortcuts from a source */
  clearShortcuts: (source?: string) => void;
  
  // Help overlay
  /** Show shortcuts help overlay */
  showHelp: () => void;
  /** Hide shortcuts help overlay */
  hideHelp: () => void;
  
  // Navigation
  /** Focus next command in list */
  focusNext: () => void;
  /** Focus previous command in list */
  focusPrev: () => void;
  /** Execute focused command */
  executeFocused: () => void;
}

// =============================================================================
// PROVIDER PROPS
// =============================================================================

/**
 * CommandPaletteProvider component props
 */
export interface CommandPaletteProviderProps {
  children: ReactNode;
  /** Initial commands to register */
  commands?: CommandItem[];
  /** Initial shortcuts to register */
  shortcuts?: KeyboardShortcut[];
  /** Key combination to open palette (default: 'ctrl+k' / 'meta+k') */
  openKey?: string;
  /** Key to show help (default: '?') */
  helpKey?: string;
}

// =============================================================================
// HOOK TYPES
// =============================================================================

/**
 * useCommandPalette hook return type
 */
export interface UseCommandPaletteReturn {
  /** Open the palette */
  open: () => void;
  /** Close the palette */
  close: () => void;
  /** Toggle the palette */
  toggle: () => void;
  /** Whether palette is open */
  isOpen: boolean;
  /** Register page-specific commands */
  registerCommands: (commands: CommandItem[]) => void;
}

/**
 * useKeyboardShortcuts hook options
 */
export interface UseKeyboardShortcutsOptions {
  /** Shortcuts to register */
  shortcuts: KeyboardShortcut[];
  /** Source identifier (for cleanup) */
  source?: string;
  /** Whether shortcuts are active */
  enabled?: boolean;
}

/**
 * useKeyboardShortcut hook for single shortcut
 */
export interface UseKeyboardShortcutOptions {
  /** Key sequence */
  keys: string;
  /** Handler function */
  handler: () => void;
  /** Whether shortcut is enabled */
  enabled?: boolean;
  /** Prevent default browser behavior */
  preventDefault?: boolean;
}

// =============================================================================
// PREDEFINED COMMANDS
// =============================================================================

/**
 * Default navigation command IDs
 */
export const NAV_COMMAND_IDS = {
  GO_TO_DASHBOARD: 'nav:dashboard',
  GO_TO_LEADS: 'nav:leads',
  GO_TO_CUSTOMERS: 'nav:customers',
  GO_TO_OPPORTUNITIES: 'nav:opportunities',
  GO_TO_CAMPAIGNS: 'nav:campaigns',
  GO_TO_CONTRACTS: 'nav:contracts',
  GO_TO_CONTACTS: 'nav:contacts',
  GO_TO_SETTINGS: 'nav:settings',
} as const;

/**
 * Default action command IDs
 */
export const ACTION_COMMAND_IDS = {
  CREATE_LEAD: 'action:create-lead',
  CREATE_CUSTOMER: 'action:create-customer',
  CREATE_OPPORTUNITY: 'action:create-opportunity',
  CREATE_CAMPAIGN: 'action:create-campaign',
  CREATE_CONTRACT: 'action:create-contract',
  CREATE_CONTACT: 'action:create-contact',
} as const;

/**
 * Default shortcut IDs
 */
export const SHORTCUT_IDS = {
  // Navigation sequences (G + key)
  GO_LEADS: 'g-l',
  GO_CUSTOMERS: 'g-c',
  GO_OPPORTUNITIES: 'g-o',
  GO_CAMPAIGNS: 'g-m',
  GO_CONTRACTS: 'g-t',
  GO_CONTACTS: 'g-n',
  GO_DASHBOARD: 'g-d',
  
  // Create actions (C + key)
  CREATE_LEAD: 'c-l',
  CREATE_CUSTOMER: 'c-c',
  CREATE_OPPORTUNITY: 'c-o',
  
  // Global
  OPEN_PALETTE: 'cmd-k',
  FOCUS_SEARCH: 'slash',
  SHOW_HELP: 'question',
  CLOSE_MODAL: 'escape',
} as const;

export type NavCommandId = typeof NAV_COMMAND_IDS[keyof typeof NAV_COMMAND_IDS];
export type ActionCommandId = typeof ACTION_COMMAND_IDS[keyof typeof ACTION_COMMAND_IDS];
export type ShortcutId = typeof SHORTCUT_IDS[keyof typeof SHORTCUT_IDS];
