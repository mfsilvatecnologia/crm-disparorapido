import { apiClient } from '@/shared/services/client';
import {
  MessageFilters,
  QueryMessagesResponse,
  ListVinculacoesPendentesResponse,
  VincularLeadManualRequest,
  VincularLeadResponse,
  DisparoRapidoStats
} from '../types/api';

const BASE_PATH = '/api/v1/disparo-rapido';

/**
 * Service para integração com API DisparoRapido
 */
export class DisparoRapidoService {
  /**
   * Consultar mensagens e conversas
   */
  static async getMessages(filters: MessageFilters = {}): Promise<QueryMessagesResponse> {
    const params = new URLSearchParams();
    
    // Adicionar filtros como query parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });

    console.log('🔍 [DISPARO RAPIDO] Buscando mensagens:', {
      filters,
      query: params.toString(),
      timestamp: new Date().toISOString()
    });

    try {
      const response = await apiClient.request<QueryMessagesResponse>(
        `${BASE_PATH}/messages${params.toString() ? `?${params.toString()}` : ''}`,
        {
          method: 'GET',
        }
      );

      console.log('✅ [DISPARO RAPIDO] Mensagens obtidas:', {
        total: response.pagination?.total || 0,
        items: response.data?.length || 0,
        page: response.pagination?.page || 1
      });

      return response;
    } catch (error) {
      console.error('❌ [DISPARO RAPIDO] Erro ao buscar mensagens:', error);
      throw error;
    }
  }

  /**
   * Listar vinculações pendentes
   */
  static async getVinculacoesPendentes(
    apenasNaoRevisadas = true
  ): Promise<ListVinculacoesPendentesResponse> {
    const params = new URLSearchParams();
    params.append('apenas_nao_revisadas', String(apenasNaoRevisadas));

    console.log('🔗 [DISPARO RAPIDO] Buscando vinculações pendentes:', {
      apenasNaoRevisadas,
      timestamp: new Date().toISOString()
    });

    try {
      const response = await apiClient.request<ListVinculacoesPendentesResponse>(
        `${BASE_PATH}/vinculacoes/pendentes?${params.toString()}`,
        {
          method: 'GET',
        }
      );

      console.log('✅ [DISPARO RAPIDO] Vinculações pendentes obtidas:', {
        total: response.data?.length || 0,
        pendentes: response.data?.filter(v => !v.revisado).length || 0
      });

      return response;
    } catch (error) {
      console.error('❌ [DISPARO RAPIDO] Erro ao buscar vinculações:', error);
      throw error;
    }
  }

  /**
   * Vincular lead manualmente
   */
  static async vincularLeadManual(
    request: VincularLeadManualRequest
  ): Promise<VincularLeadResponse> {
    console.log('🔗 [DISPARO RAPIDO] Vinculando lead manual:', {
      conversationId: request.conversation_id,
      leadId: request.lead_id,
      hasObservacoes: !!request.observacoes,
      timestamp: new Date().toISOString()
    });

    try {
      const response = await apiClient.request<VincularLeadResponse>(
        `${BASE_PATH}/vinculacoes/manual`,
        {
          method: 'POST',
          body: JSON.stringify(request),
        }
      );

      console.log('✅ [DISPARO RAPIDO] Lead vinculado com sucesso:', {
        conversationId: request.conversation_id,
        leadId: request.lead_id,
        success: response.success
      });

      return response;
    } catch (error) {
      console.error('❌ [DISPARO RAPIDO] Erro ao vincular lead:', {
        error: error instanceof Error ? error.message : error,
        conversationId: request.conversation_id,
        leadId: request.lead_id
      });
      throw error;
    }
  }

  /**
   * Buscar estatísticas/resumo (método auxiliar)
   * Pode ser implementado combinando outros endpoints
   */
  static async getStats(): Promise<DisparoRapidoStats> {
    console.log('📊 [DISPARO RAPIDO] Buscando estatísticas...');

    try {
      // Buscar dados em paralelo
      const [messagesResponse, pendentesResponse] = await Promise.all([
        this.getMessages({ limit: 1 }), // Só para pegar total
        this.getVinculacoesPendentes(true)
      ]);

      const stats: DisparoRapidoStats = {
        totalMensagens: messagesResponse.pagination?.total || 0,
        vinculacoesPendentes: pendentesResponse.data?.length || 0,
        leadsVinculados: 0, // Seria calculado no backend idealmente
        conversasAtivas: 0, // Seria calculado no backend idealmente
        ultimaAtualizacao: new Date().toISOString()
      };

      console.log('✅ [DISPARO RAPIDO] Estatísticas obtidas:', stats);
      return stats;
    } catch (error) {
      console.error('❌ [DISPARO RAPIDO] Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  /**
   * Utilitário para formatar telefone para busca
   */
  static formatPhoneForSearch(phone: string): string {
    // Remove caracteres especiais e espaços
    return phone.replace(/\D/g, '');
  }

  /**
   * Utilitário para validar UUID
   */
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Utilitário para formatar score de similaridade
   */
  static formatScore(score: number): string {
    return `${score}%`;
  }

  /**
   * Utilitário para classificar confiança do score
   */
  static getScoreConfidence(score: number): 'alta' | 'media' | 'baixa' {
    if (score >= 90) return 'alta';
    if (score >= 70) return 'media';
    return 'baixa';
  }

  /**
   * Utilitário para formatar data para filtros
   */
  static formatDateForFilter(date: Date): string {
    return date.toISOString();
  }

  /**
   * Utilitário para criar filtros de data (hoje, última semana, etc.)
   */
  static createDateFilters() {
    const now = new Date();
    const hoje = new Date(now);
    hoje.setHours(0, 0, 0, 0);

    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);

    const ultimaSemana = new Date(hoje);
    ultimaSemana.setDate(ultimaSemana.getDate() - 7);

    const ultimoMes = new Date(hoje);
    ultimoMes.setMonth(ultimoMes.getMonth() - 1);

    return {
      hoje: {
        data_inicio: hoje.toISOString(),
        data_fim: now.toISOString()
      },
      ontem: {
        data_inicio: ontem.toISOString(),
        data_fim: hoje.toISOString()
      },
      ultimaSemana: {
        data_inicio: ultimaSemana.toISOString(),
        data_fim: now.toISOString()
      },
      ultimoMes: {
        data_inicio: ultimoMes.toISOString(),
        data_fim: now.toISOString()
      }
    };
  }
}

/**
 * Hook personalizado para usar mensagens do DisparoRapido
 */
export const useDisparoRapidoMessages = () => {
  // Este hook seria implementado usando React Query ou similar
  // Exemplo básico:
  /*
  const [data, setData] = useState<QueryMessagesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async (filters: MessageFilters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await DisparoRapidoService.getMessages(filters);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, fetchMessages };
  */
};

/**
 * Hook personalizado para vinculações pendentes
 */
export const useVinculacoesPendentes = () => {
  // Similar ao hook acima
  // Incluiria funcionalidade de refresh automático
};

export default DisparoRapidoService;