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
import { validateSubscription } from '../schemas';

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
const BASE_PATH = '/api/v1/licencas';

const SUBSCRIPTIONS_PATH = '/api/v1/subscriptions';

/**
 * Create a trial subscription
 */
export async function createTrialSubscription(
  data: CreateSubscriptionSchema
): Promise<Subscription> {
  const response = await apiClient.post<ApiResponse<Subscription>>(`${SUBSCRIPTIONS_PATH}/trial`, data);
  const result = response.data;
  
  // Validate response
  const validation = validateSubscription(result);
  if (!validation.success) {
    throw new Error('Invalid subscription data from API');
  }
  
  return result;
}

/**
 * API response for subscription list
 */
interface SubscriptionListResponse {
  success: boolean;
  data: Subscription[];
  total: number;
}

/**
 * Fetch current company subscription
 */
export async function fetchCurrentSubscription(): Promise<Subscription | null> {
  try {
    const response = await apiClient.get<SubscriptionListResponse>(`${BASE_PATH}/user/active`);
    
    // Extract data from response envelope
    const subscriptions = response.data;
    
    // Return null if no subscriptions found
    if (!subscriptions || subscriptions.length === 0) {
      return null;
    }
    
    // Get the first subscription
    const subscription = subscriptions[0];
    
    // Validate response
    const validation = validateSubscription(subscription);
    if (!validation.success) {
      console.error('Invalid subscription data from API:', validation.error);
      throw new Error('Invalid subscription data from API');
    }
    
    return subscription;
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
    `${BASE_PATH}/${subscriptionId}/cancel`,
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
  return await apiClient.get<{
    hasActiveSubscription: boolean;
    isInTrial: boolean;
    status: string | null;
  }>(`${BASE_PATH}/status`);
}

/**
 * Reactivate canceled subscription
 */
export async function reactivateSubscription(
  subscriptionId: string
): Promise<Subscription> {
  const data = await apiClient.patch<Subscription>(
    `${BASE_PATH}/${subscriptionId}/reactivate`
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
    `${BASE_PATH}/${subscriptionId}/payment-method`,
    paymentData
  );
  
  // Validate response
  const validation = validateSubscription(data);
  if (!validation.success) {
    throw new Error('Invalid subscription data from API');
  }
  
  return data;
}
