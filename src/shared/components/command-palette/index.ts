/**
 * Command Palette Components
 * 
 * Global command palette and keyboard shortcuts for LeadsRapido CRM.
 * Enables quick navigation and actions via Cmd+K / Ctrl+K.
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 */

// Components
export { CommandPalette } from './CommandPalette';
export { CommandPaletteProvider } from './CommandPaletteProvider';
export { ShortcutsHelp } from './ShortcutsHelp';

// Hooks
export { useCommandPalette } from './useCommandPalette';
export { useKeyboardShortcuts } from './useKeyboardShortcuts';

// Types
export type {
  CommandItem,
  CommandCategory,
  CommandGroup,
  KeyboardShortcut,
  CommandPaletteState,
  UseCommandPaletteReturn,
} from './types';

// Constants
export {
  NAV_COMMAND_IDS,
  ACTION_COMMAND_IDS,
  SHORTCUT_IDS,
} from './constants';
