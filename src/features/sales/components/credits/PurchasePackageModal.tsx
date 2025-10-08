import { useState } from 'react';
import { CreditPackage } from '../../types/credit.types';
import { formatPrice } from '../../services/productService';
import { usePurchaseCreditPackage } from '../../hooks/credits/usePurchaseCreditPackage';

interface PurchasePackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  package: CreditPackage;
}

export function PurchasePackageModal({
  isOpen,
  onClose,
  package: pkg,
}: PurchasePackageModalProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const purchaseMutation = usePurchaseCreditPackage();

  const totalCredits = pkg.creditosTotal;

  const handlePurchase = async () => {
    if (!acceptedTerms) {
      return;
    }

    try {
      // Chama backend que retorna URL de pagamento
      const response = await purchaseMutation.mutateAsync({
        pacoteId: pkg.id,
      });

      // Redireciona para a URL de pagamento retornada pelo backend
      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
      }
    } catch (error) {
      console.error('Erro ao processar compra:', error);
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
        className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 id="modal-title" className="text-2xl font-bold text-gray-900">
            Confirmar Compra
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </div>

        {/* Detalhes do pacote */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">
            {pkg.nome}
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Créditos:</span>
              <span className="font-semibold text-gray-900">
                {pkg.creditos.toLocaleString('pt-BR')}
              </span>
            </div>

            {pkg.bonusPercentual > 0 && (
              <div className="flex justify-between">
                <span className="text-green-600">Bônus ({pkg.bonusPercentual}%):</span>
                <span className="font-semibold text-green-600">
                  +{(pkg.creditosTotal - pkg.creditos).toLocaleString('pt-BR')}
                </span>
              </div>
            )}

            <div className="flex justify-between border-t border-gray-300 pt-2">
              <span className="font-medium text-gray-700">Total de Créditos:</span>
              <span className="text-lg font-bold text-blue-600">
                {totalCredits.toLocaleString('pt-BR')}
              </span>
            </div>

            <div className="flex justify-between border-t-2 border-gray-400 pt-2">
              <span className="text-lg font-bold text-gray-900">Valor:</span>
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(pkg.preco)}
              </span>
            </div>
          </div>
        </div>

        {/* Informações importantes */}
        <div className="mb-6 rounded-lg bg-blue-50 p-4">
          <h4 className="mb-2 font-semibold text-blue-900">
            ℹ️ Informações Importantes
          </h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Os créditos não expiram</li>
            <li>• Você será redirecionado para página de pagamento segura</li>
            <li>• Os créditos são adicionados após confirmação do pagamento</li>
            <li>• Você receberá um email de confirmação</li>
          </ul>
        </div>

        {/* Termos e condições */}
        <div className="mb-6">
          <label className="flex cursor-pointer items-start space-x-3">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Li e aceito os{' '}
              <a href="/termos" className="text-blue-600 hover:underline">
                termos de serviço
              </a>{' '}
              e a{' '}
              <a href="/privacidade" className="text-blue-600 hover:underline">
                política de privacidade
              </a>
            </span>
          </label>
        </div>

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
            disabled={!acceptedTerms || purchaseMutation.isPending}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
              'Confirmar e Pagar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
