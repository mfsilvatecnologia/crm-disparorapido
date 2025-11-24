import { useState } from 'react';
import { useMarketplaceLeads } from '../hooks/marketplace/useMarketplaceLeads';
import { useCreditBalance } from '../hooks/credits/useCreditBalance';
import { usePurchasedLeads } from '../hooks/marketplace/usePurchasedLeads';
import { LeadMarketplaceGrid } from '../components/marketplace/LeadMarketplaceGrid';
import { PurchaseLeadModal } from '../components/marketplace/PurchaseLeadModal';
import { CreditBalanceCard } from '../components/credits/CreditBalanceCard';
import { Lead } from '../types/lead.types';

export function MarketplacePage() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: leadsData, isLoading: leadsLoading } = useMarketplaceLeads({
    page: currentPage,
    limit: 12,
  });
  
  const { balance, estimatedLeads, isLoading: balanceLoading } = useCreditBalance();
  const { data: ownedLeadsData } = usePurchasedLeads();

  const isLoading = leadsLoading || balanceLoading;

  const leads = leadsData?.leads || [];
  const total = leadsData?.total || 0;
  const totalPages = Math.ceil(total / 12);
  const ownedLeadIds = ownedLeadsData?.leads?.map((lead) => lead.id) || [];

  const handlePurchase = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      setSelectedLead(lead);
      setShowPurchaseModal(true);
    }
  };

  const handleView = (leadId: string) => {
    // Navegar para página de detalhes do lead
    window.location.href = `/leads/${leadId}`;
  };

  const handleClosePurchaseModal = () => {
    setShowPurchaseModal(false);
    setSelectedLead(null);
  };

  const handleBuyCredits = () => {
    window.location.href = '/credits';
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Carregando marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Marketplace de Leads</h1>
          <p className="mt-2 text-gray-600">
            Encontre e compre leads qualificados para seu negócio
          </p>
        </div>

        {/* Balance Card */}
        {balance && (
          <div className="mb-8">
            <CreditBalanceCard
              balance={balance}
              estimatedLeads={estimatedLeads}
              onBuyCredits={handleBuyCredits}
            />
          </div>
        )}

        {/* Info Banner */}
        <div className="mb-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Leads Qualificados e Verificados</h2>
              <p className="mt-2 text-blue-100">
                Todos os leads são verificados e atualizados regularmente
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{leads.length}+</p>
                <p className="text-sm text-blue-100">Leads Disponíveis</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">10+</p>
                <p className="text-sm text-blue-100">Segmentos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Marketplace Grid */}
        <LeadMarketplaceGrid
          leads={leads}
          ownedLeadIds={ownedLeadIds}
          isLoading={leadsLoading}
          onPurchase={handlePurchase}
          onView={handleView}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />

        {/* Purchase Modal */}
        {selectedLead && balance && (
          <PurchaseLeadModal
            isOpen={showPurchaseModal}
            onClose={handleClosePurchaseModal}
            lead={selectedLead}
            creditBalance={balance}
          />
        )}

        {/* Help Section */}
        <div className="mt-12 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Precisa de ajuda?
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h4 className="font-medium text-gray-900">🔍 Como filtrar?</h4>
              <p className="mt-1 text-sm text-gray-600">
                Use os filtros na barra lateral para encontrar leads por segmento,
                cidade ou estado.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">💰 Como comprar?</h4>
              <p className="mt-1 text-sm text-gray-600">
                Clique em "Comprar" no lead desejado, confirme a compra e os dados
                completos serão revelados.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">📊 Sem créditos?</h4>
              <p className="mt-1 text-sm text-gray-600">
                Adquira mais créditos clicando em "Comprar Créditos" no card de
                saldo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
