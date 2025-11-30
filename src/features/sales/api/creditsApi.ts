/**
 * Credits API Client
 * API functions for credit endpoints
 */

import { apiClient } from '@/lib/api-client';
import {
  CreditBalance,
  CreditTransactionListParams,
  CreditTransactionListResponse,
  type CreditPackage,
} from '../types';
import {
  creditBalanceSchema,
  creditTransactionListResponseSchema,
  creditPackageSchema,
  creditBalanceResponseSchema,
} from '../schemas';

/**
 * Fetch current credit balance
 */
export async function fetchCreditBalance(): Promise<CreditBalance> {
  const response = await apiClient.get('/api/v1/credits/balance');
  const parsed = creditBalanceResponseSchema.parse(response);
  return parsed.data as CreditBalance;
}

// Alias for backward compatibility
export const getCreditBalance = fetchCreditBalance;

/**
 * Fetch paginated credit transaction list with filters (Backend API)
 * Uses cursor-based pagination
 */
export async function fetchCreditTransactions(
  params: CreditTransactionListParams
): Promise<CreditTransactionListResponse> {
  const response = await apiClient.get('/api/v1/payments/credits/transactions', { params });

  // API returns { success: true, data: { data: [...], pagination: {...} } }
  const responseData = (response as any)?.data || response;

  // Extract the paginated data structure
  const paginatedData = responseData.data || responseData;

  if (!paginatedData || typeof paginatedData !== 'object') {
    throw new Error('Invalid credit transactions response from API');
  }

  return creditTransactionListResponseSchema.parse(paginatedData) as CreditTransactionListResponse;
}

// Alias for backward compatibility
export const getCreditTransactions = fetchCreditTransactions;

export const creditsApi = {
  fetchCreditBalance,
  getCreditBalance,
  fetchCreditTransactions,
  getCreditTransactions,
};

/**
 * Fetch available credit packages
 */
export async function fetchCreditPackages(): Promise<CreditPackage[]> {
  const raw = await apiClient.get<unknown>('/api/v1/credits/packages');

  // API may return an array directly or wrap in { data }
  const items = Array.isArray(raw) ? raw : (raw as any)?.data;
  if (!Array.isArray(items)) {
    throw new Error('Invalid credit packages response from API');
  }

  // Normalize and validate each item
  return items.map((pkgRaw) => {
    const pkg: any = { ...pkgRaw };

    // Some backends return preco (float) instead of preco_centavos (int)
    if (pkg.preco_centavos == null && typeof pkg.preco === 'number') {
      pkg.preco_centavos = Math.round(pkg.preco * 100);
    }

    // Pass through metadata when present (schema keeps known fields)
    if (pkg.metadata && typeof pkg.metadata === 'object') {
      pkg.metadata = { ...pkg.metadata };
    }

    return creditPackageSchema.parse(pkg) as CreditPackage;
  });
}

// Alias for backward compatibility
export const getCreditPackages = fetchCreditPackages;

// Extend export object
Object.assign(creditsApi, {
  fetchCreditPackages,
  getCreditPackages,
});

/**
 * Purchase lead access using credits
 */
export async function purchaseLeadAccess(
  data: any
): Promise<{ novoSaldo: number; custo: number }> {
  const raw = await apiClient.post<any>('/credits/purchase-lead', data);
  const payload = (raw as any)?.data ?? raw;

  if (
    typeof payload?.saldoRestante !== 'number' ||
    typeof payload?.custoCreditos !== 'number'
  ) {
    throw new Error('Invalid purchase lead response from API');
  }

  return {
    novoSaldo: payload.saldoRestante,
    custo: payload.custoCreditos,
  };
}

Object.assign(creditsApi, {
  purchaseLeadAccess,
});
