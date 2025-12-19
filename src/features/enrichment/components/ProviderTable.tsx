import React from 'react';
import type { Provider } from '../types/enrichment';

export interface ProviderTableProps {
  providers: Provider[];
  onToggleEnabled: (id: string, next: boolean) => void;
  onEdit: (provider: Provider) => void;
}

const HealthBadge: React.FC<{ status: Provider['healthStatus'] }> = ({ status }) => {
  const color = status === 'active' ? 'bg-green-600' : status === 'degraded' ? 'bg-yellow-500' : 'bg-red-600';
  const label = status === 'active' ? 'Ativo' : status === 'degraded' ? 'Degradado' : 'Inativo';
  return <span className={`px-2 py-1 text-xs rounded text-white ${color}`}>{label}</span>;
};

export const ProviderTable: React.FC<ProviderTableProps> = ({ providers, onToggleEnabled, onEdit }) => {
  return (
    <table className="w-full text-sm border rounded overflow-hidden">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 text-left">Nome</th>
          <th className="p-2 text-left">Tipo</th>
          <th className="p-2 text-left">Status</th>
          <th className="p-2 text-left">Prioridade</th>
          <th className="p-2 text-left">Rate/min</th>
          <th className="p-2 text-left">Custo</th>
          <th className="p-2 text-left">Health</th>
          <th className="p-2 text-left">Ações</th>
        </tr>
      </thead>
      <tbody>
        {providers.map((p) => (
          <tr key={p.id} className="border-t">
            <td className="p-2">{p.name}</td>
            <td className="p-2">{p.type}</td>
            <td className="p-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={p.enabled}
                  onChange={(e) => onToggleEnabled(p.id, e.target.checked)}
                />
                <span>{p.enabled ? 'Habilitado' : 'Desabilitado'}</span>
              </label>
            </td>
            <td className="p-2">{p.priority}</td>
            <td className="p-2">{p.rateLimitPerMin}</td>
            <td className="p-2">R$ {p.costPerRequest.toFixed(2)}</td>
            <td className="p-2"><HealthBadge status={p.healthStatus} /></td>
            <td className="p-2">
              <button className="px-2 py-1 border rounded" onClick={() => onEdit(p)}>Editar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
