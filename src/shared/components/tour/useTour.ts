/**
 * useTour Hook
 * 
 * Convenience hook for accessing tour functionality.
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 */

import { useCallback } from 'react';
import { useTourContext } from './TourProvider';
import type { UseTourReturn } from './types';

/**
 * Hook for accessing tour functionality
 * 
 * @example
 * ```tsx
 * const { startTour, isCompleted, activeTour } = useTour();
 * 
 * if (!isCompleted('leads-overview')) {
 *   startTour('leads-overview');
 * }
 * ```
 */
export function useTour(): UseTourReturn {
  const context = useTourContext();

  const startTour = useCallback((tourId: string) => {
    context.startTour(tourId);
  }, [context]);

  const isCompleted = useCallback((tourId: string): boolean => {
    return context.isTourCompleted(tourId);
  }, [context]);

  const replayTour = useCallback((tourId: string) => {
    context.resetTour(tourId);
    context.startTour(tourId);
  }, [context]);

  const activeTour = context.activeTour
    ? {
        id: context.activeTour,
        step: context.currentStep + 1, // 1-indexed
        total: context.getTotalSteps(),
      }
    : null;

  return {
    startTour,
    isCompleted,
    replayTour,
    activeTour,
  };
}
