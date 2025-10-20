/**
 * Credit Transactions API Client
 * API functions for credit transaction endpoints (Backend API)
 */

import { apiClient } from '@/lib/api-client';
import {
  CreditTransaction,
  CreditTransactionListParams,
  CreditTransactionListResponse,
} from '../types';
import {
  creditTransactionListResponseSchema,
} from '../schemas/credit.schema';

/**
 * Fetch paginated credit transactions with filters
 * GET /payments/credits/transactions
 */
export async function getCreditTransactions(
  params?: CreditTransactionListParams
): Promise<CreditTransactionListResponse> {
  const response = await apiClient.get('/payments/credits/transactions', { params });
  return creditTransactionListResponseSchema.parse(response.data) as CreditTransactionListResponse;
}

export const creditTransactionsApi = {
  getCreditTransactions,
};