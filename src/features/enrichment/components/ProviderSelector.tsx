import React from 'react';
import type { Provider } from '../types/enrichment';

export interface ProviderSelectorProps {
  providers: Provider[];
  selectedIds: string[];
  onChange: (selected: string[]) => void;
  availableBalance?: number; // opcional para checagem de saldo
}

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  providers,
  selectedIds,
  onChange,
  availableBalance,
}) => {
  const enabledProviders = providers.filter((p) => p.enabled);
  const isDisabled = enabledProviders.length === 0;

  const toggle = (id: string) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    onChange(next);
  };

  const estimatedCost = enabledProviders
    .filter((p) => selectedIds.includes(p.id))
    .reduce((sum, p) => sum + (p.costPerRequest ?? 0), 0);

  const saldoInsuficiente =
    typeof availableBalance === 'number' && estimatedCost > availableBalance;

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">
        {isDisabled ? (
          <span>Sem providers ativos. Habilite algum provider para prosseguir.</span>
        ) : (
          <span>Selecione os providers desejados:</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {enabledProviders.map((p) => (
          <label key={p.id} className="flex items-center gap-2 p-2 border rounded">
            <input
              type="checkbox"
              disabled={isDisabled}
              checked={selectedIds.includes(p.id)}
              onChange={() => toggle(p.id)}
            />
            <span className="font-medium">{p.name}</span>
            <span className="ml-auto text-xs text-gray-500">
              R$ {p.costPerRequest?.toFixed(2) ?? '0.00'} / req
            </span>
          </label>
        ))}
      </div>

      <div className="text-sm">
        Estimativa de custo: <strong>R$ {estimatedCost.toFixed(2)}</strong>
        {saldoInsuficiente && (
          <span className="ml-2 text-red-600">(saldo insuficiente)</span>
        )}
      </div>
    </div>
  );
};
