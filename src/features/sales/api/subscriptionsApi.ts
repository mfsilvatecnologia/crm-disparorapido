/**
 * Subscriptions API Client
 * 
 * API methods for subscription operations
 */

import { apiClient } from '@/lib/api-client';
import type { Subscription } from '../types';
import type { 
  CreateSubscriptionSchema,
  CancelSubscriptionSchema 
} from '../schemas';

/**
 * Trial subscription response type (from API)
 */
export interface TrialSubscriptionResponse {
  id: string;
  status: 'trial' | 'trialing' | 'ativa' | 'active' | 'expirada' | 'cancelada' | 'suspensa';
  asaasInvoiceUrl?: string | null;
  trialDays?: number;
  trialEndDate?: string;
  firstChargeDate?: string;
  nextSteps?: string[];
}
import { validateSubscription, validateTrialSubscription } from '../schemas';

/**
 * Standard API response envelope
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Base path for subscriptions API
 */
const SUBSCRIPTIONS_PATH = '/api/v1/subscriptions';

/**
 * Create a trial subscription
 */
export async function createTrialSubscription(
  data: CreateSubscriptionSchema
): Promise<TrialSubscriptionResponse> {
  try {
    const response = await apiClient.post<ApiResponse<TrialSubscriptionResponse>>(`${SUBSCRIPTIONS_PATH}/trial`, data);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to create trial subscription');
    }
    
    const result = response.data;
    
    // Validate response using trial-specific schema
    const validation = validateTrialSubscription(result);
    if (!validation.success) {
      console.error('Trial subscription validation failed:', validation.error);
      throw new Error('Invalid trial subscription data from API');
    }
    
    return result;
  } catch (error: any) {
    // Extract detailed error message from API response
    let errorMessage = 'Erro ao criar trial. Tente novamente.';
    
    if (error?.data) {
      // Check for details.detail (Asaas API errors)
      if (error.data.details?.detail) {
        errorMessage = error.data.details.detail;
      }
      // Check for error message
      else if (error.data.error) {
        errorMessage = error.data.error;
      }
      // Check for message field
      else if (error.data.message) {
        errorMessage = error.data.message;
      }
    }
    // Fallback to error message if available
    else if (error?.message) {
      errorMessage = error.message;
    }
    
    // Create a new error with the extracted message
    const enhancedError = new Error(errorMessage);
    (enhancedError as any).originalError = error;
    throw enhancedError;
  }
}

/**
 * API response for subscription list
 */
interface SubscriptionListResponse {
  success: boolean;
  data: {
    data: Subscription[];
    total: number;
    limit: number;
    offset: number;
  };
  message?: string;
  timestamp?: string;
  trace?: {
    trace_id: string;
    span_id: string;
    requestId: string;
  };
}

/**
 * Fetch all company subscriptions
 */
export async function fetchAllSubscriptions(): Promise<Subscription[]> {
  try {
    const response = await apiClient.get<SubscriptionListResponse>(`${SUBSCRIPTIONS_PATH}`);
    
    if (!response.success) {
      throw new Error('Failed to fetch subscriptions');
    }
    
    // Extract data from nested response envelope (data.data)
    return response.data?.data || [];
  } catch (error: any) {
    // Return empty array if no subscriptions found (404)
    if (error.status === 404) {
      return [];
    }
    throw error;
  }
}

/**
 * Fetch current active subscription (first active subscription found)
 */
