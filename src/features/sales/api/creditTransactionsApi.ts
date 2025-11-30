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
 * Uses cursor-based pagination
 */
export async function getCreditTransactions(
  params?: CreditTransactionListParams
): Promise<CreditTransactionListResponse> {
  const response = await apiClient.get('/api/v1/payments/credits/transactions', { params });

  console.log('🔍 [creditTransactionsApi] Raw response:', response);

  // apiClient already unwraps the response, so `response` is the full API response
  // API returns { success: true, data: [...], pagination: {...}, message, timestamp, trace }
  const apiResponse = response as any;

  console.log('🔍 [creditTransactionsApi] API response:', apiResponse);
  console.log('🔍 [creditTransactionsApi] apiResponse.data:', apiResponse.data);
  console.log('🔍 [creditTransactionsApi] apiResponse.pagination:', apiResponse.pagination);

  if (!apiResponse || typeof apiResponse !== 'object') {
    throw new Error('Invalid credit transactions response from API');
  }

  // Restructure from backend format to expected format
  const paginatedData = {
    data: apiResponse.data || [],
    pagination: apiResponse.pagination || {
      hasMore: false,
      nextCursor: null,
      limit: params?.limit || 10,
      totalReturned: 0,
    },
  };

  console.log('🔍 [creditTransactionsApi] Final paginatedData:', paginatedData);

  return creditTransactionListResponseSchema.parse(paginatedData) as CreditTransactionListResponse;
}

export const creditTransactionsApi = {
  getCreditTransactions,
};