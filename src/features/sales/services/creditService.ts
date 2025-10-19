/**
 * Credit Service
 * 
 * Business logic for credit system operations
 */

import type {
  CreditTransaction,
  CreditBalance,
  CreditTransactionType,
} from '../types';

/**
 * Filter transactions by type
 */
export function filterByType(
  transactions: CreditTransaction[],
  types: CreditTransactionType[]
): CreditTransaction[] {
  return transactions.filter(t => types.includes(t.type));
}

/**
 * Get earned credit transactions
 */
export function getEarnedTransactions(transactions: CreditTransaction[]): CreditTransaction[] {
  return filterByType(transactions, ['earned']);
}

/**
 * Get spent credit transactions
 */
export function getSpentTransactions(transactions: CreditTransaction[]): CreditTransaction[] {
  return filterByType(transactions, ['spent']);
}

/**
 * Get bonus credit transactions
 */
export function getBonusTransactions(transactions: CreditTransaction[]): CreditTransaction[] {
  return filterByType(transactions, ['bonus']);
}

/**
 * Get refund credit transactions
 */
export function getRefundTransactions(transactions: CreditTransaction[]): CreditTransaction[] {
  return filterByType(transactions, ['refund']);
}

/**
 * Sort transactions by date (newest first)
 */
export function sortByDate(transactions: CreditTransaction[]): CreditTransaction[] {
  return [...transactions].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Calculate total credits earned
 */
export function calculateTotalEarned(transactions: CreditTransaction[]): number {
  return getEarnedTransactions(transactions).reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate total credits spent
 */
export function calculateTotalSpent(transactions: CreditTransaction[]): number {
  return Math.abs(getSpentTransactions(transactions).reduce((sum, t) => sum + t.amount, 0));
}

/**
 * Calculate total bonus credits
 */
export function calculateTotalBonus(transactions: CreditTransaction[]): number {
  return getBonusTransactions(transactions).reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Check if has sufficient balance
 */
export function hasSufficientBalance(balance: CreditBalance, cost: number): boolean {
  return balance.saldoCreditosCentavos >= cost;
}

/**
 * Estimate leads that can be purchased
 * @param balance Current credit balance
 * @param avgCostPerLead Average cost per lead in credits (default: 100)
 * @returns Estimated number of leads that can be purchased
 */
export function estimateLeadsPurchasable(balance: CreditBalance, avgCostPerLead = 100): number {
  return Math.floor(balance.saldoCreditosCentavos / avgCostPerLead);
}

/**
 * Format credit amount for display
 */
export function formatCreditAmount(amount: number): string {
  return new Intl.NumberFormat('pt-BR').format(amount);
}
