/**
 * Credits API Client
 * 
 * API methods for credit system operations
 */

import { apiClient } from '@/lib/api-client';
import type { 
  CreditBalance, 
  CreditPackage,
  CreditTransaction,
  PurchaseLeadResponse 
} from '../types';
import type {
  PurchaseCreditPackageSchema,
  PurchaseLeadSchema,
  CreditTransactionFiltersSchema
} from '../schemas';
import {
  validateCreditBalance,
  validateCreditPackage,
  validateCreditTransaction
} from '../schemas';

/**
 * Standard API response envelope
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Base path for credits API
 */
const BASE_PATH = '/api/v1/credits';

/**
 * Fetch credit balance for current company
 */
export async function fetchCreditBalance(): Promise<CreditBalance> {
  const response = await apiClient.get<ApiResponse<CreditBalance>>(`${BASE_PATH}/balance`);
  const data = response.data;
  
  // Validate response
  const validation = validateCreditBalance(data);
  if (!validation.success) {
    throw new Error('Invalid credit balance data from API');
  }
  
  return data;
}

/**
 * Fetch available credit packages
 */
export async function fetchCreditPackages(): Promise<CreditPackage[]> {
  const response = await apiClient.get<ApiResponse<CreditPackage[]>>(`${BASE_PATH}/packages`);
  const data = response.data;
  
  // Validate each package
  data.forEach(pkg => {
    const validation = validateCreditPackage(pkg);
    if (!validation.success) {
      throw new Error('Invalid credit package data from API');
    }
  });
  
  return data;
}

/**
 * Purchase credit package
 */
export async function purchaseCreditPackage(
  purchaseData: PurchaseCreditPackageSchema
): Promise<{
  transactionId: string;
  paymentUrl?: string;
  boletoUrl?: string;
  pixQrCode?: string;
}> {
  const response = await apiClient.post<ApiResponse<{
    transactionId: string;
    paymentUrl?: string;
    boletoUrl?: string;
    pixQrCode?: string;
  }>>(`${BASE_PATH}/purchase`, purchaseData);
  
  return response.data;
}

/**
 * Fetch credit transaction history
 */
export async function fetchCreditTransactions(
  filters?: CreditTransactionFiltersSchema
): Promise<{
  transactions: CreditTransaction[];
  total: number;
  page: number;
  limit: number;
}> {
  const params = filters ? new URLSearchParams(filters as any).toString() : '';
  const url = params ? `${BASE_PATH}/transactions?${params}` : `${BASE_PATH}/transactions`;
  
  const response = await apiClient.get<ApiResponse<{
    transactions: CreditTransaction[];
    total: number;
    page: number;
    limit: number;
  }>>(url);
  
  return response.data;
}

/**
 * Purchase lead access with credits
 */
export async function purchaseLeadAccess(
  purchaseData: PurchaseLeadSchema
): Promise<PurchaseLeadResponse> {
  const response = await apiClient.post<ApiResponse<PurchaseLeadResponse>>(
    `${BASE_PATH}/purchase-lead`,
    purchaseData
  );
  
  return response.data;
}
