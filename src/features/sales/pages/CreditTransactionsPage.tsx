/**
 * CreditTransactionsPage
 * Page for viewing credit transaction history with cursor pagination
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditBalanceCard } from '../components/credits/CreditBalanceCard';
import { CreditTransactionList } from '../components/credits/CreditTransactionList';
import { TransactionTypeFilter } from '../components/credits/TransactionTypeFilter';
import { CursorPagination } from '@/shared/components/CursorPagination';
import { useCreditTransactionHistory } from '../hooks/credits/useCreditTransactionHistory';
import { useCreditBalance } from '../hooks/credits/useCreditBalance';
import { CreditTransactionType, CreditTransactionListParams } from '../types';

/**
 * CreditTransactionsPage Component
 */
export function CreditTransactionsPage() {
  const navigate = useNavigate();
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [type, setType] = useState<CreditTransactionType | undefined>(undefined);
  const limit = 10;

  const params: CreditTransactionListParams = {
    cursor,
    limit,
    type,
  };

  const { data, isLoading } = useCreditTransactionHistory(params);
  const { balance, estimatedLeads } = useCreditBalance();

  // Debug: verificar estrutura dos dados
  console.log('=== DEBUG PAGINATION ===');
  console.log('Full data:', data);
  console.log('Pagination object:', data?.pagination);
  console.log('hasMore:', data?.pagination?.hasMore);
  console.log('nextCursor:', data?.pagination?.nextCursor);
  console.log('Cursor history length:', cursorHistory.length);
  console.log('Current cursor:', cursor);
  console.log('=======================');

  const handleTypeChange = (newType?: CreditTransactionType) => {
    setType(newType);
    setCursor(undefined);
    setCursorHistory([]);
  };

  const handleNext = () => {
    if (data?.pagination.nextCursor) {
      // Save current cursor to history
      if (cursor) {
        setCursorHistory((prev) => [...prev, cursor]);
      }
      // Move to next page
      setCursor(data.pagination.nextCursor);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    // Pop last cursor from history
    const previousCursor = cursorHistory[cursorHistory.length - 1];
    setCursorHistory((prev) => prev.slice(0, -1));
    setCursor(previousCursor);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          value={type}
          onChange={handleTypeChange}
        />
      </div>

      {/* Transaction List */}
      <CreditTransactionList params={params} />

      {/* Cursor Pagination */}
      {console.log('🎯 Rendering pagination? data exists:', !!data)}
      {data && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          {console.log('✅ Pagination component rendering!')}
          <CursorPagination
            hasMore={data.pagination?.hasMore ?? false}
            hasPrevious={cursorHistory.length > 0}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isLoading={isLoading}
            totalReturned={data.pagination?.totalReturned ?? (Array.isArray(data.data) ? data.data.length : 0)}
            limit={data.pagination?.limit ?? limit}
          />
        </div>
      )}
    </div>
  );
}
