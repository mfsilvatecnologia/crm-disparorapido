/**
 * Tour Component
 * 
 * Main tour component that combines TourSpotlight and TourTooltip.
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 */

import React from 'react';
import { useTourContext } from './TourProvider';
import { TourSpotlight } from './TourSpotlight';
import { TourTooltip } from './TourTooltip';

/**
 * Tour - Main tour component
 * 
 * Renders the tour overlay and tooltip when a tour is active.
 * Should be placed at the root of the app.
 * 
 * @example
 * ```tsx
 * <TourProvider tours={[leadsTour]}>
 *   <App />
 *   <Tour />
 * </TourProvider>
 * ```
 */
export function Tour() {
  const context = useTourContext();
  const currentStep = context.getCurrentStep();

  if (!context.activeTour || !currentStep || !context.isOverlayVisible) {
    return null;
  }

  const totalSteps = context.getTotalSteps();
  const stepNumber = context.currentStep + 1; // 1-indexed
  const isFirst = context.currentStep === 0;
  const isLast = context.currentStep === totalSteps - 1;

  return (
    <>
      <TourSpotlight
        target={currentStep.target}
        padding={8}
        onOverlayClick={context.skipTour}
      />
      <TourTooltip
        step={currentStep}
        stepNumber={stepNumber}
        totalSteps={totalSteps}
        onNext={context.nextStep}
        onPrev={context.prevStep}
        onSkip={context.skipTour}
        isFirst={isFirst}
        isLast={isLast}
      />
    </>
  );
}
