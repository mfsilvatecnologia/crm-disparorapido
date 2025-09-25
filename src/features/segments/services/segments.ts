import { z } from 'zod';
import { apiClient } from '@/shared/services/client';
import {
  Segment,
  SegmentFilter,
  SegmentStats,
  SegmentAnalytics,
  SegmentBuilderField,
  SegmentExport
} from '../types/segments';

const SegmentSchema = z.object({
  id: z.string(),
  nome: z.string(),
  descricao: z.string().optional(),
  tipo: z.enum(['demografico', 'comportamental', 'geografico', 'psicografico', 'personalizado']),
  condicoes: z.array(z.object({
    id: z.string(),
    campo: z.string(),
    operador: z.string(),
    valor: z.any(),
    tipo: z.enum(['texto', 'numero', 'data', 'booleano', 'lista', 'range']),
    logico: z.enum(['AND', 'OR']).optional()
  })),
  contadorLeads: z.number(),
  criadoEm: z.string(),
  atualizadoEm: z.string(),
  ativo: z.boolean(),
  cor: z.string().optional(),
  tags: z.array(z.string()).optional(),
  estimativaAtualizacao: z.string().optional()
});

export class SegmentService {

  async getSegments(filtros?: SegmentFilter): Promise<Segment[]> {
    try {
      const params = new URLSearchParams();
      if (filtros?.tipo) params.append('tipo', filtros.tipo);
      if (filtros?.ativo !== undefined) params.append('ativo', filtros.ativo.toString());
      if (filtros?.busca) params.append('busca', filtros.busca);
      if (filtros?.ordenacao) params.append('ordenacao', filtros.ordenacao);
      if (filtros?.direcao) params.append('direcao', filtros.direcao);

      const response = await apiClient.request(
        `/api/v1/segments?${params.toString()}`,
        {},
        z.object({ data: z.array(SegmentSchema) })
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar segmentos:', error);
      throw new Error('Falha ao carregar segmentos');
    }
  }

  async getSegment(id: string): Promise<Segment> {
    try {
      const response = await apiClient.request(
        `/api/v1/segments/${id}`,
        {},
        z.object({ data: SegmentSchema })
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar segmento:', error);
      throw new Error('Segmento não encontrado');
    }
  }

  async createSegment(segmento: Omit<Segment, 'id' | 'criadoEm' | 'atualizadoEm' | 'contadorLeads'>): Promise<Segment> {
    try {
      const response = await apiClient.request(
        '/api/v1/segments',
        {
          method: 'POST',
          body: JSON.stringify(segmento)
        },
        z.object({ data: SegmentSchema })
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao criar segmento:', error);
      throw new Error('Falha ao criar segmento');
    }
  }

  async updateSegment(id: string, dadosAtualizacao: Partial<Segment>): Promise<Segment> {
    try {
      const response = await apiClient.request(
        `/api/v1/segments/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(dadosAtualizacao)
        },
        z.object({ data: SegmentSchema })
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar segmento:', error);
      throw new Error('Falha ao atualizar segmento');
    }
  }

  async deleteSegment(id: string): Promise<void> {
    try {
      await apiClient.request(
        `/api/v1/segments/${id}`,
        { method: 'DELETE' },
        z.object({ success: z.boolean() })
      );
    } catch (error) {
      console.error('Erro ao deletar segmento:', error);
      throw new Error('Falha ao deletar segmento');
    }
  }

  async duplicateSegment(id: string, novoNome?: string): Promise<Segment> {
    try {
      const response = await apiClient.request(
        `/api/v1/segments/${id}/duplicate`,
        {
          method: 'POST',
          body: JSON.stringify({ nome: novoNome })
        },
        z.object({ data: SegmentSchema })
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao duplicar segmento:', error);
      throw new Error('Falha ao duplicar segmento');
    }
  }

  async getSegmentStats(): Promise<SegmentStats> {
    try {
      const response = await apiClient.request(
        '/api/v1/segments/stats',
        {},
        z.object({
          data: z.object({
            totalSegmentos: z.number(),
            segmentosAtivos: z.number(),
            totalLeadsSegmentados: z.number(),
            distribuicaoPorTipo: z.array(z.object({
              tipo: z.string(),
              quantidade: z.number()
            })),
            segmentosMaisUtilizados: z.array(z.object({
              id: z.string(),
              nome: z.string(),
              contadorLeads: z.number()
            }))
          })
        })
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de segmentos:', error);
      throw new Error('Falha ao carregar estatísticas');
    }
  }

  async getSegmentAnalytics(id: string, periodo?: string): Promise<SegmentAnalytics> {
    try {
      const params = new URLSearchParams();
      if (periodo) params.append('periodo', periodo);

      const response = await apiClient.request(
        `/api/v1/segments/${id}/analytics?${params.toString()}`,
        {},
        z.object({
          data: z.object({
            segmentoId: z.string(),
            evolucaoContagem: z.array(z.object({
              data: z.string(),
              quantidade: z.number()
            })),
            taxaCrescimento: z.number(),
            leadsMaisRecentes: z.array(z.string()),
            campanhasAssociadas: z.array(z.string()),
            conversoes: z.array(z.object({
              campanha: z.string(),
              taxa: z.number()
            }))
          })
        })
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar analytics do segmento:', error);
      throw new Error('Falha ao carregar analytics');
    }
  }

  async refreshSegmentCount(id: string): Promise<number> {
    try {
      const response = await apiClient.request(
        `/api/v1/segments/${id}/refresh`,
        { method: 'POST' },
        z.object({ data: z.object({ contadorLeads: z.number() }) })
      );

      return response.data.contadorLeads;
    } catch (error) {
      console.error('Erro ao atualizar contagem do segmento:', error);
      throw new Error('Falha ao atualizar contagem');
    }
  }

  async getSegmentBuilderFields(): Promise<SegmentBuilderField[]> {
    try {
      const response = await apiClient.request(
        '/api/v1/segments/builder/fields',
        {},
        z.object({
          data: z.array(z.object({
            nome: z.string(),
            label: z.string(),
            tipo: z.enum(['texto', 'numero', 'data', 'booleano', 'lista', 'range']),
            opcoes: z.array(z.object({
              label: z.string(),
              value: z.any()
            })).optional(),
            operadoresPermitidos: z.array(z.string()),
            descricao: z.string().optional(),
            categoria: z.enum(['pessoal', 'empresa', 'comportamento', 'interacao', 'campanha'])
          }))
        })
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar campos do construtor:', error);
      throw new Error('Falha ao carregar campos do construtor');
    }
  }

  async previewSegment(condicoes: any[]): Promise<{ contagem: number; exemplos: any[] }> {
    try {
      const response = await apiClient.request(
        '/api/v1/segments/preview',
        {
          method: 'POST',
          body: JSON.stringify({ condicoes })
        },
        z.object({
          data: z.object({
            contagem: z.number(),
            exemplos: z.array(z.any())
          })
        })
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao visualizar segmento:', error);
      throw new Error('Falha ao visualizar segmento');
    }
  }

  async exportSegment(id: string, configuracao: SegmentExport): Promise<Blob> {
    try {
      const response = await apiClient.request(
        `/api/v1/segments/${id}/export`,
        {
          method: 'POST',
          body: JSON.stringify(configuracao)
        },
        z.any()
      );

      return new Blob([response], {
        type: configuracao.formato === 'csv'
          ? 'text/csv'
          : configuracao.formato === 'xlsx'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/json'
      });
    } catch (error) {
      console.error('Erro ao exportar segmento:', error);
      throw new Error('Falha ao exportar segmento');
    }
  }

  async getSegmentLeads(id: string, page = 1, limit = 20): Promise<{ leads: any[]; total: number }> {
    try {
      const response = await apiClient.request(
        `/api/v1/segments/${id}/leads?page=${page}&limit=${limit}`,
        {},
        z.object({
          data: z.object({
            leads: z.array(z.any()),
            total: z.number()
          })
        })
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar leads do segmento:', error);
      throw new Error('Falha ao carregar leads do segmento');
    }
  }
}

export const segmentService = new SegmentService();