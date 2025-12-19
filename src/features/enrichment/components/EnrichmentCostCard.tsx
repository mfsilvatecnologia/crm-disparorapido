import React from 'react';

export interface EnrichmentCostCardProps {
  selectedCount: number;
  estimatedCost: number;
}

export const EnrichmentCostCard: React.FC<EnrichmentCostCardProps> = ({
  selectedCount,
  estimatedCost,
}) => {
  return (
    <div className="p-3 border rounded bg-white">
      <div className="text-sm text-gray-600">Resumo</div>
      <div className="mt-1 text-sm">Providers selecionados: {selectedCount}</div>
      <div className="mt-1 text-sm">
        Custo estimado: <strong>R$ {estimatedCost.toFixed(2)}</strong>
      </div>
    </div>
  );
};
