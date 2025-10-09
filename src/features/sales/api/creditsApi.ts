/**
 * Credits API Client
 * API functions for credit endpoints
 */

import { apiClient } from '@/lib/api-client';
import {
  CreditBalance,
  CreditTransactionListParams,
  CreditTransactionListResponse,
} from '../types';
import {
  creditBalanceSchema,
  creditTransactionListResponseSchema,
} from '../schemas';

/**
 * Fetch current credit balance
 */
export async function fetchCreditBalance(): Promise<CreditBalance> {
  const response = await apiClient.get<unknown>('/credits/balance');
  return creditBalanceSchema.parse(response) as CreditBalance;
}

// Alias for backward compatibility
export const getCreditBalance = fetchCreditBalance;

/**
 * Fetch paginated credit transaction list with filters
 */
export async function fetchCreditTransactions(
  params: CreditTransactionListParams
): Promise<CreditTransactionListResponse> {
  const response = await apiClient.get<unknown>('/credits/transactions', { params });
  return creditTransactionListResponseSchema.parse(response) as CreditTransactionListResponse;
}

// Alias for backward compatibility
export const getCreditTransactions = fetchCreditTransactions;

export const creditsApi = {
  fetchCreditBalance,
  getCreditBalance,
  fetchCreditTransactions,
  getCreditTransactions,
};
