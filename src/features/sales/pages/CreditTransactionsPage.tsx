/**
 * CreditTransactionsPage
 * Page for viewing credit transaction history
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditBalanceCard } from '../components/credits/CreditBalanceCard';
import { CreditTransactionList } from '../components/credits/CreditTransactionList';
import { TransactionTypeFilter } from '../components/credits/TransactionTypeFilter';
import { Pagination } from '@/shared/components/Pagination';
import { useCreditTransactions } from '../hooks/credits/useCreditTransactions';
import { useCreditBalance } from '../hooks/credits/useCreditBalance';
import { CreditTransactionType, CreditTransactionFilters } from '../types';

/**
 * CreditTransactionsPage Component
 */
export function CreditTransactionsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<CreditTransactionFilters>({
    type: undefined,
    page: 1,
    limit: 10,
  });

  const params = {
    page: filters.page,
    limit: filters.limit,
    type: filters.type,
  };

  const { data } = useCreditTransactions(params);
  const { balance, estimatedLeads } = useCreditBalance();

  const handleTypeChange = (type?: CreditTransactionType) => {
    setFilters((prev) => ({ ...prev, type, page: 1 }));
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
        <h1 className="text-3xl font-bold tracking-tight">Transações de Crédito</h1>
        <p className="text-muted-foreground">
          Visualize o histórico de todas as suas transações de crédito
        </p>
      </div>

      {/* Balance Card */}
      {balance && (
        <CreditBalanceCard 
          balance={balance}
          estimatedLeads={estimatedLeads}
          onBuyCredits={() => navigate('/credits/buy')}
        />
      )}

      {/* Filter */}
      <div className="bg-card rounded-lg border p-4">
        <TransactionTypeFilter
          value={filters.type}
          onChange={handleTypeChange}
        />
      </div>

      {/* Transaction List */}
      <CreditTransactionList params={params} />

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
