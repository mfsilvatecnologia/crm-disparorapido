import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Pagination } from '@/shared/components/Pagination';
import { CommissionsTable } from '../components/CommissionsTable';
import { useAffiliateCommissions } from '../hooks/useAffiliateCommissions';

export function AffiliateCommissionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [limit, setLimit] = useState<number>(() => Number(searchParams.get('limit')) || 20);
  const [offset, setOffset] = useState<number>(() => Number(searchParams.get('offset')) || 0);

  const { data, isLoading, isError, error, refetch } = useAffiliateCommissions({ limit, offset });

  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (limit !== 20) nextParams.set('limit', String(limit));
    if (offset !== 0) nextParams.set('offset', String(offset));
    setSearchParams(nextParams, { replace: true });
  }, [limit, offset, setSearchParams]);

  const currentPage = useMemo(() => Math.floor(offset / limit) + 1, [offset, limit]);
  const totalPages = useMemo(
    () => (data ? Math.max(1, Math.ceil(data.total / limit)) : 1),
    [data, limit]
  );

  const handlePageChange = (page: number) => {
    const newOffset = (page - 1) * limit;
    setOffset(Math.max(newOffset, 0));
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setOffset(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Histórico de Comissões</h1>
          <p className="text-muted-foreground">Visualize todas as comissões recebidas do programa.</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>Atualizar</Button>
      </div>

      <CommissionsTable
        data={data?.items}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error instanceof Error ? error.message : undefined}
      />

      {data && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={limit}
          totalItems={data.total}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleLimitChange}
        />
      )}
    </div>
  );
}
