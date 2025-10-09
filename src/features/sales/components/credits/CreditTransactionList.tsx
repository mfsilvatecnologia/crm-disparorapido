/**
 * CreditTransactionList Component
 * Displays a list of credit transactions
 */

import { Loader2, AlertCircle, TrendingUp, TrendingDown, Gift, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { useCreditTransactions } from '../../hooks/credits/useCreditTransactions';
import { CreditTransactionListParams, CreditTransaction } from '../../types';
import { formatDate } from '../../utils/formatters';

interface CreditTransactionListProps {
  params: CreditTransactionListParams;
}

/**
 * Transaction type icon mapping
 */
const TRANSACTION_ICONS = {
  earned: TrendingUp,
  spent: TrendingDown,
  bonus: Gift,
  refund: RotateCcw,
} as const;

/**
 * Transaction type color mapping
 */
const TRANSACTION_COLORS = {
  earned: 'text-green-600',
  spent: 'text-red-600',
  bonus: 'text-blue-600',
  refund: 'text-purple-600',
} as const;

/**
 * Transaction type label mapping
 */
const TRANSACTION_LABELS = {
  earned: 'Ganhos',
  spent: 'Gastos',
  bonus: 'Bônus',
  refund: 'Reembolso',
} as const;

/**
 * Transaction Card Sub-component
 */
function TransactionCard({ transaction }: { transaction: CreditTransaction }) {
  const Icon = TRANSACTION_ICONS[transaction.type];
  const color = TRANSACTION_COLORS[transaction.type];
  const isPositive = transaction.amount > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
          <span className="text-sm font-medium text-muted-foreground">
            {TRANSACTION_LABELS[transaction.type]}
          </span>
        </div>
        <span className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{transaction.amount} créditos
        </span>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm">{transaction.description}</p>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatDate(transaction.createdAt, { includeTime: true })}</span>
            <span>Saldo após: {transaction.balanceAfter} créditos</span>
          </div>
          
          {transaction.relatedEntityType && transaction.relatedEntityId && (
            <p className="text-xs text-muted-foreground">
              Relacionado a: {transaction.relatedEntityType} #{transaction.relatedEntityId}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * CreditTransactionList Component
 */
export function CreditTransactionList({ params }: CreditTransactionListProps) {
  const { data, isLoading, isError, error } = useCreditTransactions(params);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-28 bg-muted animate-pulse rounded-lg"
            aria-label="Carregando transação"
          />
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar transações</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Ocorreu um erro ao buscar as transações.'}
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (!data?.transactions || data.transactions.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Nenhuma transação encontrada</AlertTitle>
        <AlertDescription>
          Não há transações de crédito que correspondam aos filtros selecionados.
        </AlertDescription>
      </Alert>
    );
  }

  // Success state
  return (
    <div className="space-y-4">
      {data.transactions.map((transaction) => (
        <TransactionCard key={transaction.id} transaction={transaction} />
      ))}
    </div>
  );
}
