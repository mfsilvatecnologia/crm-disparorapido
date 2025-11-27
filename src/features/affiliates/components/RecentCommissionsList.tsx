import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { CommissionSummary } from '../types';
import { CommissionStatusBadge } from './CommissionStatusBadge';
import { formatRelativeDate } from '../utils/formatters';
import { Coins } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecentCommissionsListProps {
  commissions?: CommissionSummary[];
  isLoading?: boolean;
}

export function RecentCommissionsList({ commissions, isLoading }: RecentCommissionsListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Últimas comissões</CardTitle>
        <Link to="/app/afiliados/comissoes" className="text-sm text-primary hover:underline">
          Ver todas
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        ) : commissions && commissions.length > 0 ? (
          <div className="space-y-3">
            {commissions.map((commission) => (
              <div
                key={commission.id}
                className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Coins className="h-4 w-4 text-primary" />
                    <span>+{commission.comissaoCreditos} créditos</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Recebido {formatRelativeDate(commission.createdAt)}
                  </div>
                </div>
                <CommissionStatusBadge status={commission.status} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Nenhuma comissão registrada ainda. Compartilhe seu link para começar a ganhar créditos.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
