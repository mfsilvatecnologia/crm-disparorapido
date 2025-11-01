/**
 * Payments API Client
 * API functions for payment endpoints (Backend API)
 */

import { apiClient } from '@/lib/api-client';
import {
  Payment,
  PaymentListParams,
  PaymentListResponse,
  FinancialSummary,
  FinancialSummaryParams,
} from '../types';
import {
  paymentSchema,
  paymentListResponseSchema,
  financialSummarySchema,
} from '../schemas';

/**
 * Fetch paginated payment history with filters
 * GET /payments/history
 */
export async function getPaymentHistory(params?: PaymentListParams): Promise<PaymentListResponse> {
  const response = await apiClient.get<any>('/api/v1/payments/history', { params });

  // API returns { success, data: { totalCount, limit, offset, data }, message, timestamp, trace }
  // apiClient.get() already extracts response.data, so 'response' here is the full API response

  // Check if the response has a nested 'data' property (API wrapper format)
  if (response && typeof response === 'object' && 'data' in response) {
    return paymentListResponseSchema.parse(response.data) as PaymentListResponse;
  }

  // If response is already the PaymentListResponse format
  if (response && typeof response === 'object' && 'totalCount' in response) {
    return paymentListResponseSchema.parse(response) as PaymentListResponse;
  }

  throw new Error(`Formato de resposta da API inesperado: ${typeof response}`);
}

/**
 * Fetch single payment by ID
 * GET /payments/{paymentId}
 */
export async function getPaymentById(id: string): Promise<Payment> {
  const response = await apiClient.get<any>(`/api/v1/payments/${id}`);

  // API returns { success, data: Payment, message, timestamp, trace }
  // apiClient.get() already extracts response.data, so 'response' here is the full API response

  // Check if the response has a nested 'data' property (API wrapper format)
  if (response && typeof response === 'object' && 'data' in response) {
    return paymentSchema.parse(response.data) as Payment;
  }

  // If response is already the Payment format
  if (response && typeof response === 'object' && 'id' in response) {
    return paymentSchema.parse(response) as Payment;
  }

  throw new Error(`Formato de resposta da API inesperado ao buscar pagamento: ${typeof response}`);
}

/**
 * Fetch financial summary
 * GET /payments/summary
 */
export async function getFinancialSummary(params?: FinancialSummaryParams): Promise<FinancialSummary> {
  const response = await apiClient.get('api/v1/payments/summary', { params });
  return financialSummarySchema.parse(response.data) as FinancialSummary;
}

export const paymentsApi = {
  getPaymentHistory,
  getPaymentById,
  getFinancialSummary,
};
