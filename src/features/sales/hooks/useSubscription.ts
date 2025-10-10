/**
 * Hook for managing subscription data
 * Fetches and manages current subscription state
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchCurrentSubscription, fetchSubscriptionStatus, fetchAllSubscriptions } from '../api/subscriptionsApi';
import type { Subscription } from '../types/subscription.types';

interface UseSubscriptionResult {
  subscription: Subscription | null;
  subscriptions: Subscription[];
  isLoading: boolean;
  error: string | null;
  hasActiveSubscription: boolean;
  isInTrial: boolean;
  refetch: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionResult {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isInTrial, setIsInTrial] = useState(false);

  const fetchSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all subscriptions
      const allSubscriptions = await fetchAllSubscriptions();
      setSubscriptions(allSubscriptions);

      // Get subscription status
      const status = await fetchSubscriptionStatus();
      setHasActiveSubscription(status.hasActiveSubscription);
      setIsInTrial(status.isInTrial);

      // If has subscription, get the current active one
      if (status.hasActiveSubscription) {
        const currentSubscription = await fetchCurrentSubscription();
        setSubscription(currentSubscription);
      } else {
        setSubscription(null);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar assinatura');
      setSubscription(null);
      setSubscriptions([]);
      setHasActiveSubscription(false);
      setIsInTrial(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  return {
    subscription,
    subscriptions,
    isLoading,
    error,
    hasActiveSubscription,
    isInTrial,
    refetch: fetchSubscription,
  };
}

/**
 * Hook for polling subscription status
 * Useful for waiting for trial activation
 */
export function useSubscriptionPolling(intervalMs: number = 5000): UseSubscriptionResult & {
  startPolling: () => void;
  stopPolling: () => void;
  isPolling: boolean;
} {
  const subscriptionResult = useSubscription();
  const [isPolling, setIsPolling] = useState(false);

  const startPolling = () => {
    setIsPolling(true);
  };

  const stopPolling = () => {
    setIsPolling(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPolling && !subscriptionResult.hasActiveSubscription) {
      interval = setInterval(() => {
        subscriptionResult.refetch();
      }, intervalMs);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPolling, subscriptionResult, intervalMs]);

  useEffect(() => {
    // Auto-stop polling if subscription becomes active
    if (subscriptionResult.hasActiveSubscription && isPolling) {
      setIsPolling(false);
    }
  }, [subscriptionResult.hasActiveSubscription, isPolling]);

  return {
    ...subscriptionResult,
    startPolling,
    stopPolling,
    isPolling,
  };
}