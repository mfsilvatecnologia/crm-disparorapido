/**
 * Tour System Components
 * 
 * Feature tour/onboarding system for LeadsRapido CRM.
 * Provides guided walkthroughs of new features.
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 */

// Components
export { TourProvider } from './TourProvider';
export { Tour } from './Tour';
export { TourSpotlight } from './TourSpotlight';
export { TourTooltip } from './TourTooltip';
export { TourProgress } from './TourProgress';

// Hooks
export { useTour } from './useTour';

// Types
export type {
  TourStep,
  TourConfig,
  TourState,
  TourContextValue,
  TourProviderProps,
  UseTourReturn,
} from './types';

// Constants
export { TOUR_IDS } from './constants';
