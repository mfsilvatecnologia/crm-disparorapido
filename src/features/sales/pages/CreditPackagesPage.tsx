import { useState } from 'react';
import { useCreditPackages } from '../hooks/credits/useCreditPackages';
import { useCreditBalance } from '../hooks/credits/useCreditBalance';
import { CreditBalanceCard } from '../components/credits/CreditBalanceCard';
import { CreditPackagesGrid } from '../components/credits/CreditPackagesGrid';
import { PurchasePackageModal } from '../components/credits/PurchasePackageModal';

export function CreditPackagesPage() {
  const [selectedPackageId, setSelectedPackageId] = useState<string | undefined>();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const { data: packages, isLoading: packagesLoading } = useCreditPackages();
  const { data: balance, isLoading: balanceLoading } = useCreditBalance();

  const isLoading = packagesLoading || balanceLoading;

  const selectedPackage = packages?.find((pkg) => pkg.id === selectedPackageId);

  const handleSelectPackage = (packageId: string) => {
    setSelectedPackageId(packageId);
  };

  const handleBuyCredits = () => {
    if (selectedPackageId) {
      setShowPurchaseModal(true);
    }
  };

  const handleClosePurchaseModal = () => {
    setShowPurchaseModal(false);
    setSelectedPackageId(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Carregando pacotes de créditos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Comprar Créditos</h1>
          <p className="mt-2 text-gray-600">
            Adquira créditos para comprar leads qualificados no marketplace
          </p>
        </div>

        {/* Balance Card */}
        {balance && (
          <div className="mb-8">
            <CreditBalanceCard
              balance={balance}
              estimatedLeads={balance.estatisticas.leadsEstimados}
              onBuyCredits={() => window.scrollTo({ top: 400, behavior: 'smooth' })}
            />
          </div>
        )}

        {/* Info Section */}
        <div className="mb-8 rounded-lg bg-blue-50 p-6">
          <h2 className="mb-3 text-lg font-semibold text-blue-900">
            Como funcionam os créditos?
          </h2>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">💰</span>
              <span>Use créditos para comprar leads qualificados no marketplace</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🎁</span>
              <span>Ganhe bônus em créditos ao comprar pacotes maiores</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">♾️</span>
              <span>Seus créditos não expiram - use quando quiser</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">📊</span>
              <span>Acompanhe todo o histórico de transações</span>
            </li>
          </ul>
        </div>

        {/* Packages Grid */}
        <div className="mb-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Escolha seu Pacote
          </h2>
          <CreditPackagesGrid
            packages={packages || []}
            selectedPackageId={selectedPackageId}
            onSelectPackage={handleSelectPackage}
          />
        </div>

        {/* CTA Button */}
        {selectedPackageId && (
          <div className="sticky bottom-0 border-t border-gray-200 bg-white p-4 shadow-lg">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pacote selecionado:</p>
                <p className="font-semibold text-gray-900">
                  {selectedPackage?.nome}
                </p>
              </div>
              <button
                onClick={handleBuyCredits}
                className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700"
              >
                Comprar Agora
              </button>
            </div>
          </div>
        )}

        {/* Purchase Modal */}
        {selectedPackage && (
          <PurchasePackageModal
            isOpen={showPurchaseModal}
            onClose={handleClosePurchaseModal}
            package={selectedPackage}
          />
        )}
      </div>
    </div>
  );
}
