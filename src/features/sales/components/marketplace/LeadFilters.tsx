import { useState } from 'react';
import { LeadSegmento } from '../../types/lead.types';

interface LeadFiltersProps {
  onApplyFilters: (filters: LeadFilterValues) => void;
  isLoading?: boolean;
}

export interface LeadFilterValues {
  segmento?: LeadSegmento | '';
  cidade?: string;
  estado?: string;
}

const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const SEGMENTOS: { value: LeadSegmento; label: string }[] = [
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'varejo', label: 'Varejo' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'industria', label: 'Indústria' },
  { value: 'saude', label: 'Saúde' },
  { value: 'educacao', label: 'Educação' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'construcao', label: 'Construção' },
  { value: 'alimentos', label: 'Alimentos' },
  { value: 'outros', label: 'Outros' },
];

export function LeadFilters({ onApplyFilters, isLoading = false }: LeadFiltersProps) {
  const [filters, setFilters] = useState<LeadFilterValues>({
    segmento: '',
    cidade: '',
    estado: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Remove campos vazios
    const cleanedFilters: LeadFilterValues = {};
    if (filters.segmento) cleanedFilters.segmento = filters.segmento;
    if (filters.cidade?.trim()) cleanedFilters.cidade = filters.cidade.trim();
    if (filters.estado) cleanedFilters.estado = filters.estado;
    
    onApplyFilters(cleanedFilters);
  };

  const handleReset = () => {
    setFilters({
      segmento: '',
      cidade: '',
      estado: '',
    });
    onApplyFilters({});
  };

  const hasActiveFilters = filters.segmento || filters.cidade || filters.estado;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Filtros</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Segmento */}
        <div>
          <label
            htmlFor="segmento"
            className="block text-sm font-medium text-gray-700"
          >
            Segmento
          </label>
          <select
            id="segmento"
            value={filters.segmento}
            onChange={(e) =>
              setFilters({ ...filters, segmento: e.target.value as LeadSegmento | '' })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Todos os segmentos</option>
            {SEGMENTOS.map((seg) => (
              <option key={seg.value} value={seg.value}>
                {seg.label}
              </option>
            ))}
          </select>
        </div>

        {/* Cidade */}
        <div>
          <label
            htmlFor="cidade"
            className="block text-sm font-medium text-gray-700"
          >
            Cidade
          </label>
          <input
            type="text"
            id="cidade"
            value={filters.cidade}
            onChange={(e) => setFilters({ ...filters, cidade: e.target.value })}
            placeholder="Digite a cidade..."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Estado */}
        <div>
          <label
            htmlFor="estado"
            className="block text-sm font-medium text-gray-700"
          >
            Estado
          </label>
          <select
            id="estado"
            value={filters.estado}
            onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Todos os estados</option>
            {ESTADOS_BRASIL.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
        </div>

        {/* Botões */}
        <div className="space-y-2 border-t border-gray-200 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isLoading ? 'Aplicando...' : 'Aplicar Filtros'}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </form>

      {/* Contador de filtros ativos */}
      {hasActiveFilters && (
        <div className="mt-4 rounded-md bg-blue-50 px-3 py-2">
          <p className="text-xs text-blue-700">
            {Object.values(filters).filter(Boolean).length} filtro(s) ativo(s)
          </p>
        </div>
      )}
    </div>
  );
}
