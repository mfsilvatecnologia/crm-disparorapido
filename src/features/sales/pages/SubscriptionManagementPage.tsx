import { useState } from 'react';
import { useSubscriptions } from '../hooks/subscriptions/useSubscriptions';
import { CancelDialog } from '../components/subscriptions/SubscriptionDashboard/CancelDialog';
import { UpdateCardDialog } from '../components/subscriptions/SubscriptionDashboard/UpdateCardDialog';
import { PayOverdueDialog } from '../components/subscriptions/SubscriptionDashboard/PayOverdueDialog';
import { RestoreSubscriptionDialog } from '../components/subscriptions/SubscriptionDashboard/RestoreSubscriptionDialog';
import type { Subscription } from '../types';

export function SubscriptionManagementPage() {
  const { subscriptions, isLoading, refetch } = useSubscriptions();
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [subscriptionForCard, setSubscriptionForCard] = useState<Subscription | null>(null);
  const [subscriptionToRestore, setSubscriptionToRestore] = useState<Subscription | null>(null);
  const [subscriptionForPayment, setSubscriptionForPayment] = useState<Subscription | null>(null);

  const handleCancelClick = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowCancelDialog(true);
  };

  const handleCancelSuccess = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Carregando assinaturas...</p>
        </div>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-white p-8 shadow-sm text-center max-w-md">
          <p className="text-gray-600">Você não possui assinaturas.</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      active: { label: 'Ativa', className: 'bg-green-100 text-green-800' },
      ativa: { label: 'Ativa', className: 'bg-green-100 text-green-800' },
      trialing: { label: 'Em Trial', className: 'bg-blue-100 text-blue-800' },
      trial: { label: 'Em Trial', className: 'bg-blue-100 text-blue-800' },
      canceled: { label: 'Cancelada', className: 'bg-red-100 text-red-800' },
      cancelada: { label: 'Cancelada', className: 'bg-red-100 text-red-800' },
      suspended: { label: 'Suspensa', className: 'bg-yellow-100 text-yellow-800' },
      suspensa: { label: 'Suspensa', className: 'bg-yellow-100 text-yellow-800' },
      past_due: { label: 'Em atraso', className: 'bg-orange-100 text-orange-800' },
    };

    const config = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value); // Backend already returns value in BRL
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Assinatura</h1>
        </div>

        {/* Subscriptions Summary */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total de Assinaturas</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{subscriptions.length}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Ativas</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {subscriptions.filter((s) => {
                const status = s.status as string;
                return status === 'active' || status === 'ativa';
              }).length}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Em Trial</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {subscriptions.filter((s) => {
                const status = s.status as string;
                return status === 'trialing' || status === 'trial' || s.isInTrial;
              }).length}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Valor Mensal Total</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {formatValue(
                subscriptions
                  .filter((s) => {
                    const status = s.status as string;
                    return status === 'active' || status === 'ativa' || status === 'trialing' || status === 'trial';
                  })
                  .reduce((acc, s) => acc + s.value, 0),
              )}
            </p>
          </div>
        </div>

        {/* Subscriptions List */}
        <div className="mb-6 rounded-lg bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Plano
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Ciclo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Próximo Vencimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Trial
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Data Início
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {subscriptions.map((subscription) => {
                  const status = subscription.status as string;

                  const isActiveOrTrial =
                    status === 'active' || status === 'ativa' || status === 'trialing' || status === 'trial';
                  const isCanceled = status === 'canceled' || status === 'cancelada';
                  const isSuspendedOrPastDue =
                    status === 'suspended' || status === 'suspensa' || status === 'past_due';

                  return (
                    <tr key={subscription.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {subscription.description || 'Sem descrição'}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          ID: {subscription.id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {getStatusBadge(status)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {formatValue(subscription.value)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {subscription.billingCycleDescription || subscription.billingCycle}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {formatDate(subscription.nextDueDate)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        {subscription.isInTrial ? (
                          <span className="text-blue-600 font-medium">
                            {subscription.trialDays} dias
                            <br />
                            <span className="text-xs text-gray-500">
                              até {formatDate(subscription.trialEndDate)}
                            </span>
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {formatDate(subscription.startDate)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex flex-col gap-2 items-end">
                          {isActiveOrTrial && (
                            <button
                              onClick={() => setSubscriptionForCard(subscription)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                            >
                              Alterar cartão
                            </button>
                          )}
                          {isActiveOrTrial && (
                            <button
                              onClick={() => handleCancelClick(subscription)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                            >
                              Cancelar
                            </button>
                          )}
                          {isCanceled && (
                            <button
                              onClick={() => setSubscriptionToRestore(subscription)}
                              className="text-green-600 hover:text-green-900 transition-colors"
                            >
                              Retomar assinatura
                            </button>
                          )}
                          {isSuspendedOrPastDue && (
                            <>
                              <button
                                type="button"
                                onClick={() => setSubscriptionForPayment(subscription)}
                                className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-800 transition-colors font-semibold"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                                Regularizar / Pagar com cartão
                              </button>
                              <button
                                onClick={() => handleCancelClick(subscription)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                              >
                                Cancelar
                              </button>
                              {/* Fluxo de boleto/PIX externo desabilitado por enquanto */}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cancel Dialog */}
        {selectedSubscription && (
          <CancelDialog
            isOpen={showCancelDialog}
            onClose={() => {
              setShowCancelDialog(false);
              setSelectedSubscription(null);
            }}
            subscriptionId={selectedSubscription.id}
            productName={selectedSubscription.description || 'Assinatura'}
            onSuccess={handleCancelSuccess}
          />
        )}

        {/* Update Card Dialog */}
        {subscriptionForCard && (
          <UpdateCardDialog
            isOpen={!!subscriptionForCard}
            onClose={() => setSubscriptionForCard(null)}
            subscriptionId={subscriptionForCard.id}
            productName={subscriptionForCard.description || 'Assinatura'}
            onSuccess={() => {
              refetch();
              setSubscriptionForCard(null);
            }}
          />
        )}

        {/* Restore subscription: opção de reativar com cartão já usado ou com outro cartão; após sucesso, mesmo fluxo de reload do "Pagar fatura atrasada". */}
        {subscriptionToRestore && (
          <RestoreSubscriptionDialog
            subscription={subscriptionToRestore}
            isOpen={!!subscriptionToRestore}
            onClose={() => setSubscriptionToRestore(null)}
            onSuccess={() => {
              setSubscriptionToRestore(null);
              refetch();
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
          />
        )}

        {/* Pay Overdue Dialog: mantém "Processando pagamento" / "Atualizando página" pelo mesmo tempo (4s), depois fecha e recarrega para exibir status da fatura atualizado. */}
        {subscriptionForPayment && (
          <PayOverdueDialog
            subscription={subscriptionForPayment}
            onClose={() => setSubscriptionForPayment(null)}
            onSuccess={() => {
              setSubscriptionForPayment(null);
              refetch();
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
