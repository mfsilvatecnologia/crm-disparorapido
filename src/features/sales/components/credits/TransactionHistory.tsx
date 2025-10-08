import { useState } from 'react';
import { CreditTransaction, CreditTransactionType } from '../../types/credit.types';
import { formatPrice } from '../../services/productService';

interface TransactionHistoryProps {
  transactions: CreditTransaction[];
  isLoading?: boolean;
  itemsPerPage?: number;
}

export function TransactionHistory({
  transactions,
  isLoading = false,
  itemsPerPage = 10,
}: TransactionHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Paginação
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = transactions.slice(startIndex, endIndex);

  // Ícone e cor por tipo de transação
  const getTransactionIcon = (type: CreditTransactionType) => {
    switch (type) {
      case CreditTransactionType.COMPRA:
        return { icon: '💰', color: 'text-green-600', bg: 'bg-green-50' };
      case CreditTransactionType.BONUS:
        return { icon: '🎁', color: 'text-blue-600', bg: 'bg-blue-50' };
      case CreditTransactionType.USO:
        return { icon: '📊', color: 'text-orange-600', bg: 'bg-orange-50' };
      case CreditTransactionType.REEMBOLSO:
        return { icon: '↩️', color: 'text-purple-600', bg: 'bg-purple-50' };
      default:
        return { icon: '📋', color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const getTransactionLabel = (type: CreditTransactionType) => {
    switch (type) {
      case CreditTransactionType.COMPRA:
        return 'Compra';
      case CreditTransactionType.BONUS:
        return 'Bônus';
      case CreditTransactionType.USO:
        return 'Uso';
      case CreditTransactionType.REEMBOLSO:
        return 'Reembolso';
      default:
        return 'Outros';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-500">Nenhuma transação encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Lista de transações */}
      <div className="space-y-3">
        {currentTransactions.map((transaction) => {
          const { icon, color, bg } = getTransactionIcon(transaction.tipo);
          const isPositive = transaction.tipo === CreditTransactionType.COMPRA || 
                           transaction.tipo === CreditTransactionType.BONUS ||
                           transaction.tipo === CreditTransactionType.REEMBOLSO;

          return (
            <div
              key={transaction.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Ícone e tipo */}
              <div className="flex items-center space-x-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${bg}`}>
                  <span className="text-xl">{icon}</span>
                </div>
                <div>
                  <p className={`font-semibold ${color}`}>
                    {getTransactionLabel(transaction.tipo)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.dataHora).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {transaction.descricao && (
                    <p className="mt-1 text-xs text-gray-600">
                      {transaction.descricao}
                    </p>
                  )}
                </div>
              </div>

              {/* Valores */}
              <div className="text-right">
                <p
                  className={`text-lg font-bold ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isPositive ? '+' : ''}{transaction.quantidade.toLocaleString('pt-BR')}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Saldo: {transaction.saldoApos.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Próxima
            </button>
          </div>

          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando{' '}
                <span className="font-medium">{startIndex + 1}</span>
                {' '}-{' '}
                <span className="font-medium">
                  {Math.min(endIndex, transactions.length)}
                </span>
                {' '}de{' '}
                <span className="font-medium">{transactions.length}</span>
                {' '}transações
              </p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>

              {/* Números das páginas */}
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                // Mostra apenas algumas páginas
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`
                        relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium
                        ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      {page}
                    </button>
                  );
                }
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2 text-gray-500">...</span>;
                }
                return null;
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
