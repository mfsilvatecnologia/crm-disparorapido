/**
 * Tour System Types
 * 
 * Type definitions for the tour system.
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 */

import type { ReactNode } from 'react';

// =============================================================================
// TOUR STEP
// =============================================================================

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface TourStepAction {
  label: string;
  onClick?: () => void;
}

export interface TourStep {
  id: string;
  target: string;
  title: string;
  content: ReactNode;
  position?: TooltipPosition;
  actions?: {
    primary?: TourStepAction;
    secondary?: TourStepAction;
  };
  onActivate?: () => void;
  beforeLeave?: () => boolean | Promise<boolean>;
  scrollIntoView?: boolean;
  delay?: number;
}

// =============================================================================
// TOUR CONFIGURATION
// =============================================================================

export interface TourConfig {
  id: string;
  name: string;
  steps: TourStep[];
  autoStart?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
  onStart?: () => void;
}

// =============================================================================
// TOUR STATE
// =============================================================================

export interface PersistedTourState {
  completedTours: string[];
  skippedTours: string[];
  lastInteraction: string;
}

export interface TourState {
  activeTour: string | null;
  currentStep: number;
  completedTours: Set<string>;
  isOverlayVisible: boolean;
  isTransitioning: boolean;
}

// =============================================================================
// TOUR CONTEXT
// =============================================================================

export interface TourContextValue extends TourState {
  startTour: (tourId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (stepIndex: number) => void;
  skipTour: () => void;
  completeTour: () => void;
  isTourCompleted: (tourId: string) => boolean;
  isTourSkipped: (tourId: string) => boolean;
  resetTour: (tourId: string) => void;
  resetAllTours: () => void;
  registerTour: (config: TourConfig) => void;
  unregisterTour: (tourId: string) => void;
  getTour: (tourId: string) => TourConfig | undefined;
  getCurrentStep: () => TourStep | undefined;
  getTotalSteps: () => number;
}

// =============================================================================
// TOUR PROVIDER PROPS
// =============================================================================

export interface TourProviderProps {
  children: ReactNode;
  tours?: TourConfig[];
  storageKey?: string;
  persist?: boolean;
}

// =============================================================================
// TOUR COMPONENT PROPS
// =============================================================================

export interface TourSpotlightProps {
  target: string;
  padding?: number;
  animationDuration?: number;
  onOverlayClick?: () => void;
}

export interface TourTooltipProps {
  step: TourStep;
  stepNumber: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  isFirst: boolean;
  isLast: boolean;
}

// =============================================================================
// HOOK TYPES
// =============================================================================

export interface UseTourReturn {
  startTour: (tourId: string) => void;
  isCompleted: (tourId: string) => boolean;
  replayTour: (tourId: string) => void;
  activeTour: {
    id: string;
    step: number;
    total: number;
  } | null;
}

export interface UseTourStepOptions {
  tourId: string;
  stepId: string;
  onActive?: () => void;
}

// =============================================================================
// TOUR IDS
// =============================================================================

export type TourId = 'leads-overview' | 'customers-overview' | 'opportunities-overview' | 'campaigns-overview' | 'contracts-overview' | 'contacts-overview';
