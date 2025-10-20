import { Subscription } from '../../types/subscription.types';
import { Product } from '../../types/product.types';
import { formatPrice } from '../../services/productService';

interface TrialBannerProps {
  subscription: Subscription;
  product?: Product;
  daysRemaining: number;
  onManage: () => void;
}

export function TrialBanner({ subscription, product, daysRemaining, onManage }: TrialBannerProps) {
  // Calcular urgência baseado nos dias restantes
  const isUrgent = daysRemaining <= 3;
  const isWarning = daysRemaining <= 7 && daysRemaining > 3;

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div
      className={`
        rounded-lg border-l-4 p-6 shadow-sm
        ${isUrgent ? 'border-red-500 bg-red-50' : ''}
        ${isWarning ? 'border-yellow-500 bg-yellow-50' : ''}
        ${!isUrgent && !isWarning ? 'border-blue-500 bg-blue-50' : ''}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Informações do Trial */}
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            {/* Ícone */}
            <svg
              className={`h-5 w-5 flex-shrink-0 ${
                isUrgent ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-blue-600'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>

            {/* Título */}
            <h3
              className={`text-lg font-semibold ${
                isUrgent ? 'text-red-900' : isWarning ? 'text-yellow-900' : 'text-blue-900'
              }`}
            >
              {isUrgent
                ? '⚠️ Seu teste grátis está acabando'
                : isWarning
                ? '⏰ Seu teste grátis está próximo do fim'
                : '🎉 Você está no período de teste grátis'}
            </h3>
          </div>

          {/* Detalhes */}
          <div
            className={`space-y-1 text-sm ${
              isUrgent ? 'text-red-800' : isWarning ? 'text-yellow-800' : 'text-blue-800'
            }`}
          >
            <p className="font-medium">
              {daysRemaining === 0 ? (
                'Seu teste termina hoje!'
              ) : daysRemaining === 1 ? (
                'Resta 1 dia de teste grátis'
              ) : (
                <>
                  Restam <span className="font-bold">{daysRemaining} dias</span> de teste grátis
                </>
              )}
            </p>

            {subscription.trialEndDate && (
              <p className="text-xs opacity-90">
                Término do teste: {formatDate(subscription.trialEndDate)}
              </p>
            )}

            {subscription.nextDueDate && (
              <p className="mt-2 font-medium">
                Próxima cobrança: {subscription.valueFormatted} em{' '}
                {formatDate(subscription.nextDueDate)}
              </p>
            )}

            {isUrgent && (
              <p className="mt-2 text-xs font-medium">
                💡 Cancele antes do término para não ser cobrado
              </p>
            )}
          </div>
        </div>

        {/* Botão de Ação */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={onManage}
            className={`
              rounded-lg px-6 py-3 font-semibold shadow-sm transition-colors
              ${
                isUrgent
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : isWarning
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
            type="button"
          >
            Gerenciar Assinatura
          </button>
        </div>
      </div>

      {/* Barra de Progresso */}
      {subscription.trialDays && subscription.trialDays > 0 && (
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/50">
            <div
              className={`h-full transition-all duration-500 ${
                isUrgent ? 'bg-red-600' : isWarning ? 'bg-yellow-600' : 'bg-blue-600'
              }`}
              style={{
                width: `${Math.max(0, (daysRemaining / subscription.trialDays) * 100)}%`,
              }}
              role="progressbar"
              aria-valuenow={daysRemaining}
              aria-valuemin={0}
              aria-valuemax={subscription.trialDays}
              aria-label={`${daysRemaining} dias restantes de ${subscription.trialDays} dias de teste`}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs opacity-75">
            <span>Dia 1</span>
            <span>
              Dia {subscription.trialDays - daysRemaining} de {subscription.trialDays}
            </span>
            <span>Dia {subscription.trialDays}</span>
          </div>
        </div>
      )}
    </div>
  );
}
