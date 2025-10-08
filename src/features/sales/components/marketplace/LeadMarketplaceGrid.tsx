import { useState } from 'react';
import { Lead } from '../../types/lead.types';
import { LeadMarketplaceCard } from './LeadMarketplaceCard';
import { LeadFilters, LeadFilterValues } from './LeadFilters';

interface LeadMarketplaceGridProps {
  leads: Lead[];
  ownedLeadIds?: string[];
  isLoading?: boolean;
  onPurchase: (leadId: string) => void;
  onView: (leadId: string) => void;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export function LeadMarketplaceGrid({
  leads,
  ownedLeadIds = [],
  isLoading = false,
  onPurchase,
  onView,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
}: LeadMarketplaceGridProps) {
  const [filters, setFilters] = useState<LeadFilterValues>({});

  const handleApplyFilters = (newFilters: LeadFilterValues) => {
    setFilters(newFilters);
    // Reset to first page when filters change
    onPageChange?.(1);
  };

  // Filtrar leads localmente (em produção, filtros devem ser aplicados no backend)
  const filteredLeads = leads.filter((lead) => {
    if (filters.segmento && lead.segmento !== filters.segmento) return false;
    if (filters.cidade && !lead.cidade.toLowerCase().includes(filters.cidade.toLowerCase())) return false;
    if (filters.estado && lead.estado !== filters.estado) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Carregando leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      {/* Sidebar de Filtros */}
      <aside className="lg:col-span-1">
        <LeadFilters onApplyFilters={handleApplyFilters} isLoading={isLoading} />
      </aside>

      {/* Grid de Leads */}
      <div className="lg:col-span-3">
        {/* Header com contagem */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} encontrado{filteredLeads.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Grid */}
        {filteredLeads.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-500">
              {Object.keys(filters).length > 0
                ? 'Nenhum lead encontrado com os filtros aplicados.'
                : 'Nenhum lead disponível no momento.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredLeads.map((lead) => (
              <LeadMarketplaceCard
                key={lead.id}
                lead={lead}
                isOwned={ownedLeadIds.includes(lead.id)}
                onPurchase={onPurchase}
                onView={onView}
              />
            ))}
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center space-x-2">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                    onClick={() => onPageChange?.(page)}
                    className={`
                      rounded-md px-4 py-2 text-sm font-medium
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
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