export async function fetchCurrentSubscription(): Promise<Subscription | null> {
  try {
    const subscriptions = await fetchAllSubscriptions();
    
    // Return the first active subscription (trialing, ativa, active)
    const activeSubscription = subscriptions.find(sub =>
      sub.status === 'trialing' ||
      sub.status === 'ativa' ||
      sub.status === 'active' ||
      sub.status === 'trial'
    );
    
    return activeSubscription || null;
  } catch (error: any) {
    // Return null if no subscription found (404)
    if (error.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  data: CancelSubscriptionSchema
): Promise<Subscription> {
  const response = await apiClient.patch<ApiResponse<Subscription>>(
    `${SUBSCRIPTIONS_PATH}/${subscriptionId}/cancel`,
    data
  );
  const result = response.data;
  
  // Validate response
  const validation = validateSubscription(result);
  if (!validation.success) {
    throw new Error('Invalid subscription data from API');
  }
  
  return result;
}

/**
 * Fetch subscription status (lightweight endpoint)
 */
export async function fetchSubscriptionStatus(): Promise<{
  hasActiveSubscription: boolean;
  isInTrial: boolean;
  status: string | null;
}> {
  try {
    const subscriptions = await fetchAllSubscriptions();
    
    const activeSubscriptions = subscriptions.filter(sub =>
      sub.status === 'trialing' ||
      sub.status === 'ativa' ||
      sub.status === 'active' ||
      sub.status === 'trial'
    );

    const trialSubscriptions = subscriptions.filter(sub =>
      sub.isInTrial ||
      sub.status === 'trialing' ||
      sub.status === 'trial'
    );
    
    return {
      hasActiveSubscription: activeSubscriptions.length > 0,
      isInTrial: trialSubscriptions.length > 0,
      status: activeSubscriptions.length > 0 ? activeSubscriptions[0].status : null
    };
  } catch (error) {
    return {
      hasActiveSubscription: false,
      isInTrial: false,
      status: null
    };
  }
}

/**
 * Reactivate canceled subscription
 */
export async function reactivateSubscription(
  subscriptionId: string
): Promise<Subscription> {
  const data = await apiClient.patch<Subscription>(
    `${SUBSCRIPTIONS_PATH}/${subscriptionId}/reactivate`
  );
  
  // Validate response
  const validation = validateSubscription(data);
  if (!validation.success) {
    throw new Error('Invalid subscription data from API');
  }
  
  return data;
}

/**
 * Update payment method
 */
export async function updatePaymentMethod(
  subscriptionId: string,
  paymentData: {
    paymentMethod: 'CREDIT_CARD' | 'BOLETO' | 'PIX';
    creditCardToken?: string;
  }
): Promise<Subscription> {
  const data = await apiClient.patch<Subscription>(
    `${SUBSCRIPTIONS_PATH}/${subscriptionId}/payment-method`,
    paymentData
  );
  
  // Validate response
  const validation = validateSubscription(data);
  if (!validation.success) {
    throw new Error('Invalid subscription data from API');
  }
  
  return data;
}

/**
 * Direct subscription request payload (POST /subscriptions)
 */
export interface CreateDirectSubscriptionRequest {
  produtoId: string;
  billingCycle?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY';
  value?: number;
  hasTrial?: boolean;
  trialDays?: number;
  description?: string;
  maxPayments?: number | null;
}

/**
 * Create a direct subscription (without trial validation)
 * Use this endpoint when customer has already used their trial
 */
export async function createDirectSubscription(
  data: CreateDirectSubscriptionRequest
): Promise<Subscription> {
  try {
    const requestData = {
      ...data,
      billingCycle: data.billingCycle || 'MONTHLY',
      hasTrial: data.hasTrial ?? false,
      trialDays: data.trialDays ?? 0,
    };

    const response = await apiClient.post<ApiResponse<Subscription>>(
      SUBSCRIPTIONS_PATH,
      requestData
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to create subscription');
    }
    
    return response.data;
  } catch (error: any) {
    // Extract detailed error message from API response
    let errorMessage = 'Erro ao criar assinatura. Tente novamente.';
    
    if (error?.data) {
      if (error.data.details?.detail) {
        errorMessage = error.data.details.detail;
      } else if (error.data.error) {
        errorMessage = error.data.error;
      } else if (error.data.message) {
        errorMessage = error.data.message;
      }
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    const enhancedError = new Error(errorMessage);
    (enhancedError as any).originalError = error;
    throw enhancedError;
  }
}

/**
 * Check if company has ever used a trial subscription
 */
export async function checkHasUsedTrial(): Promise<boolean> {
  try {
    const subscriptions = await fetchAllSubscriptions();
    
    // Check if any subscription has hasTrial = true
    return subscriptions.some(sub => sub.hasTrial === true);
  } catch (error) {
    // In case of error, assume trial hasn't been used (allow trial attempt)
    return false;
  }
}
