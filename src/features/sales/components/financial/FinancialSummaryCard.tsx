/**
 * FinancialSummaryCard Component
 * Displays financial summary metrics
 */

import { Loader2, DollarSign, CreditCard, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useFinancialSummary } from '../../hooks/financial/useFinancialSummary';
import { FinancialSummaryParams } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface FinancialSummaryCardProps {
  params: FinancialSummaryParams;
}

/**
 * Metric Card Sub-component
 */
function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  color 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  color: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

/**
 * FinancialSummaryCard Component
 */
export function FinancialSummaryCard({ params }: FinancialSummaryCardProps) {
  const { data, isLoading, isError } = useFinancialSummary(params);

  // Loading state
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-32 bg-muted animate-pulse rounded-lg"
            aria-label="Carregando métrica"
          />
        ))}
      </div>
    );
  }

  // Error state
  if (isError || !data) {
    return (
      <Card className="border-red-500">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Erro ao carregar resumo financeiro
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Resumo Financeiro</h3>
        <p className="text-sm text-muted-foreground">
          {formatDate(data.period.startDate)} - {formatDate(data.period.endDate)}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Gasto"
          value={formatCurrency(data.totalSpent)}
          icon={DollarSign}
          color="text-red-600"
        />
        
        <MetricCard
          title="Créditos Ganhos"
          value={`${data.totalEarned} créditos`}
          icon={CreditCard}
          color="text-green-600"
        />
        
        <MetricCard
          title="Assinaturas Ativas"
          value={data.activeSubscriptions}
          icon={Users}
          color="text-blue-600"
        />
        
        <MetricCard
          title="Pagamentos Pendentes"
          value={data.pendingPayments}
          icon={Clock}
          color="text-yellow-600"
        />
      </div>
    </div>
  );
}
