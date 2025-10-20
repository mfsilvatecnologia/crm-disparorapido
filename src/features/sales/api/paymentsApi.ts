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
  const response = await apiClient.get('/api/v1/payments/history', { params });
  return paymentListResponseSchema.parse(response.data) as PaymentListResponse;
}

/**
 * Fetch single payment by ID
 * GET /payments/{paymentId}
 */
export async function getPaymentById(id: string): Promise<Payment> {
  const response = await apiClient.get(`/api/v1/payments/${id}`);
  return paymentSchema.parse(response.data) as Payment;
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
