import { Subscription, isTrialExpired as checkTrialExpired, getDaysRemainingInTrial } from '../../../types/subscription.types';
import { Product } from '../../../types/product.types';
import { Payment } from '../../../types/payment.types';
import { BillingCycle } from '../../../types/product.types';
import { StatusBadge } from './StatusBadge';
import { formatPrice, getBillingCycleLabel } from '../../../services/productService';

interface SubscriptionDetailsProps {
  subscription: Subscription;
  product?: Product;
  paymentHistory?: Payment[];
  onManage?: () => void;
  onViewPayments?: () => void;
  onCancel?: () => void;
  onActivate?: () => void;
}

export function SubscriptionDetails({
  subscription,
  product,
  paymentHistory = [],
  onManage,
  onViewPayments,
  onActivate,
}: SubscriptionDetailsProps) {
  const isTrialExpired = checkTrialExpired(subscription);
  const daysRemaining = getDaysRemainingInTrial(subscription);
  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  const recentPayments = paymentHistory.slice(0, 3);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{product?.name || 'Plano'}</h2>
            {product?.description && (
              <p className="mt-1 text-sm text-gray-600">{product.description}</p>
            )}
          </div>
          <StatusBadge status={subscription.status} size="lg" isTrialExpired={isTrialExpired} />
        </div>
      </div>

      {/* Subscription Info */}
      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Plano e Preço */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Detalhes do Plano
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-600">Valor</dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">
                  {subscription.valueFormatted || formatPrice(subscription.value)}
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    /{subscription.billingCycleDescription || getBillingCycleLabel(subscription.billingCycle as BillingCycle)}
                  </span>
                </dd>
              </div>

              {subscription.nextDueDate && (
                <div>
                  <dt className="text-sm text-gray-600">Próxima Cobrança</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {formatDate(subscription.nextDueDate)}
                  </dd>
                </div>
              )}

              {product && (
                <div>
                  <dt className="text-sm text-gray-600">Sessões Simultâneas</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {product.maxSessions > 0 ? product.maxSessions : 'Ilimitadas'}
                  </dd>
                </div>
              )}

              {product?.maxLeads && (
                <div>
                  <dt className="text-sm text-gray-600">Leads por Mês</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {product.maxLeads}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Período de Trial / Datas */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Informações da Assinatura
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-600">Data de Criação</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  {formatDate(subscription.createdAt)}
                </dd>
              </div>

              {subscription.startDate && (
                <div>
                  <dt className="text-sm text-gray-600">Início da Assinatura</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {formatDate(subscription.startDate)}
                  </dd>
                </div>
              )}

              {subscription.trialEndDate && (
                <div>
                  <dt className="text-sm text-gray-600">Fim do Trial</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {formatDate(subscription.trialEndDate)}
                  </dd>
                </div>
              )}

              {subscription.canceledAt && (
                <div>
                  <dt className="text-sm text-gray-600">Data de Cancelamento</dt>
                  <dd className="mt-1 text-lg font-semibold text-red-600">
                    {formatDate(subscription.canceledAt)}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Features */}
        {product?.features && product.features.length > 0 && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Recursos Incluídos
            </h3>
            <ul className="grid gap-2 sm:grid-cols-2">
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
            </ul>
          </div>
        )}

        {/* Payment History Preview */}
        {recentPayments.length > 0 && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Histórico de Pagamentos
              </h3>
              <button
                onClick={onViewPayments}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                type="button"
              >
                Ver Todos
              </button>
            </div>
            <div className="space-y-2">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-md bg-gray-50 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      R$ {payment.value.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatDate(payment.paymentDate || payment.dueDate)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      payment.status === 'RECEIVED' || payment.status === 'CONFIRMED'
                        ? 'bg-green-100 text-green-800'
                        : payment.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {payment.status === 'RECEIVED' || payment.status === 'CONFIRMED'
                      ? 'Pago'
                      : payment.status === 'PENDING'
                      ? 'Pendente'
                      : payment.status === 'REFUNDED'
                      ? 'Reembolsado'
                      : 'Atrasado'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 border-t border-gray-200 pt-6">
          {isTrialExpired ? (
            <button
              onClick={onActivate || onManage}
              className="w-full animate-pulse rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-red-700 hover:to-red-800 hover:shadow-xl sm:w-auto"
              type="button"
            >
              Ativar Assinatura
            </button>
          ) : (
            <button
              onClick={onManage}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto"
              type="button"
            >
              Gerenciar Assinatura
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
