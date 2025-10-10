import { Product } from '../../../types/product.types';
import { Subscription } from '../../../types/subscription.types';
import { formatPrice, getBillingCycleLabel } from '../../../services/productService';
import { TrialInstructions } from '../TrialInstructions';

interface PlanSelectionProps {
  product: Product;
  subscription?: Subscription;
  onEdit?: () => void;
  onContinue?: () => void;
}

export function PlanSelection({ product, subscription, onEdit, onContinue }: PlanSelectionProps) {
  const hasTrial = product.trialDays > 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Plano Selecionado</h3>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            type="button"
          >
            Alterar
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Nome do Plano */}
        <div>
          <h4 className="text-2xl font-bold text-gray-900">{product.name}</h4>
          {product.description && (
            <p className="mt-1 text-sm text-gray-600">{product.description}</p>
          )}
        </div>

        {/* Período de Trial */}
        {hasTrial && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <svg
                className="h-5 w-5 flex-shrink-0 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="ml-3">
                <h5 className="text-sm font-medium text-green-800">
                  Período de Teste Grátis
                </h5>
                <p className="mt-1 text-sm text-green-700">
                  Experimente por {product.trialDays} dias sem custo. Cancele quando quiser.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Preço */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-gray-600">Valor da assinatura:</span>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(product.priceMonthly)}
              </span>
              <span className="ml-1 text-gray-600">
                /{getBillingCycleLabel(product.billingCycle)}
              </span>
            </div>
          </div>
          
          {hasTrial && (
            <p className="mt-2 text-right text-sm text-gray-500">
              Cobrança após o período de teste
            </p>
          )}
        </div>

        {/* Recursos Incluídos */}
        <div className="border-t border-gray-200 pt-4">
          <h5 className="mb-3 text-sm font-semibold text-gray-900">
            Recursos Incluídos:
          </h5>
          <ul className="space-y-2">
            {product.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <svg
                  className="mr-2 h-5 w-5 flex-shrink-0 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sm text-gray-700">{feature}</span>
              </li>
            ))}
            
            {/* Sessões */}
            <li className="flex items-start">
              <svg
                className="mr-2 h-5 w-5 flex-shrink-0 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm text-gray-700">
                {product.maxSessions > 0
                  ? `Até ${product.maxSessions} ${
                      product.maxSessions === 1 ? 'sessão simultânea' : 'sessões simultâneas'
                    }`
                  : 'Sessões simultâneas ilimitadas'}
              </span>
            </li>

            {/* Leads */}
            {product.maxLeads !== null && (
              <li className="flex items-start">
                <svg
                  className="mr-2 h-5 w-5 flex-shrink-0 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sm text-gray-700">
                  {product.maxLeads} leads por mês
                </span>
              </li>
            )}
          </ul>
        </div>

        {/* Continue Button */}
        {onContinue && !subscription && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <button
              onClick={onContinue}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Continuar
            </button>
          </div>
        )}
      </div>

      {/* Trial Instructions */}
      {subscription && (
        <div className="mt-6">
          <TrialInstructions subscription={subscription} />
        </div>
      )}
    </div>
  );
}
