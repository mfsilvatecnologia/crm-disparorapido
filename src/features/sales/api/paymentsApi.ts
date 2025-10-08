/**
 * Payments API Client
 * 
 * API methods for payment operations with Asaas integration
 */

import { apiClient } from '@/shared/services/client';
import type { Payment, PaymentHistory, PaymentMethod } from '../types';
import type { PaymentFiltersSchema } from '../schemas';
import { validatePaymentHistory } from '../schemas';

/**
 * Base path for payments API
 */
const BASE_PATH = '/api/v1/payments';

/**
 * Fetch payment history
 */
export async function fetchPaymentHistory(
  filters?: PaymentFiltersSchema
): Promise<{
  payments: PaymentHistory[];
  total: number;
  page: number;
  limit: number;
}> {
  const params = filters ? new URLSearchParams(filters as any).toString() : '';
  const url = params ? `${BASE_PATH}?${params}` : BASE_PATH;
  
  const data = await apiClient.get<{
    payments: PaymentHistory[];
    total: number;
    page: number;
    limit: number;
  }>(url);
  
  // Validate each payment
  data.payments.forEach(payment => {
    const validation = validatePaymentHistory(payment);
    if (!validation.success) {
      throw new Error('Invalid payment data from API');
    }
  });
  
  return data;
}

/**
 * Fetch payment by ID
 */
export async function fetchPaymentById(paymentId: string): Promise<PaymentHistory> {
  const data = await apiClient.get<PaymentHistory>(`${BASE_PATH}/${paymentId}`);
  
  // Validate response
  const validation = validatePaymentHistory(data);
  if (!validation.success) {
    throw new Error('Invalid payment data from API');
  }
  
  return data;
}

/**
 * Retry failed payment
 */
export async function retryPayment(
  paymentId: string,
  paymentData?: {
    paymentMethod?: 'CREDIT_CARD' | 'BOLETO' | 'PIX';
    creditCardToken?: string;
  }
): Promise<{
  payment: PaymentHistory;
  paymentUrl?: string;
  boletoUrl?: string;
  pixQrCode?: string;
}> {
  return await apiClient.post<{
    payment: PaymentHistory;
    paymentUrl?: string;
    boletoUrl?: string;
    pixQrCode?: string;
  }>(`${BASE_PATH}/${paymentId}/retry`, paymentData);
}

/**
 * Download invoice PDF
 */
export async function downloadInvoice(paymentId: string): Promise<Blob> {
  const response = await apiClient.getClient().get(
    `${BASE_PATH}/${paymentId}/invoice`,
    { responseType: 'blob' }
  );
  return response.data;
}
