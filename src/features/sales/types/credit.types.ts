/**
 * Credit Types
 * TypeScript interfaces for credit transaction entities
 */

import { PaginationMeta } from './payment.types';

/**
 * Credit Transaction Type (Backend API)
 * Matches backend enum: compra, uso, reembolso, bonus
 */
export type CreditTransactionType =
  | 'compra'
  | 'uso'
  | 'reembolso'
  | 'bonus';

/**
 * Related Entity Type
 * - payment: Transaction related to a payment
 * - subscription: Transaction related to a subscription
 * - campaign: Transaction related to a campaign
 */
export type RelatedEntityType =
  | 'payment'
  | 'subscription'
  | 'campaign';

/**
 * Credit Transaction Entity (Backend API)
 * Represents a single credit transaction from backend
 */
export interface CreditTransaction {
  id: string;
  empresaId: string;
  type: CreditTransactionType;
  quantity: number;                  // Credit quantity
  previousBalance: number;           // Balance before transaction
  newBalance: number;                // Balance after transaction
  amountPaid: number | null;         // Amount paid (for purchases)
  paymentId: string | null;          // Related payment ID
  lead: {                            // Related lead (for usage)
    id: string;
    name: string;
  } | null;
  description: string;
  createdAt: string;                 // ISO 8601 datetime
}

/**
 * Credit Transaction List Query Parameters (Backend API)
 * Used for filtering and pagination
 */
export interface CreditTransactionListParams {
  limit?: number;                    // Items per page (default: 10)
  offset?: number;                   // Offset for pagination (default: 0)
  type?: CreditTransactionType;      // Filter by transaction type
}

/**
 * Credit Transaction List Response (Backend API)
 * Backend API response for GET /payments/credits/transactions
 */
export type CreditTransactionListResponse = CreditTransaction[];

/**
 * Credit Balance
 * Current credit balance for the user/company
 */
export interface CreditBalance {
  empresaId: string;
  empresaNome: string;
  saldoCreditosCentavos: number;
  saldoFormatado: string;
  estatisticas: {
    totalComprado: number;
    totalGasto: number;
    totalBonusRecebido: number;
  };
}

/**
 * Credit Package
 * Available package for purchasing credits
 */
export interface CreditPackage {
  id: string;
  nome: string;
  descricao?: string | null;
  preco_centavos: number;
  precoFormatado: string;
  quantidade_creditos: number;
  bonus_creditos: number;
  leadsInclusos?: number;
  bonusLeads?: number | null;
  custoPorLead?: string;
  ativo: boolean;
  destaque: boolean;
  economia?: string | null;
  metadata?: {
    creditos_total?: number;
    custo_por_credito?: number;
  };
}
