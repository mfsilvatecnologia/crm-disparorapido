import type { Responsavel } from './responsavel.types';

export enum EtapaStatus {
  PENDENTE = 'PENDENTE',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDA = 'CONCLUIDA',
  BLOQUEADA = 'BLOQUEADA'
}

export enum MaspFase {
  IDENTIFICACAO = 'IDENTIFICACAO',
  OBSERVACAO = 'OBSERVACAO',
  ANALISE = 'ANALISE',
  PLANO_ACAO = 'PLANO_ACAO',
  EXECUCAO = 'EXECUCAO',
  VERIFICACAO = 'VERIFICACAO',
  PADRONIZACAO = 'PADRONIZACAO',
  CONCLUSAO = 'CONCLUSAO'
}

export enum Disciplina8D {
  D0_PREPARACAO = 'D0_PREPARACAO',
  D1_EQUIPE = 'D1_EQUIPE',
  D2_DESCRICAO = 'D2_DESCRICAO',
  D3_CONTENCAO = 'D3_CONTENCAO',
  D4_CAUSA_RAIZ = 'D4_CAUSA_RAIZ',
  D5_ACAO_CORRETIVA = 'D5_ACAO_CORRETIVA',
  D6_IMPLEMENTACAO = 'D6_IMPLEMENTACAO',
  D7_PREVENCAO = 'D7_PREVENCAO',
  D8_RECONHECIMENTO = 'D8_RECONHECIMENTO'
}

export enum SecaoA3 {
  CONTEXTO = 'CONTEXTO',
  CONDICAO_ATUAL = 'CONDICAO_ATUAL',
  OBJETIVO = 'OBJETIVO',
  ANALISE_CAUSA_RAIZ = 'ANALISE_CAUSA_RAIZ',
  CONTRAMEDIDAS = 'CONTRAMEDIDAS',
  PLANO = 'PLANO',
  ACOMPANHAMENTO = 'ACOMPANHAMENTO'
}

export interface WorkflowEtapaBase {
  id: string;
  projeto_id: string;
  ordem: number;
  titulo: string;
  descricao: string;
  status: EtapaStatus;
  data_inicio: string | null;
  data_conclusao: string | null;
  responsavel_id: string | null;
  responsavel?: Responsavel | null;
  observacoes: string | null;
  anexos: unknown[];
  created_at: string;
  updated_at: string;
}

export interface EtapaMasp extends WorkflowEtapaBase {
  tipo: 'MASP';
  fase: MaspFase;
}

export interface Etapa8D extends WorkflowEtapaBase {
  tipo: '8D';
  disciplina: Disciplina8D;
}

export interface EtapaA3 extends WorkflowEtapaBase {
  tipo: 'A3';
  secao: SecaoA3;
}

export type WorkflowEtapa = EtapaMasp | Etapa8D | EtapaA3;
