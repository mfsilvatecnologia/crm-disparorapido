import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Pagination } from '@/shared/components/Pagination';
import { CommissionsTable } from '../components/CommissionsTable';
import { AFFILIATE_PAGE_CLASS, AffiliatePageHeader } from '../components/AffiliatePageLayout';
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
    <div className={AFFILIATE_PAGE_CLASS}>
      <AffiliatePageHeader title="Histórico de Comissões" />

      <div className="flex justify-end">
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
