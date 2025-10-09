/**
 * PaymentHistoryPage
 * Main page for viewing payment history with filters and pagination
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PaymentFilters } from '../components/payments/PaymentFilters';
import { PaymentList } from '../components/payments/PaymentList';
import { Pagination } from '@/shared/components/Pagination';
import { usePayments } from '../hooks/payments/usePayments';
import { PaymentFilters as PaymentFiltersType } from '../types';
import { toISODate } from '../utils/formatters';

/**
 * PaymentHistoryPage Component
 */
export function PaymentHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize filters from URL or defaults
  const [filters, setFilters] = useState<PaymentFiltersType>(() => {
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    return {
      status: status as any || undefined,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    };
  });

  // Fetch payments with current filters
  const params = {
    page: filters.page,
    limit: filters.limit,
    status: filters.status,
    startDate: filters.startDate ? toISODate(filters.startDate) : undefined,
    endDate: filters.endDate ? toISODate(filters.endDate) : undefined,
  };

  const { data } = usePayments(params);

  // Update URL when filters change
  useEffect(() => {
    const newParams = new URLSearchParams();
    
    if (filters.status) newParams.set('status', filters.status);
    if (filters.startDate) newParams.set('startDate', filters.startDate.toISOString());
    if (filters.endDate) newParams.set('endDate', filters.endDate.toISOString());
    if (filters.page > 1) newParams.set('page', filters.page.toString());
    if (filters.limit !== 10) newParams.set('limit', filters.limit.toString());

    setSearchParams(newParams, { replace: true });
  }, [filters, setSearchParams]);

  const handleFiltersChange = (newFilters: PaymentFiltersType) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (limit: number) => {
    setFilters((prev) => ({ ...prev, limit, page: 1 }));
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Histórico de Pagamentos</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie todos os pagamentos da sua empresa
        </p>
      </div>

      {/* Filters */}
      <PaymentFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Payment List */}
      <PaymentList params={params} />

      {/* Pagination */}
      {data?.pagination && (
        <Pagination
          currentPage={data.pagination.currentPage}
          totalPages={data.pagination.totalPages}
          totalItems={data.pagination.totalItems}
          itemsPerPage={data.pagination.itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}
    </div>
  );
}
