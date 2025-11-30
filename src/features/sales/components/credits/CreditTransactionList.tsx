/**
 * CreditTransactionList Component
 * Displays a list of credit transactions
 */

import { Loader2, AlertCircle, TrendingUp, TrendingDown, Gift, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { useCreditTransactionHistory } from '../../hooks/credits/useCreditTransactionHistory';
import { CreditTransactionListParams, CreditTransaction } from '../../types';
import { formatDate, formatCurrency } from '../../utils/formatters';

interface CreditTransactionListProps {
  params: CreditTransactionListParams;
}

/**
 * Transaction type icon mapping (Backend API)
 */
const TRANSACTION_ICONS = {
  compra: TrendingUp,
  uso: TrendingDown,
  bonus: Gift,
  reembolso: RotateCcw,
} as const;

/**
 * Transaction type color mapping (Backend API)
 */
const TRANSACTION_COLORS = {
  compra: 'text-green-600',
  uso: 'text-red-600',
  bonus: 'text-blue-600',
  reembolso: 'text-purple-600',
} as const;

/**
 * Transaction type label mapping (Backend API)
 */
const TRANSACTION_LABELS = {
  compra: 'Compra',
  uso: 'Uso',
  bonus: 'Bônus',
  reembolso: 'Reembolso',
} as const;

/**
 * Transaction Card Sub-component
 */
function TransactionCard({ transaction }: { transaction: CreditTransaction }) {
  const Icon = TRANSACTION_ICONS[transaction.type];
  const color = TRANSACTION_COLORS[transaction.type];
  const isPositive = transaction.type === 'compra' || transaction.type === 'bonus' || transaction.type === 'reembolso';

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
          {isPositive ? '+' : ''}{transaction.quantity} créditos
        </span>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm">{transaction.description}</p>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatDate(transaction.createdAt, { includeTime: true })}</span>
            <span>Saldo após: {transaction.newBalance} créditos</span>
          </div>
          
          {transaction.amountPaid && (
            <p className="text-xs text-muted-foreground">
              Valor pago: {formatCurrency(transaction.amountPaid)}
            </p>
          )}
          
          {transaction.lead && (
            <p className="text-xs text-muted-foreground">
              Lead: {transaction.lead.name}
            </p>
          )}
          
          {transaction.paymentId && (
            <p className="text-xs text-muted-foreground">
              Pagamento: #{transaction.paymentId}
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
  const { data, isLoading, isError, error } = useCreditTransactionHistory(params);

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

  // Debug
  console.log('CreditTransactionList - data received:', data);
  console.log('CreditTransactionList - is array?', Array.isArray(data));
  console.log('CreditTransactionList - data.data:', data?.data);

  // Empty state - check both old array format and new paginated format
  const transactions = Array.isArray(data) ? data : data?.data;
  console.log('CreditTransactionList - transactions:', transactions);

  if (!transactions || transactions.length === 0) {
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
      {transactions.map((transaction) => (
        <TransactionCard key={transaction.id} transaction={transaction} />
      ))}
    </div>
  );
}
