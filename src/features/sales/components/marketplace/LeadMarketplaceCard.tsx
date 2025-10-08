import { Lead, MarketplaceStatus } from '../../types/lead.types';
import { LeadPreview } from './LeadPreview';

interface LeadMarketplaceCardProps {
  lead: Lead;
  isOwned?: boolean;
  onPurchase?: (leadId: string) => void;
  onView?: (leadId: string) => void;
}

export function LeadMarketplaceCard({
  lead,
  isOwned = false,
  onPurchase,
  onView,
}: LeadMarketplaceCardProps) {
  const isAvailable = lead.statusMarketplace === MarketplaceStatus.DISPONIVEL;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Header com status */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{lead.empresaNome}</h3>
          
          {/* Status Badge */}
          {isOwned ? (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              ✓ Você possui
            </span>
          ) : (
            <>
              {lead.statusMarketplace === MarketplaceStatus.DISPONIVEL && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  ● Disponível
                </span>
              )}
              {lead.statusMarketplace === MarketplaceStatus.VENDIDO && (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                  Vendido
                </span>
              )}
              {lead.statusMarketplace === MarketplaceStatus.RESERVADO && (
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                  Reservado
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Preview do Lead */}
      <div className="p-4">
        <LeadPreview lead={lead} showFullData={isOwned} />
      </div>

      {/* Footer com custo e ação */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Custo */}
          <div>
            <p className="text-xs text-gray-500">Custo</p>
            <p className="text-lg font-bold text-gray-900">
              {(lead.custoCreditosCentavos / 100).toLocaleString('pt-BR')} créditos
            </p>
          </div>

          {/* Botão de ação */}
          {isOwned ? (
            <button
              onClick={() => onView?.(lead.id)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Ver Detalhes
            </button>
          ) : (
            <button
              onClick={() => onPurchase?.(lead.id)}
              disabled={!isAvailable}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
            >
              {isAvailable ? '💰 Comprar' : 'Indisponível'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
