/**
 * Financial API Client
 * API functions for financial summary endpoints
 */

import { apiClient } from '@/lib/api-client';
import { FinancialSummary, FinancialSummaryParams } from '../types';
import { financialSummarySchema } from '../schemas';

/**
 * Fetch financial summary for a time period
 */
export async function getFinancialSummary(
  params: FinancialSummaryParams
): Promise<FinancialSummary> {
  const response = await apiClient.get<FinancialSummary>('/financial/summary', { params });
  return financialSummarySchema.parse(response.data);
}

export const financialApi = {
  getFinancialSummary,
};
