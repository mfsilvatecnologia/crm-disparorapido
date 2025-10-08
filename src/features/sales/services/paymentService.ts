/**
 * Payment Service
 * 
 * Business logic for payment history operations
 */

import {
  PaymentHistory,
  PaymentStatus,
  isPaymentOverdue,
  getDaysUntilDue,
  formatPaymentAmount,
  PaymentStatusColors,
  PaymentStatusLabels
} from '../types';

/**
 * Filter payments by status
 */
export function filterByStatus(
  payments: PaymentHistory[],
  statuses: PaymentStatus[]
): PaymentHistory[] {
  return payments.filter(p => statuses.includes(p.status));
}

/**
 * Get overdue payments
 */
export function getOverduePayments(payments: PaymentHistory[]): PaymentHistory[] {
  return payments.filter(isPaymentOverdue);
}

/**
 * Get upcoming payments (due within days)
 */
export function getUpcomingPayments(
  payments: PaymentHistory[],
  days: number = 7
): PaymentHistory[] {
  return payments.filter(p => {
    const daysUntil = getDaysUntilDue(p);
    return daysUntil !== null && daysUntil >= 0 && daysUntil <= days;
  });
}

/**
 * Sort payments by due date
 */
export function sortByDueDate(payments: PaymentHistory[]): PaymentHistory[] {
  return [...payments].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
}

/**
 * Calculate total amount
 */
export function calculateTotal(payments: PaymentHistory[]): number {
  return payments.reduce((sum, p) => sum + p.amount, 0);
}

/**
 * Group payments by month
 */
export function groupByMonth(payments: PaymentHistory[]): Record<string, PaymentHistory[]> {
  return payments.reduce((acc, payment) => {
    const date = new Date(payment.dueDate);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(payment);
    return acc;
  }, {} as Record<string, PaymentHistory[]>);
}
