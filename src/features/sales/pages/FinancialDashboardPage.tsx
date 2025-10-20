/**
 * FinancialDashboardPage
 * Financial dashboard with summary metrics
 */

import { useState } from 'react';
import { subDays } from 'date-fns';
import { FinancialSummaryCard } from '../components/financial/FinancialSummaryCard';
import { PeriodSelector } from '../components/financial/PeriodSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePayments } from '../hooks/payments/usePayments';
import { useCreditTransactions } from '../hooks/credits/useCreditTransactions';
import { PaymentCard } from '../components/payments/PaymentCard';
import { toISODate } from '../utils/formatters';

/**
 * FinancialDashboardPage Component
 */
export function FinancialDashboardPage() {
  const navigate = useNavigate();
  
  // Date range state (default: last 30 days)
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());

  // Fetch data
  const { data: recentPayments } = usePayments({
    limit: 5,
    offset: 0
  });

  const { data: recentTransactions } = useCreditTransactions({
    limit: 5,
    offset: 0
  });

  const handlePeriodChange = (newStartDate: Date, newEndDate: Date) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Financeiro</h1>
        <p className="text-muted-foreground">
          Visão geral das suas métricas financeiras
        </p>
      </div>

      {/* Period Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Período</CardTitle>
        </CardHeader>
        <CardContent>
          <PeriodSelector
            startDate={startDate}
            endDate={endDate}
            onPeriodChange={handlePeriodChange}
          />
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <FinancialSummaryCard params={{ period: 'last30days' }} />

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Pagamentos Recentes</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/payments')}
            >
              Ver todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments?.data?.slice(0, 5).map((payment) => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  onClick={() => navigate(`/payments/${payment.id}`)}
                />
              ))}
              {(!recentPayments?.data || recentPayments.data.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum pagamento recente
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Credit Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Transações de Crédito Recentes</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/credits/transactions')}
            >
              Ver todas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentTransactions?.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold ${
                    transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                  </span>
                </div>
              ))}
              {(!recentTransactions || recentTransactions.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma transação recente
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
