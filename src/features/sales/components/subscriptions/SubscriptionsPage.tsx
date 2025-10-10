/**
 * Subscription Management Page
 * Shows current subscription status and allows management
 */

import React from 'react';
import { useSubscriptionPolling } from '../../hooks/useSubscription';
import { TrialInstructions } from './TrialInstructions';
import type { Subscription } from '../../types/subscription.types';

// Internal component for rendering individual subscription cards
interface SubscriptionCardProps {
  subscription: Subscription;
  isPrimary?: boolean;
}

function SubscriptionCardComponent({ subscription, isPrimary = false }: SubscriptionCardProps) {
  return (
    <div className={`rounded-lg border bg-white p-6 shadow-sm ${isPrimary ? 'border-blue-200 ring-2 ring-blue-100' : 'border-gray-200'}`}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {isPrimary ? 'Assinatura Principal' : 'Assinatura'}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Status: {getStatusText(subscription.status)}
          </p>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(subscription.status)}`}>
          {subscription.status}
        </span>
      </div>

      {/* Subscription Details */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-sm font-medium text-gray-500">ID</dt>
          <dd className="mt-1 text-sm text-gray-900">{subscription.id.slice(0, 8)}...</dd>
        </div>
        
        <div>
          <dt className="text-sm font-medium text-gray-500">Valor</dt>
          <dd className="mt-1 text-sm text-gray-900">{subscription.valueFormatted}</dd>
        </div>
        
        <div>
          <dt className="text-sm font-medium text-gray-500">Ciclo</dt>
          <dd className="mt-1 text-sm text-gray-900">{subscription.billingCycleDescription}</dd>
        </div>
        
        {subscription.hasTrial && subscription.trialDays && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Dias de Trial</dt>
            <dd className="mt-1 text-sm text-gray-900">{subscription.trialDays} dias</dd>
          </div>
        )}
        
        {subscription.trialEndDate && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Fim do Trial</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(subscription.trialEndDate).toLocaleDateString('pt-BR')}
            </dd>
          </div>
        )}
        
        {subscription.nextDueDate && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Próximo Vencimento</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(subscription.nextDueDate).toLocaleDateString('pt-BR')}
            </dd>
          </div>
        )}
        
        <div>
          <dt className="text-sm font-medium text-gray-500">Início</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {new Date(subscription.startDate).toLocaleDateString('pt-BR')}
          </dd>
        </div>
        
        <div>
          <dt className="text-sm font-medium text-gray-500">Pagamentos</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {subscription.paymentsCount}
            {subscription.maxPayments ? ` / ${subscription.maxPayments}` : ''}
          </dd>
        </div>
      </div>

      {/* Trial Instructions */}
      {subscription.status === 'trialing' && (
        <TrialInstructions subscription={subscription} />
      )}
    </div>
  );
}

interface SubscriptionsPageProps {
  onNavigateToPlans?: () => void;
}

export function SubscriptionsPage({ onNavigateToPlans }: SubscriptionsPageProps) {
  const {
    subscription,
    subscriptions,
    isLoading,
    error,
    hasActiveSubscription,
    isInTrial,
    startPolling,
    stopPolling,
    isPolling,
  } = useSubscriptionPolling(3000); // Poll every 3 seconds

  React.useEffect(() => {
    // Start polling if we don't have an active subscription
    if (!hasActiveSubscription && !isLoading) {
      startPolling();
    }
    
    return () => stopPolling();
  }, [hasActiveSubscription, isLoading, startPolling, stopPolling]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h3 className="text-lg font-semibold text-red-900">Erro ao carregar assinaturas</h3>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Minhas Assinaturas</h1>
        <p className="mt-2 text-gray-600">
          Gerencie suas assinaturas e acesso aos recursos da plataforma
        </p>
      </div>

      {/* Status de Polling */}
      {isPolling && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center">
            <div className="animate-spin mr-3 h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <p className="text-sm text-blue-800">
              Verificando status da assinatura... A página será atualizada automaticamente.
            </p>
          </div>
        </div>
      )}

      {/* Subscription Cards */}
      <div className="space-y-6">
        {subscriptions.length > 0 ? (
          subscriptions.map((sub) => (
            <SubscriptionCardComponent 
              key={sub.id} 
              subscription={sub} 
              isPrimary={sub.id === subscription?.id}
            />
          ))
        ) : subscription ? (
          <SubscriptionCardComponent subscription={subscription} isPrimary={true} />
        ) : hasActiveSubscription ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-gray-600">Você tem uma assinatura ativa, mas os detalhes não puderam ser carregados.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhuma assinatura encontrada</h3>
            <p className="mt-2 text-gray-600">
              Você ainda não possui nenhuma assinatura ativa. Explore nossos planos para começar.
            </p>
            {onNavigateToPlans && (
              <button
                onClick={onNavigateToPlans}
                className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Ver Planos Disponíveis
              </button>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {subscription && (
        <div className="mt-8 flex gap-4">
          <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
            Gerenciar Pagamento
          </button>
          <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
            Histórico de Faturas
          </button>
        </div>
      )}
    </div>
  );
}

// Helper functions
function getStatusText(status: string): string {
  switch (status) {
    case 'trialing':
      return 'Em período de teste';
    case 'trial':
      return 'Em período de teste';
    case 'ativa':
      return 'Assinatura ativa';
    case 'expirada':
      return 'Assinatura expirada';
    case 'cancelada':
      return 'Assinatura cancelada';
    case 'suspensa':
      return 'Assinatura suspensa';
    default:
      return status;
  }
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'trialing':
    case 'trial':
      return 'bg-yellow-100 text-yellow-800';
    case 'ativa':
      return 'bg-green-100 text-green-800';
    case 'expirada':
    case 'cancelada':
      return 'bg-red-100 text-red-800';
    case 'suspensa':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}