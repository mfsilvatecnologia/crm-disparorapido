import { CreditBalance } from '../../types/credit.types';

interface CreditBalanceCardProps {
  balance: CreditBalance;
  estimatedLeads: number;
  onBuyCredits: () => void;
}

export function CreditBalanceCard({
  balance,
  estimatedLeads,
  onBuyCredits,
}: CreditBalanceCardProps) {
  const formatCredits = (amount: number) => {
    return new Intl.NumberFormat('pt-BR').format(amount);
  };

  const currentBalance = balance.balance;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Saldo de Créditos</h3>
          <p className="mt-1 text-sm text-gray-600">Compre leads no marketplace</p>
        </div>
        <div className="rounded-full bg-blue-100 p-3">
          <svg
            className="h-6 w-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>

      {/* Saldo Principal */}
      <div className="mb-6">
        <div className="mb-2 text-sm text-gray-600">Saldo Disponível</div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-gray-900">
            {formatCredits(currentBalance)}
          </span>
          <span className="text-lg text-gray-600">créditos</span>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          ≈ {estimatedLeads} {estimatedLeads === 1 ? 'lead' : 'leads'}
        </div>
      </div>

      {/* Last Updated */}
      <div className="mb-6 border-t border-gray-200 pt-4">
        <div className="text-xs text-gray-500">
          Atualizado em: {new Date(balance.lastUpdated).toLocaleString('pt-BR')}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onBuyCredits}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
        type="button"
      >
        Comprar Créditos
      </button>

      {/* Info Adicional */}
      <p className="mt-3 text-center text-xs text-gray-500">
        Créditos não expiram e podem ser usados a qualquer momento
      </p>
    </div>
  );
}
