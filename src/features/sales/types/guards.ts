/**
 * Type Guards
 * Runtime type checking functions using Zod schemas
 */

import { Payment } from './payment.types';
import { CreditTransaction } from './credit.types';
import { paymentSchema, creditTransactionSchema } from '../schemas';

/**
 * Type guard for Payment
 * @param value - The value to check
 * @returns true if value is a valid Payment
 */
export function isPayment(value: unknown): value is Payment {
  return paymentSchema.safeParse(value).success;
}

/**
 * Type guard for CreditTransaction
 * @param value - The value to check
 * @returns true if value is a valid CreditTransaction
 */
export function isCreditTransaction(value: unknown): value is CreditTransaction {
  return creditTransactionSchema.safeParse(value).success;
}

/**
 * Check if payment data is corrupted
 * @param payment - The payment object to validate
 * @returns true if payment data fails validation
 */
export function isCorruptedPayment(payment: unknown): boolean {
  const result = paymentSchema.safeParse(payment);
  return !result.success;
}
