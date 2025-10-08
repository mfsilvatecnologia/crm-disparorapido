/**
 * Credit Service
 * 
 * Business logic for credit system operations
 */

import {
  CreditTransaction,
  CreditBalance,
  CreditTransactionType,
  formatCreditsAsCurrency,
  calculateLeadsFromCredits
} from '../types';

/**
 * Filter transactions by type
 */
export function filterByType(
  transactions: CreditTransaction[],
  types: CreditTransactionType[]
): CreditTransaction[] {
  return transactions.filter(t => types.includes(t.tipo));
}

/**
 * Get purchase transactions
 */
export function getPurchases(transactions: CreditTransaction[]): CreditTransaction[] {
  return filterByType(transactions, [CreditTransactionType.COMPRA]);
}

/**
 * Get usage transactions
 */
export function getUsage(transactions: CreditTransaction[]): CreditTransaction[] {
  return filterByType(transactions, [CreditTransactionType.USO]);
}

/**
 * Sort transactions by date (newest first)
 */
export function sortByDate(transactions: CreditTransaction[]): CreditTransaction[] {
  return [...transactions].sort((a, b) => 
    new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()
  );
}

/**
 * Calculate total credits purchased
 */
export function calculateTotalPurchased(transactions: CreditTransaction[]): number {
  return getPurchases(transactions).reduce((sum, t) => sum + t.quantidade, 0);
}

/**
 * Calculate total credits used
 */
export function calculateTotalUsed(transactions: CreditTransaction[]): number {
  return Math.abs(getUsage(transactions).reduce((sum, t) => sum + t.quantidade, 0));
}

/**
 * Check if has sufficient balance
 */
export function hasSufficientBalance(balance: CreditBalance, cost: number): boolean {
  const currentBalance = balance.saldoCreditosCentavos ?? balance.saldoAtual ?? 0;
  return currentBalance >= cost;
}

/**
 * Estimate leads that can be purchased
 */
export function estimateLeadsPurchasable(balance: CreditBalance): number {
  const currentBalance = balance.saldoCreditosCentavos ?? balance.saldoAtual ?? 0;
  const avgCost = balance.estatisticas?.creditoMedioPorLead ?? 0;
  
  if (avgCost === 0) {
    // If no average cost, use a default estimate (e.g., 100 centavos per lead)
    return Math.floor(currentBalance / 100);
  }
  
  return Math.floor(currentBalance / avgCost);
}
