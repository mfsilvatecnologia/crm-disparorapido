import { Lead } from '../../types/lead.types';
import { CreditBalance } from '../../types/credit.types';
import { LeadPreview } from './LeadPreview';
import { usePurchaseLead } from '../../hooks/marketplace/usePurchaseLead';

interface PurchaseLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  creditBalance: CreditBalance;
}

export function PurchaseLeadModal({
  isOpen,
  onClose,
  lead,
  creditBalance,
}: PurchaseLeadModalProps) {
  const purchaseMutation = usePurchaseLead();

  const cost = lead.custoCreditosCentavos;
  const balanceBefore = creditBalance.saldoAtual;
  const balanceAfter = balanceBefore - cost;
  const hasEnoughCredits = balanceAfter >= 0;

  const handlePurchase = async () => {
    if (!hasEnoughCredits) return;

    try {
      await purchaseMutation.mutateAsync({
        leadId: lead.id,
      });
      
      // Fecha modal após sucesso
      onClose();
    } catch (error) {
      console.error('Erro ao comprar lead:', error);
      // Erro já tratado pelo hook com toast
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 id="modal-title" className="text-2xl font-bold text-gray-900">
            Confirmar Compra de Lead
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </div>

        {/* Preview do Lead */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Preview do Lead</h3>
          <LeadPreview lead={lead} showFullData={false} />
        </div>

        {/* Informações de Custo */}
        <div className="mb-6 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Custo do Lead:</span>
            <span className="font-semibold text-gray-900">
              {(cost / 100).toLocaleString('pt-BR')} créditos
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Saldo Atual:</span>
            <span className="font-semibold text-gray-900">
              {(balanceBefore / 100).toLocaleString('pt-BR')} créditos
            </span>
          </div>

          <div className="flex justify-between border-t border-gray-300 pt-3">
            <span className="text-sm font-medium text-gray-700">Saldo Após Compra:</span>
            <span
              className={`text-lg font-bold ${
                hasEnoughCredits ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {(balanceAfter / 100).toLocaleString('pt-BR')} créditos
            </span>
          </div>
        </div>

        {/* Aviso de créditos insuficientes */}
        {!hasEnoughCredits && (
          <div className="mb-6 rounded-lg bg-red-50 p-4">
            <h4 className="mb-2 font-semibold text-red-900">
              ⚠️ Créditos Insuficientes
            </h4>
            <p className="text-sm text-red-800">
              Você precisa de mais{' '}
              <strong>{(Math.abs(balanceAfter) / 100).toLocaleString('pt-BR')}</strong>{' '}
              créditos para realizar esta compra.
            </p>
            <button
              onClick={onClose}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Comprar Créditos
            </button>
          </div>
        )}

        {/* Informações importantes */}
        {hasEnoughCredits && (
          <div className="mb-6 rounded-lg bg-blue-50 p-4">
            <h4 className="mb-2 font-semibold text-blue-900">
              ℹ️ Informações Importantes
            </h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Os dados completos serão revelados após a compra</li>
              <li>• A compra não pode ser desfeita</li>
              <li>• Os créditos serão debitados imediatamente</li>
              <li>• Você terá acesso permanente a este lead</li>
            </ul>
          </div>
        )}

        {/* Botões */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={purchaseMutation.isPending}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handlePurchase}
            disabled={!hasEnoughCredits || purchaseMutation.isPending}
            className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          >
            {purchaseMutation.isPending ? (
              <span className="flex items-center justify-center">
                <svg
                  className="mr-2 h-5 w-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processando...
              </span>
            ) : (
              '💰 Confirmar Compra'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
