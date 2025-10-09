import { Product } from '../../../types/product.types';
import { formatPrice, getBillingCycleLabel } from '../../../services/productService';

interface CheckoutConfirmationProps {
  product: Product;
  trialStartDate?: Date;
  trialEndDate?: Date;
  firstPaymentDate?: Date;
  onConfirm: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  errorMessage?: string;
}

export function CheckoutConfirmation({
  product,
  trialStartDate = new Date(),
  trialEndDate,
  firstPaymentDate,
  onConfirm,
  onCancel,
  isLoading = false,
  errorMessage,
}: CheckoutConfirmationProps) {
  const hasTrial = product.trialDays > 0;

  // Calcula datas se não fornecidas
  const calculatedTrialEnd = trialEndDate || new Date(trialStartDate.getTime() + product.trialDays * 24 * 60 * 60 * 1000);
  const calculatedFirstPayment = firstPaymentDate || new Date(calculatedTrialEnd.getTime() + 24 * 60 * 60 * 1000);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-xl font-bold text-gray-900">
          Confirme sua Assinatura
        </h3>

        {/* Mensagem de Erro */}
        {errorMessage && (
          <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Não foi possível processar sua solicitação
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{errorMessage}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resumo do Plano */}
        <div className="mb-6 rounded-md bg-gray-50 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">{product.name}</h4>
              {product.description && (
                <p className="mt-1 text-sm text-gray-600">{product.description}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900">
                {formatPrice(product.priceMonthly)}
              </div>
              <div className="text-sm text-gray-600">
                /{getBillingCycleLabel(product.billingCycle)}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-6 space-y-4">
          {/* Início do Trial */}
          <div className="flex items-start">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
              <span className="text-sm font-semibold text-blue-600">1</span>
            </div>
            <div className="ml-4">
              <h5 className="font-medium text-gray-900">
                {hasTrial ? 'Início do Período de Teste' : 'Início da Assinatura'}
              </h5>
              <p className="text-sm text-gray-600">{formatDate(trialStartDate)}</p>
              {hasTrial && (
                <p className="mt-1 text-sm text-gray-500">
                  Você terá {product.trialDays} dias para experimentar todos os recursos gratuitamente
                </p>
              )}
            </div>
          </div>

          {/* Fim do Trial */}
          {hasTrial && (
            <div className="flex items-start">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                <span className="text-sm font-semibold text-blue-600">2</span>
              </div>
              <div className="ml-4">
                <h5 className="font-medium text-gray-900">Fim do Período de Teste</h5>
                <p className="text-sm text-gray-600">{formatDate(calculatedTrialEnd)}</p>
                <p className="mt-1 text-sm text-gray-500">
                  Você pode cancelar a qualquer momento antes desta data sem custo
                </p>
              </div>
            </div>
          )}

          {/* Primeira Cobrança */}
          {firstPaymentDate && (
            <div className="flex items-start">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                <span className="text-sm font-semibold text-green-600">
                  {hasTrial ? '3' : '2'}
                </span>
              </div>
              <div className="ml-4">
                <h5 className="font-medium text-gray-900">Primeira Cobrança</h5>
                <p className="text-sm text-gray-600">{formatDate(firstPaymentDate)}</p>
                <p className="mt-1 text-sm text-gray-500">
                  Valor: {formatPrice(product.priceMonthly)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Termos e Condições */}
        <div className="mb-6 rounded-md bg-yellow-50 p-4">
          <h5 className="mb-2 text-sm font-semibold text-yellow-800">
            Importante
          </h5>
          <ul className="space-y-1 text-sm text-yellow-700">
            {hasTrial && (
              <li>• Cancele antes de {trialEndDate && formatDate(trialEndDate)} para não ser cobrado</li>
            )}
            <li>• A assinatura renova automaticamente</li>
            <li>• Você pode cancelar a qualquer momento</li>
            <li>• Sem taxas de cancelamento</li>
          </ul>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
          >
            Voltar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="mr-2 h-5 w-5 animate-spin"
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
              `${hasTrial ? 'Iniciar Teste Grátis' : 'Confirmar Assinatura'}`
            )}
          </button>
        </div>

        {/* Informação de Segurança */}
        <p className="mt-4 text-center text-xs text-gray-500">
          🔒 Transação segura e protegida
        </p>
      </div>
    </div>
  );
}
