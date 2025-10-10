import { Subscription } from '../../types/subscription.types';

interface TrialInstructionsProps {
  subscription: Subscription;
}

export function TrialInstructions({ subscription }: TrialInstructionsProps) {
  const { nextSteps, asaasInvoiceUrl, trialEndDate, firstChargeDate } = subscription;

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  return (
    <div className="space-y-6">
      {/* Link de Ativação */}
      {asaasInvoiceUrl && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-6">
          <div className="flex">
            <svg
              className="h-6 w-6 flex-shrink-0 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-orange-900">
                Complete a Ativação
              </h3>
              <p className="mt-1 text-sm text-orange-700">
                Para ativar completamente o seu trial, clique no link abaixo:
              </p>
              <div className="mt-4">
                <a
                  href={asaasInvoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
                >
                  Ativar Trial Gratuito
                  <svg
                    className="ml-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Próximos Passos da API */}
      {nextSteps && nextSteps.length > 0 && (
        <div className="rounded-lg bg-blue-50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-blue-900">
            Próximos Passos
          </h3>
          <ul className="space-y-3">
            {nextSteps.map((step, index) => (
              <li key={index} className="flex items-start">
                <div className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                  {index + 1}
                </div>
                <span className="text-sm text-blue-800">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Informações Importantes */}
      <div className="rounded-lg bg-gray-50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Informações Importantes
        </h3>
        <div className="space-y-3 text-sm text-gray-700">
          {trialEndDate && (
            <div className="flex items-center">
              <svg
                className="mr-2 h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3a1 1 0 012 0v4m0 0V3a1 1 0 112 0v4m-6 0h10l2 10H4l2-10z"
                />
              </svg>
              <span>
                <strong>Trial expira em:</strong> {formatDate(trialEndDate)}
              </span>
            </div>
          )}
          
          {firstChargeDate && (
            <div className="flex items-center">
              <svg
                className="mr-2 h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>
                <strong>Primeira cobrança:</strong> {formatDate(firstChargeDate)}
              </span>
            </div>
          )}

          <div className="flex items-center">
            <svg
              className="mr-2 h-5 w-5 text-green-500"
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
            <span>Cancele a qualquer momento, sem taxas ou multas</span>
          </div>
        </div>
      </div>
    </div>
  );
}