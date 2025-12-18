import type { Cliente } from './cliente.types';
import type { Responsavel } from './responsavel.types';
import type { WorkflowEtapa } from './etapa.types';

export enum Metodologia {
  MASP = 'MASP',
  OITO_D = '8D',
  A3 = 'A3'
}

export enum ProjetoStatus {
  PLANEJAMENTO = 'PLANEJAMENTO',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  AGUARDANDO = 'AGUARDANDO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO',
  ARQUIVADO = 'ARQUIVADO'
}

export interface ProjetoBase {
  id: string;
  titulo: string;
  descricao: string;
  cliente_id: string;
  cliente?: Cliente;
  responsavel_id: string;
  responsavel?: Responsavel;
  data_inicio: string;
  data_prevista_conclusao: string | null;
  status: ProjetoStatus;
  created_at: string;
  updated_at: string;
  arquivado_em: string | null;
}

export interface ProjetoSemMetodologia extends ProjetoBase {
  metodologia: null;
  pode_definir_metodologia: true;
  etapas: [];
  progresso_percentual: 0;
}

export interface ProjetoComMetodologia extends ProjetoBase {
  metodologia: Metodologia;
  pode_definir_metodologia: false;
  etapas: WorkflowEtapa[];
  progresso_percentual: number;
  metodologia_definida_em: string;
  metodologia_definida_por_id: string;
}

export type Projeto = ProjetoSemMetodologia | ProjetoComMetodologia;
