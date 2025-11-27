import { Loader2, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Commission } from '../types';
import { CommissionStatusBadge } from './CommissionStatusBadge';
import { formatCurrencyFromCents, formatOriginLabel } from '../utils/formatters';
import { formatDate } from '@/features/sales/utils/formatters';

interface CommissionsTableProps {
  data?: Commission[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
}

export function CommissionsTable({ data, isLoading, isError, errorMessage }: CommissionsTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Carregando comissões...
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar comissões</AlertTitle>
        <AlertDescription>{errorMessage || 'Tente novamente em instantes.'}</AlertDescription>
      </Alert>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Nenhuma comissão encontrada no período selecionado.
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Valor do Pagamento</TableHead>
            <TableHead>Créditos</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((commission) => (
            <TableRow key={commission.id}>
              <TableCell>{formatDate(commission.criadoEm, { includeTime: true })}</TableCell>
              <TableCell className="font-medium">{commission.empresaIndicadaNome || '-'}</TableCell>
              <TableCell>{formatOriginLabel(commission.tipoOrigem)}</TableCell>
              <TableCell>{formatCurrencyFromCents(commission.valorPagamentoCentavos)}</TableCell>
              <TableCell className="text-green-600 font-semibold">+{commission.comissaoCreditos}</TableCell>
              <TableCell>
                <CommissionStatusBadge status={commission.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
