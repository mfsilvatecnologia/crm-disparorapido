import { Product } from '../../../types/product.types';
import { formatPrice } from '../../../services/productService';

interface SuccessPageProps {
  product: Product;
  trialStartDate?: Date;
  trialEndDate?: Date;
  firstPaymentDate?: Date;
  onGoToDashboard: () => void;
}

export function SuccessPage({
  product,
  trialStartDate = new Date(),
  trialEndDate,
  firstPaymentDate,
  onGoToDashboard,
}: SuccessPageProps) {
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
    <div className="mx-auto max-w-2xl text-center">
      {/* Ícone de Sucesso */}
      <div className="mb-6 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-12 w-12 text-green-600"
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
        </div>
      </div>

      {/* Título */}
      <h1 className="mb-4 text-3xl font-bold text-gray-900">
        {hasTrial ? 'Teste Grátis Ativado!' : 'Assinatura Confirmada!'}
      </h1>

      {/* Mensagem de boas-vindas */}
      <p className="mb-8 text-lg text-gray-600">
        {hasTrial
          ? `Parabéns! Você ativou o teste grátis do plano ${product.name}.`
          : `Sua assinatura do plano ${product.name} está ativa!`}
      </p>

      {/* Card com detalhes */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 text-left shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Detalhes da sua Assinatura
        </h3>

        <dl className="space-y-3">
          {/* Plano */}
          <div className="flex justify-between">
            <dt className="text-sm text-gray-600">Plano:</dt>
            <dd className="text-sm font-semibold text-gray-900">{product.name}</dd>
          </div>

          {/* Data de Início */}
          <div className="flex justify-between">
            <dt className="text-sm text-gray-600">
              {hasTrial ? 'Início do Teste:' : 'Início:'}
            </dt>
            <dd className="text-sm font-semibold text-gray-900">
              {formatDate(trialStartDate)}
            </dd>
          </div>

          {/* Data de Fim do Trial */}
          {hasTrial && trialEndDate && (
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Fim do Teste:</dt>
              <dd className="text-sm font-semibold text-gray-900">
                {formatDate(trialEndDate)}
              </dd>
            </div>
          )}

          {/* Primeira Cobrança */}
          {firstPaymentDate && (
            <>
              <div className="flex justify-between border-t border-gray-200 pt-3">
                <dt className="text-sm text-gray-600">Primeira Cobrança:</dt>
                <dd className="text-sm font-semibold text-gray-900">
                  {formatDate(firstPaymentDate)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Valor:</dt>
                <dd className="text-sm font-semibold text-green-600">
                  {formatPrice(product.priceMonthly)}
                </dd>
              </div>
            </>
          )}
        </dl>
      </div>

      {/* Próximos Passos */}
      <div className="mb-8 rounded-lg bg-blue-50 p-6 text-left">
        <h3 className="mb-3 text-lg font-semibold text-blue-900">
          Próximos Passos
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <svg
              className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
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
            <span>Acesse o dashboard para começar a usar todos os recursos</span>
          </li>
          <li className="flex items-start">
            <svg
              className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
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
            <span>Explore os leads disponíveis no marketplace</span>
          </li>
          <li className="flex items-start">
            <svg
              className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
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
            <span>Configure suas preferências e notificações</span>
          </li>
          {hasTrial && (
            <li className="flex items-start">
              <svg
                className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
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
              <span>
                Lembre-se: você pode cancelar antes de{' '}
                {trialEndDate && formatDate(trialEndDate)} sem custo
              </span>
            </li>
          )}
        </ul>
      </div>

      {/* Botão de Ação */}
      <button
        onClick={onGoToDashboard}
        className="w-full rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto"
      >
        Ir para o Dashboard
      </button>

      {/* Suporte */}
      <p className="mt-6 text-sm text-gray-500">
        Precisa de ajuda?{' '}
        <a href="/suporte" className="text-blue-600 hover:underline">
          Entre em contato com o suporte
        </a>
      </p>
    </div>
  );
}
