import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { AffiliateStatistics } from '../types';
import { formatCurrencyFromCents } from '../utils/formatters';
import { Users, Coins, TrendingUp } from 'lucide-react';

interface StatisticsCardsProps {
  statistics?: AffiliateStatistics;
  isLoading?: boolean;
}

const statisticItems = [
  {
    key: 'totalIndicacoes' as const,
    label: 'Total de Indicações',
    icon: Users,
    formatter: (value: number) => value.toLocaleString('pt-BR'),
  },
  {
    key: 'totalComissoesCreditos' as const,
    label: 'Créditos Ganhos',
    icon: Coins,
    formatter: (value: number) => value.toLocaleString('pt-BR'),
  },
  {
    key: 'totalValorGeradoCentavos' as const,
    label: 'Valor Gerado',
    icon: TrendingUp,
    formatter: (value: number) => formatCurrencyFromCents(value),
  },
];

export function StatisticsCards({ statistics, isLoading }: StatisticsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {statisticItems.map((item) => (
        <Card key={item.key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.label}
            </CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {statistics ? item.formatter(statistics[item.key]) : '--'}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
