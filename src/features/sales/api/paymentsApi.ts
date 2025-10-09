/**
 * Payments API Client
 * API functions for payment endpoints
 */

import { apiClient } from '@/lib/api-client';
import {
  Payment,
  PaymentListParams,
  PaymentListResponse,
  PaymentActionResponse,
} from '../types';
import {
  paymentSchema,
  paymentListResponseSchema,
  paymentActionResponseSchema,
} from '../schemas';

/**
 * Fetch paginated payment list with filters
 */
export async function getPayments(params: PaymentListParams): Promise<PaymentListResponse> {
  const response = await apiClient.get<PaymentListResponse>('/payments', { params });
  return paymentListResponseSchema.parse(response.data);
}

/**
 * Fetch single payment by ID
 */
export async function getPaymentById(id: string): Promise<Payment> {
  const response = await apiClient.get<Payment>(`/payments/${id}`);
  return paymentSchema.parse(response.data);
}

/**
 * Cancel a pending payment
 */
export async function cancelPayment(id: string, reason?: string): Promise<PaymentActionResponse> {
  const response = await apiClient.post<PaymentActionResponse>(`/payments/${id}/cancel`, { reason });
  return paymentActionResponseSchema.parse(response.data);
}

/**
 * Refund a completed payment
 */
export async function refundPayment(id: string, reason?: string): Promise<PaymentActionResponse> {
  const response = await apiClient.post<PaymentActionResponse>(`/payments/${id}/refund`, { reason });
  return paymentActionResponseSchema.parse(response.data);
}

export const paymentsApi = {
  getPayments,
  getPaymentById,
  cancelPayment,
  refundPayment,
};
