/**
 * Tour System Contract
 * 
 * Defines the interface for the feature tour/onboarding system.
 * Used for guided walkthroughs of new features.
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 */

import type { ReactNode } from 'react';

// =============================================================================
// TOUR STEP
// =============================================================================

/**
 * Position of tooltip relative to target element
 */
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

/**
 * Action button configuration for a tour step
 */
export interface TourStepAction {
  /** Button label */
  label: string;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Configuration for a single tour step
 */
export interface TourStep {
  /** Unique step identifier */
  id: string;
  /** CSS selector for target element to highlight */
  target: string;
  /** Tooltip title */
  title: string;
  /** Tooltip content (supports ReactNode for rich content) */
  content: ReactNode;
  /** Tooltip position relative to target */
  position?: TooltipPosition;
  /** Custom actions for this step */
  actions?: {
    primary?: TourStepAction;
    secondary?: TourStepAction;
  };
  /** Callback when this step becomes active */
  onActivate?: () => void;
  /** Callback before leaving this step (return false to prevent) */
  beforeLeave?: () => boolean | Promise<boolean>;
  /** Whether to scroll target into view */
  scrollIntoView?: boolean;
  /** Delay before showing this step (ms) */
  delay?: number;
}

// =============================================================================
// TOUR CONFIGURATION
// =============================================================================

/**
 * Complete tour configuration
 */
export interface TourConfig {
  /** Unique tour identifier (used for localStorage persistence) */
  id: string;
  /** Human-readable tour name */
  name: string;
  /** Array of tour steps */
  steps: TourStep[];
  /** Automatically start on first visit */
  autoStart?: boolean;
  /** Callback when tour completes successfully */
  onComplete?: () => void;
  /** Callback when tour is skipped */
  onSkip?: () => void;
  /** Callback when tour starts */
  onStart?: () => void;
}

// =============================================================================
// TOUR STATE
// =============================================================================

/**
 * Persisted tour state (stored in localStorage)
 */
export interface PersistedTourState {
  /** Set of completed tour IDs */
  completedTours: string[];
  /** Set of skipped tour IDs */
  skippedTours: string[];
  /** Timestamp of last interaction */
  lastInteraction: string;
}

/**
 * Runtime tour state
 */
export interface TourState {
  /** Currently active tour ID (null if no tour active) */
  activeTour: string | null;
  /** Current step index within active tour */
  currentStep: number;
  /** Set of completed tour IDs */
  completedTours: Set<string>;
  /** Whether the spotlight overlay is visible */
  isOverlayVisible: boolean;
  /** Whether tour is currently transitioning between steps */
  isTransitioning: boolean;
}

// =============================================================================
// TOUR CONTEXT
// =============================================================================

/**
 * Tour context value (provided by TourProvider)
 */
export interface TourContextValue extends TourState {
  // Navigation
  /** Start a tour by ID */
  startTour: (tourId: string) => void;
  /** Go to next step */
  nextStep: () => void;
  /** Go to previous step */
  prevStep: () => void;
  /** Go to a specific step by index */
  goToStep: (stepIndex: number) => void;
  /** Skip/close the current tour */
  skipTour: () => void;
  /** Complete the current tour (marks as finished) */
  completeTour: () => void;
  
  // State queries
  /** Check if a tour has been completed */
  isTourCompleted: (tourId: string) => boolean;
  /** Check if a tour was skipped */
  isTourSkipped: (tourId: string) => boolean;
  /** Reset a tour to allow replay */
  resetTour: (tourId: string) => void;
  /** Reset all tours */
  resetAllTours: () => void;
  
  // Tour management
  /** Register a new tour configuration */
  registerTour: (config: TourConfig) => void;
  /** Unregister a tour */
  unregisterTour: (tourId: string) => void;
  /** Get tour configuration by ID */
  getTour: (tourId: string) => TourConfig | undefined;
  /** Get current step configuration */
  getCurrentStep: () => TourStep | undefined;
  /** Get total steps in current tour */
  getTotalSteps: () => number;
}

// =============================================================================
// TOUR PROVIDER PROPS
// =============================================================================

/**
 * TourProvider component props
 */
export interface TourProviderProps {
  children: ReactNode;
  /** Initial tours to register */
  tours?: TourConfig[];
  /** localStorage key for persisting state */
  storageKey?: string;
  /** Whether to persist state to localStorage */
  persist?: boolean;
}

// =============================================================================
// TOUR COMPONENT PROPS
// =============================================================================

/**
 * TourSpotlight component props
 */
export interface TourSpotlightProps {
  /** Target element selector */
  target: string;
  /** Padding around target element */
  padding?: number;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Click handler for overlay (typically skips tour) */
  onOverlayClick?: () => void;
}

/**
 * TourTooltip component props
 */
export interface TourTooltipProps {
  /** Step configuration */
  step: TourStep;
  /** Current step number (1-indexed) */
  stepNumber: number;
  /** Total steps */
  totalSteps: number;
  /** Next button handler */
  onNext: () => void;
  /** Previous button handler */
  onPrev: () => void;
  /** Skip button handler */
  onSkip: () => void;
  /** Whether this is the first step */
  isFirst: boolean;
  /** Whether this is the last step */
  isLast: boolean;
}

// =============================================================================
// HOOK TYPES
// =============================================================================

/**
 * useTour hook return type
 */
export interface UseTourReturn {
  /** Start the specified tour */
  startTour: (tourId: string) => void;
  /** Check if tour is completed */
  isCompleted: (tourId: string) => boolean;
  /** Reset and replay tour */
  replayTour: (tourId: string) => void;
  /** Current active tour info */
  activeTour: {
    id: string;
    step: number;
    total: number;
  } | null;
}

/**
 * useTourStep hook options
 */
export interface UseTourStepOptions {
  /** Tour ID this step belongs to */
  tourId: string;
  /** Step ID */
  stepId: string;
  /** Callback when step is active */
  onActive?: () => void;
}

// =============================================================================
// PREDEFINED TOURS
// =============================================================================

/**
 * Tour IDs for main CRM pages
 */
export const TOUR_IDS = {
  LEADS: 'leads-overview',
  CUSTOMERS: 'customers-overview',
  OPPORTUNITIES: 'opportunities-overview',
  CAMPAIGNS: 'campaigns-overview',
  CONTRACTS: 'contracts-overview',
  CONTACTS: 'contacts-overview',
} as const;

export type TourId = typeof TOUR_IDS[keyof typeof TOUR_IDS];
