/**
 * TourProvider Component
 * 
 * Provides tour context and manages tour state, persistence, and navigation.
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import type {
  TourConfig,
  TourContextValue,
  TourState,
  PersistedTourState,
  TourStep,
  TourProviderProps,
} from './types';

// =============================================================================
// CONTEXT
// =============================================================================

const TourContext = createContext<TourContextValue | null>(null);

export function useTourContext() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTourContext must be used within a TourProvider');
  }
  return context;
}

// =============================================================================
// TOUR PROVIDER
// =============================================================================

const STORAGE_KEY = 'leadsrapido-tours';
const DEFAULT_STORAGE_KEY = STORAGE_KEY;

export function TourProvider({
  children,
  tours: initialTours = [],
  storageKey = DEFAULT_STORAGE_KEY,
  persist = true,
}: TourProviderProps) {
  // Tour registry
  const [tours, setTours] = useState<Map<string, TourConfig>>(() => {
    const map = new Map();
    initialTours.forEach(tour => map.set(tour.id, tour));
    return map;
  });

  // Load persisted state
  const loadPersistedState = useCallback((): PersistedTourState => {
    if (!persist || typeof window === 'undefined') {
      return {
        completedTours: [],
        skippedTours: [],
        lastInteraction: new Date().toISOString(),
      };
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          completedTours: parsed.completedTours || [],
          skippedTours: parsed.skippedTours || [],
          lastInteraction: parsed.lastInteraction || new Date().toISOString(),
        };
      }
    } catch (error) {
      console.warn('Failed to load tour state from localStorage:', error);
    }

    return {
      completedTours: [],
      skippedTours: [],
      lastInteraction: new Date().toISOString(),
    };
  }, [persist, storageKey]);

  // Save persisted state
  const savePersistedState = useCallback((state: PersistedTourState) => {
    if (!persist || typeof window === 'undefined') return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save tour state to localStorage:', error);
    }
  }, [persist, storageKey]);

  // Initialize state
  const persistedState = loadPersistedState();
  const [state, setState] = useState<TourState>(() => ({
    activeTour: null,
    currentStep: 0,
    completedTours: new Set(persistedState.completedTours),
    isOverlayVisible: false,
    isTransitioning: false,
  }));

  // Persisted state ref for callbacks
  const persistedStateRef = useRef<PersistedTourState>(persistedState);

  // Update persisted state when completed/skipped tours change
  useEffect(() => {
    persistedStateRef.current = {
      completedTours: Array.from(state.completedTours),
      skippedTours: persistedStateRef.current.skippedTours,
      lastInteraction: new Date().toISOString(),
    };
    savePersistedState(persistedStateRef.current);
  }, [state.completedTours, savePersistedState]);

  // Register tour
  const registerTour = useCallback((config: TourConfig) => {
    setTours(prev => {
      const next = new Map(prev);
      next.set(config.id, config);
      return next;
    });

    // Auto-start if configured
    if (config.autoStart && !state.completedTours.has(config.id)) {
      // Delay auto-start slightly to allow DOM to settle
      setTimeout(() => {
        startTour(config.id);
      }, 500);
    }
  }, [state.completedTours]);

  // Unregister tour
  const unregisterTour = useCallback((tourId: string) => {
    setTours(prev => {
      const next = new Map(prev);
      next.delete(tourId);
      return next;
    });
  }, []);

  // Get tour
  const getTour = useCallback((tourId: string): TourConfig | undefined => {
    return tours.get(tourId);
  }, [tours]);

  // Get current step
  const getCurrentStep = useCallback((): TourStep | undefined => {
    if (!state.activeTour) return undefined;
    const tour = tours.get(state.activeTour);
    if (!tour) return undefined;
    return tour.steps[state.currentStep];
  }, [state.activeTour, state.currentStep, tours]);

  // Get total steps
  const getTotalSteps = useCallback((): number => {
    if (!state.activeTour) return 0;
    const tour = tours.get(state.activeTour);
    if (!tour) return 0;
    return tour.steps.length;
  }, [state.activeTour, tours]);

  // Start tour
  const startTour = useCallback((tourId: string) => {
    const tour = tours.get(tourId);
    if (!tour) {
      console.warn(`Tour "${tourId}" not found`);
      return;
    }

    if (state.completedTours.has(tourId)) {
      console.info(`Tour "${tourId}" already completed`);
      return;
    }

    setState(prev => ({
      ...prev,
      activeTour: tourId,
      currentStep: 0,
      isOverlayVisible: true,
      isTransitioning: false,
    }));

    // Call onStart callback
    if (tour.onStart) {
      tour.onStart();
    }

    // Activate first step
    const firstStep = tour.steps[0];
    if (firstStep?.onActivate) {
      firstStep.onActivate();
    }

    // Scroll to first step if needed
    if (firstStep?.scrollIntoView !== false) {
      setTimeout(() => {
        const element = document.querySelector(firstStep.target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [tours, state.completedTours]);

  // Next step
  const nextStep = useCallback(async () => {
    if (!state.activeTour) return;

    const tour = tours.get(state.activeTour);
    if (!tour) return;

    const currentStep = tour.steps[state.currentStep];
    
    // Check beforeLeave callback
    if (currentStep?.beforeLeave) {
      const canLeave = await currentStep.beforeLeave();
      if (!canLeave) return;
    }

    const nextIndex = state.currentStep + 1;

    if (nextIndex >= tour.steps.length) {
      // Tour complete
      completeTour();
      return;
    }

    setState(prev => ({
      ...prev,
      currentStep: nextIndex,
      isTransitioning: true,
    }));

    // Activate next step
    const nextStep = tour.steps[nextIndex];
    if (nextStep?.onActivate) {
      nextStep.onActivate();
    }

    // Scroll to next step if needed
    if (nextStep?.scrollIntoView !== false) {
      setTimeout(() => {
        const element = document.querySelector(nextStep.target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }

    // Clear transitioning after animation
    setTimeout(() => {
      setState(prev => ({ ...prev, isTransitioning: false }));
    }, 300);
  }, [state.activeTour, state.currentStep, tours]);

  // Previous step
  const prevStep = useCallback(() => {
    if (!state.activeTour) return;

    const tour = tours.get(state.activeTour);
    if (!tour) return;

    const prevIndex = state.currentStep - 1;

    if (prevIndex < 0) return;

    setState(prev => ({
      ...prev,
      currentStep: prevIndex,
      isTransitioning: true,
    }));

    // Activate previous step
    const prevStep = tour.steps[prevIndex];
    if (prevStep?.onActivate) {
      prevStep.onActivate();
    }

    // Scroll to previous step if needed
    if (prevStep?.scrollIntoView !== false) {
      setTimeout(() => {
        const element = document.querySelector(prevStep.target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }

    // Clear transitioning after animation
    setTimeout(() => {
      setState(prev => ({ ...prev, isTransitioning: false }));
    }, 300);
  }, [state.activeTour, state.currentStep, tours]);

  // Go to specific step
  const goToStep = useCallback((stepIndex: number) => {
    if (!state.activeTour) return;

    const tour = tours.get(state.activeTour);
    if (!tour) return;

    if (stepIndex < 0 || stepIndex >= tour.steps.length) return;

    setState(prev => ({
      ...prev,
      currentStep: stepIndex,
      isTransitioning: true,
    }));

    const step = tour.steps[stepIndex];
    if (step?.onActivate) {
      step.onActivate();
    }

    if (step?.scrollIntoView !== false) {
      setTimeout(() => {
        const element = document.querySelector(step.target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }

    setTimeout(() => {
      setState(prev => ({ ...prev, isTransitioning: false }));
    }, 300);
  }, [state.activeTour, tours]);

  // Skip tour
  const skipTour = useCallback(() => {
    if (!state.activeTour) return;

    const tour = tours.get(state.activeTour);
    if (tour?.onSkip) {
      tour.onSkip();
    }

    // Mark as skipped
    const skippedTours = [...persistedStateRef.current.skippedTours, state.activeTour];
    persistedStateRef.current = {
      ...persistedStateRef.current,
      skippedTours,
    };
    savePersistedState(persistedStateRef.current);

    setState(prev => ({
      ...prev,
      activeTour: null,
      currentStep: 0,
      isOverlayVisible: false,
      isTransitioning: false,
    }));
  }, [state.activeTour, savePersistedState]);

  // Complete tour
  const completeTour = useCallback(() => {
    if (!state.activeTour) return;

    const tour = tours.get(state.activeTour);
    if (tour?.onComplete) {
      tour.onComplete();
    }

    // Mark as completed
    setState(prev => {
      const nextCompleted = new Set(prev.completedTours);
      nextCompleted.add(state.activeTour!);
      return {
        ...prev,
        completedTours: nextCompleted,
        activeTour: null,
        currentStep: 0,
        isOverlayVisible: false,
        isTransitioning: false,
      };
    });
  }, [state.activeTour, tours]);

  // Check if tour is completed
  const isTourCompleted = useCallback((tourId: string): boolean => {
    return state.completedTours.has(tourId);
  }, [state.completedTours]);

  // Check if tour was skipped
  const isTourSkipped = useCallback((tourId: string): boolean => {
    return persistedStateRef.current.skippedTours.includes(tourId);
  }, []);

  // Reset tour
  const resetTour = useCallback((tourId: string) => {
    setState(prev => {
      const nextCompleted = new Set(prev.completedTours);
      nextCompleted.delete(tourId);
      return { ...prev, completedTours: nextCompleted };
    });

    const skippedTours = persistedStateRef.current.skippedTours.filter(id => id !== tourId);
    persistedStateRef.current = {
      ...persistedStateRef.current,
      skippedTours,
    };
    savePersistedState(persistedStateRef.current);
  }, [savePersistedState]);

  // Reset all tours
  const resetAllTours = useCallback(() => {
    setState(prev => ({
      ...prev,
      completedTours: new Set(),
      activeTour: null,
      currentStep: 0,
      isOverlayVisible: false,
    }));

    persistedStateRef.current = {
      completedTours: [],
      skippedTours: [],
      lastInteraction: new Date().toISOString(),
    };
    savePersistedState(persistedStateRef.current);
  }, [savePersistedState]);

  // Context value
  const contextValue: TourContextValue = {
    ...state,
    startTour,
    nextStep,
    prevStep,
    goToStep,
    skipTour,
    completeTour,
    isTourCompleted,
    isTourSkipped,
    resetTour,
    resetAllTours,
    registerTour,
    unregisterTour,
    getTour,
    getCurrentStep,
    getTotalSteps,
  };

  return (
    <TourContext.Provider value={contextValue}>
      {children}
    </TourContext.Provider>
  );
}
