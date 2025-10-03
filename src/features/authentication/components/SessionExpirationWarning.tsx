/**
 * SessionExpirationWarning Component
 * Displays warning when session is about to expire
 * Implements T045 from tasks.md
 */

import { useEffect, useState } from 'react';
import { authStorage } from '@/shared/utils/storage';

interface SessionExpirationWarningProps {
  /** Warning threshold in minutes (default: 5) */
  thresholdMinutes?: number;
  /** Callback when user extends session */
  onExtendSession?: () => void;
}

export function SessionExpirationWarning({
  thresholdMinutes = 5,
  onExtendSession
}: SessionExpirationWarningProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [minutesRemaining, setMinutesRemaining] = useState(0);

  useEffect(() => {
    const checkExpiration = () => {
      const lastActivity = authStorage.getLastActivity();
      if (!lastActivity) return;

      const now = Date.now();
      const timeSinceActivity = now - lastActivity.getTime();
      const sessionDuration = 45 * 60 * 1000; // 45 minutes in ms
      const timeRemaining = sessionDuration - timeSinceActivity;

      const minutesLeft = Math.floor(timeRemaining / (60 * 1000));
      setMinutesRemaining(minutesLeft);

      // Show warning if within threshold
      const warningThreshold = thresholdMinutes * 60 * 1000;
      setShowWarning(timeRemaining > 0 && timeRemaining <= warningThreshold);
    };

    // Check every 30 seconds
    const interval = setInterval(checkExpiration, 30000);
    checkExpiration(); // Check immediately

    return () => clearInterval(interval);
  }, [thresholdMinutes]);

  const handleExtend = () => {
    authStorage.updateLastActivity();
    setShowWarning(false);
    onExtendSession?.();
  };

  if (!showWarning) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 shadow-lg rounded-r-md">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-yellow-800">
              Session Expiring Soon
            </p>
            <p className="mt-1 text-sm text-yellow-700">
              Your session will expire in approximately {minutesRemaining} {minutesRemaining === 1 ? 'minute' : 'minutes'}.
            </p>
            <div className="mt-3 flex space-x-2">
              <button
                onClick={handleExtend}
                className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
              >
                Stay logged in
              </button>
            </div>
          </div>
          <div className="ml-3 flex-shrink-0">
            <button
              onClick={() => setShowWarning(false)}
              className="inline-flex text-yellow-400 hover:text-yellow-500"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
