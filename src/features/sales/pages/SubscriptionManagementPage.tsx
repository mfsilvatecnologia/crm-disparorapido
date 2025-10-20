import { useState } from 'react';
import { useSubscription } from '../hooks/subscriptions/useSubscription';
import { useProduct } from '../hooks/subscriptions/useProduct';
import { usePaymentHistory } from '../hooks/payments/usePaymentHistory';
import { LegacyPaymentStatus } from '../types/payment.types';
import { SubscriptionDetails } from '../components/subscriptions/SubscriptionDashboard/SubscriptionDetails';
import { CancelDialog } from '../components/subscriptions/SubscriptionDashboard/CancelDialog';
import { TrialBanner } from '../components/subscriptions/TrialBanner';

export function SubscriptionManagementPage() {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  const {
    subscription,
    isLoading: subscriptionLoading,
    daysRemaining
  } = useSubscription();
  const { data: product, isLoading: productLoading } = useProduct(subscription?.produtoId);
  const { data: payments, isLoading: paymentsLoading } = usePaymentHistory();

  const isLoading = subscriptionLoading || productLoading || paymentsLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Carregando assinatura...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <p className="mb-4 text-gray-600">Você não possui uma assinatura ativa.</p>
          <a
            href="/pricing"
            className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Ver Planos
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Assinatura</h1>
          <p className="mt-2 text-gray-600">
            Visualize e gerencie sua assinatura e histórico de pagamentos
          </p>
        </div>

        {/* Trial Banner (se estiver em trial) */}
        {(subscription.status === 'trial' || subscription.status === 'trialing' || subscription.isInTrial) && (
          <div className="mb-6">
            <TrialBanner
              subscription={subscription}
              product={product}
              daysRemaining={daysRemaining || 0}
              onManage={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
          </div>
        )}

        {/* Subscription Details */}
        <div className="mb-8">
          <SubscriptionDetails
            subscription={subscription}
            product={product}
            paymentHistory={payments?.data}
            onCancel={() => setShowCancelDialog(true)}
          />
        </div>

        {/* Payment History */}
        {payments && payments.data && payments.data.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-gray-900">
              Histórico de Pagamentos
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Método
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {payments.data.map((payment) => (
                    <tr key={payment.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        R$ {payment.value.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
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
                            : payment.status === 'OVERDUE'
                            ? 'Atrasado'
                            : payment.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {payment.billingType || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cancel Dialog */}
        <CancelDialog
          isOpen={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
          subscriptionId={subscription.id}
        />
      </div>
    </div>
  );
}
