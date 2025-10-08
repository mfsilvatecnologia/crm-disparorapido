import { Lead } from '../../types/lead.types';

interface LeadPreviewProps {
  lead: Lead;
  showFullData?: boolean;
}

export function LeadPreview({ lead, showFullData = false }: LeadPreviewProps) {
  return (
    <div className="space-y-3 rounded-lg bg-gray-50 p-4">
      {/* Nome da Empresa */}
      <div>
        <label className="text-xs font-medium text-gray-500">Empresa</label>
        <p className="text-sm font-semibold text-gray-900">{lead.empresaNome}</p>
      </div>

      {/* Segmento */}
      <div>
        <label className="text-xs font-medium text-gray-500">Segmento</label>
        <p className="text-sm text-gray-900 capitalize">{lead.segmento}</p>
      </div>

      {/* Localização */}
      <div>
        <label className="text-xs font-medium text-gray-500">Localização</label>
        <p className="text-sm text-gray-900">
          {lead.cidade}, {lead.estado}
        </p>
      </div>

      {/* Telefone - mascarado ou completo */}
      <div>
        <label className="text-xs font-medium text-gray-500">Telefone</label>
        <p className="font-mono text-sm text-gray-900">
          {showFullData ? lead.telefone : lead.telefone}
          {!showFullData && (
            <span className="ml-2 text-xs text-gray-400">(mascarado)</span>
          )}
        </p>
      </div>

      {/* Email - mascarado ou completo */}
      <div>
        <label className="text-xs font-medium text-gray-500">Email</label>
        <p className="font-mono text-sm text-gray-900">
          {showFullData ? lead.email : lead.email}
          {!showFullData && (
            <span className="ml-2 text-xs text-gray-400">(mascarado)</span>
          )}
        </p>
      </div>

      {/* Nível de Interesse */}
      <div>
        <label className="text-xs font-medium text-gray-500">Nível de Interesse</label>
        <div className="mt-1">
          {lead.nivelInteresse === 'quente' && (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
              🔥 Quente
            </span>
          )}
          {lead.nivelInteresse === 'morno' && (
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
              ⚡ Morno
            </span>
          )}
          {lead.nivelInteresse === 'frio' && (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              ❄️ Frio
            </span>
          )}
        </div>
      </div>

      {!showFullData && (
        <div className="border-t border-gray-200 pt-3">
          <p className="text-xs text-gray-500">
            💡 Compre este lead para ver os dados completos
          </p>
        </div>
      )}
    </div>
  );
}
