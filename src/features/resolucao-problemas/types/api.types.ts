import type { Metodologia, ProjetoStatus } from './projeto.types';

export interface CreateProjetoRequest {
  titulo: string;
  descricao: string;
  cliente_id: string;
  responsavel_id: string;
  data_inicio: string;
  data_prevista_conclusao?: string | null;
  status?: ProjetoStatus;
}

export interface UpdateProjetoRequest {
  titulo?: string;
  descricao?: string;
  data_prevista_conclusao?: string | null;
  status?: ProjetoStatus;
}

export interface DefinirMetodologiaRequest {
  metodologia: Metodologia;
}

export interface ListProjetosQuery {
  page?: number;
  limit?: number;
  status?: ProjetoStatus | ProjetoStatus[];
  metodologia?: Metodologia | Metodologia[];
  cliente_id?: string;
  responsavel_id?: string;
  busca?: string;
  data_inicio_de?: string;
  data_inicio_ate?: string;
  incluir_arquivados?: boolean;
  ordenar_por?: 'data_inicio' | 'titulo' | 'updated_at';
  ordem?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
