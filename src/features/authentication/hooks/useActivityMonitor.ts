/**
 * useActivityMonitor Hook
 * Tracks user activity and updates last activity timestamp
 * Implements T035 from tasks.md
 */

import { useEffect } from 'react';
import { authStorage } from '@/shared/utils/storage';

/**
 * Activity event types to monitor
 */
const ACTIVITY_EVENTS = [
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
] as const;

/**
 * Hook to monitor user activity
 * Updates last activity timestamp in localStorage on user interaction
 *
 * @example
 * ```tsx
 * function App() {
 *   useActivityMonitor(); // Track activity across the app
 *
 *   return <div>App content</div>;
 * }
 * ```
 */
export function useActivityMonitor(): void {
  useEffect(() => {
    /**
     * Update last activity timestamp
     */
    const updateActivity = (): void => {
      authStorage.updateLastActivity();
    };

    // Add event listeners for all activity events
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    // Update activity on mount
    updateActivity();

    // Cleanup: remove event listeners
    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, []);
}

/**
 * Get minutes since last activity
 * @returns Minutes since last activity, or null if no activity recorded
 */
export function getMinutesSinceLastActivity(): number | null {
  const lastActivity = authStorage.getLastActivity();

  if (!lastActivity) {
    return null;
  }

  const now = new Date();
  const diffMs = now.getTime() - lastActivity.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  return diffMinutes;
}

/**
 * Check if user has been inactive for specified minutes
 * @param thresholdMinutes - Minutes of inactivity threshold
 * @returns true if inactive for longer than threshold
 */
export function isUserInactive(thresholdMinutes: number = 45): boolean {
  const minutesSinceActivity = getMinutesSinceLastActivity();

  if (minutesSinceActivity === null) {
    return false;
  }

  return minutesSinceActivity >= thresholdMinutes;
}
