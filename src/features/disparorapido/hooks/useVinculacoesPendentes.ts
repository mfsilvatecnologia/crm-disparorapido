import { useCallback, useEffect, useState } from 'react';
import DisparoRapidoService from '../services/api';
import { VinculacaoPendente, ListVinculacoesPendentesResponse } from '../types/api';

export function useVinculacoesPendentes(initialLoad = true) {
  const [vinculacoes, setVinculacoes] = useState<VinculacaoPendente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVinculacoes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res: ListVinculacoesPendentesResponse = await DisparoRapidoService.getVinculacoesPendentes();
      setVinculacoes(res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialLoad) fetchVinculacoes();
  }, [fetchVinculacoes, initialLoad]);

  const refresh = useCallback(() => fetchVinculacoes(), [fetchVinculacoes]);

  return {
    vinculacoes,
    isLoading,
    error,
    refresh,
    fetchVinculacoes,
    setVinculacoes
  } as const;
}

export default useVinculacoesPendentes;
