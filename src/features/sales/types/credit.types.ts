/**
 * Credit Types
 * 
 * TypeScript interfaces for credit system (one-time payments)
 */

/**
 * Credit transaction type enum
 */
export enum CreditTransactionType {
  /** Credit purchase */
  COMPRA = 'compra',
  
  /** Credit usage (spent) */
  USO = 'uso',
  
  /** Bonus credit */
  BONUS = 'bonus',
  
  /** Refund */
  REEMBOLSO = 'reembolso'
}

/**
 * Credit Transaction interface
 */
export interface CreditTransaction {
  /** Unique identifier */
  id: string;
  
  /** Company ID */
  empresaId: string;
  
  /** Transaction type */
  tipo: CreditTransactionType;
  
  /** Amount in centavos (positive for credits, negative for usage) */
  quantidade: number;
  
  /** Transaction description */
  descricao: string;
  
  /** Related product ID (for purchases) */
  produtoId: string | null;
  
  /** Related lead ID (for usage) */
  leadId: string | null;
  
  /** Balance after this transaction */
  saldoApos: number;
  
  /** Transaction timestamp */
  dataHora: string;
  
  /** Creation timestamp */
  createdAt: string;
  
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Credit Balance interface
 */
export interface CreditBalance {
  /** Company ID */
  empresaId: string;
  
  /** Company Name */
  empresaNome: string;
  
  /** Current balance in centavos */
  saldoCreditosCentavos: number;
  
  /** Formatted balance string */
  saldoFormatado: string;
  
  /** Computed: Current balance (alias for compatibility) */
  saldoAtual?: number;
  
  /** Usage statistics */
  estatisticas: {
    /** Total credits purchased */
    totalComprado: number;
    
    /** Total credits spent */
    totalGasto: number;
    
    /** Total bonus credits received */
    totalBonusRecebido: number;
    
    /** Computed: Number of leads purchased with credits */
    leadsComprados?: number;
    
    /** Computed: Average credit cost per lead */
    creditoMedioPorLead?: number;
    
    /** Computed: Estimated leads that can be purchased with current balance */
    leadsEstimados?: number;
  };
  
  /** Total credits purchased (alias for compatibility) */
  totalComprado?: number;
  
  /** Total credits spent (alias for compatibility) */
  totalGasto?: number;
  
  /** Total bonus credits received (alias for compatibility) */
  totalBonus?: number;
  
  /** Total refunded credits */
  totalReembolsado?: number;
  
  /** Last transaction (if any) */
  ultimaTransacao?: CreditTransaction | null;
}

/**
 * Credit Package interface
 */
export interface CreditPackage {
  /** Unique identifier */
  id: string;
  
  /** Package name */
  nome: string;
  
  /** Package description */
  descricao: string;
  
  /** Price in reais (not centavos) */
  preco: number;
  
  /** Formatted price string */
  precoFormatado: string;
  
  /** Credits amount */
  quantidade_creditos: number;
  
  /** Bonus credits */
  bonus_creditos: number;
  
  /** Whether package is active */
  ativo: boolean;
  
  /** Whether to show "Most Popular" badge */
  destaque: boolean;
  
  /** Package metadata */
  metadata: {
    /** Bonus credits */
    creditos_bonus: number;
    /** Total credits (quantidade + bonus) */
    creditos_total?: number;
    /** Cost per credit */
    custo_por_credito: number;
    /** Credits validity */
    validade_creditos: string;
    /** Quantity of credits */
    quantidade_creditos: number;
  };
  
  // Backward compatibility fields
  /** @deprecated Use quantidade_creditos */
  creditos?: number;
  /** @deprecated Use bonus_creditos */
  bonusPercentual?: number;
  /** @deprecated Use metadata.creditos_total */
  creditosTotal?: number;
  /** Display order */
  ordem?: number;
  /** Creation timestamp */
  createdAt?: string;
  /** Last update timestamp */
  updatedAt?: string;
}

/**
 * Credit Package with computed fields
 */
export interface CreditPackageWithComputed extends CreditPackage {
  /** Formatted price */
  precoFormatado: string;
  
  /** Formatted credits */
  creditosFormatados: string;
  
  /** Cost per credit in centavos */
  custoPorCredito: number;
  
  /** Formatted cost per credit */
  custoPorCreditoFormatado: string;
  
  /** Discount percentage compared to no bonus */
  percentualDesconto: number;
}

/**
 * Purchase Lead with Credits DTO
 */
export interface PurchaseLeadDTO {
  /** Lead ID to purchase */
  leadId: string;
}

/**
 * Purchase Lead Response
 */
export interface PurchaseLeadResponse {
  /** Transaction ID */
  transacaoId: string;
  
  /** Lead ID */
  leadId: string;
  
  /** Cost in credits (centavos) */
  custo: number;
  
  /** New balance after purchase */
  novoSaldo: number;
  
  /** Access granted */
  acessoConcedido: boolean;
  
  /** Full lead data (unmasked) */
  lead: any; // Will be defined in lead.types.ts
}

/**
 * Helper function to format credits as currency
 */
export function formatCreditsAsCurrency(centavos: number): string {
  const reais = centavos / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(reais);
}

/**
 * Helper function to calculate leads from credits
 */
export function calculateLeadsFromCredits(
  credits: number,
  averageCostPerLead: number
): number {
  if (averageCostPerLead === 0) return 0;
  return Math.floor(credits / averageCostPerLead);
}

/**
 * Helper function to calculate bonus credits
 */
export function calculateBonusCredits(
  baseCredits: number,
  bonusPercentual: number
): number {
  return Math.floor(baseCredits * (bonusPercentual / 100));
}

/**
 * Helper function to calculate total credits with bonus
 */
export function calculateTotalCredits(
  baseCredits: number,
  bonusPercentual: number
): number {
  return baseCredits + calculateBonusCredits(baseCredits, bonusPercentual);
}

/**
 * Transaction type colors
 */
export const TransactionTypeColors: Record<CreditTransactionType, string> = {
  [CreditTransactionType.COMPRA]: 'green',
  [CreditTransactionType.USO]: 'red',
  [CreditTransactionType.BONUS]: 'blue',
  [CreditTransactionType.REEMBOLSO]: 'yellow'
};

/**
 * Transaction type labels in Portuguese
 */
export const TransactionTypeLabels: Record<CreditTransactionType, string> = {
  [CreditTransactionType.COMPRA]: 'Compra',
  [CreditTransactionType.USO]: 'Uso',
  [CreditTransactionType.BONUS]: 'Bônus',
  [CreditTransactionType.REEMBOLSO]: 'Reembolso'
};

/**
 * Transaction type icons
 */
export const TransactionTypeIcons: Record<CreditTransactionType, string> = {
  [CreditTransactionType.COMPRA]: 'plus-circle',
  [CreditTransactionType.USO]: 'minus-circle',
  [CreditTransactionType.BONUS]: 'gift',
  [CreditTransactionType.REEMBOLSO]: 'arrow-left-circle'
};
