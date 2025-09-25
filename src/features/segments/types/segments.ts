export interface Segment {
  id: string;
  nome: string;
  descricao?: string;
  tipo: 'demografico' | 'comportamental' | 'geografico' | 'psicografico' | 'personalizado';
  condicoes: SegmentCondition[];
  contadorLeads: number;
  criadoEm: string;
  atualizadoEm: string;
  ativo: boolean;
  cor?: string;
  tags?: string[];
  estimativaAtualizacao?: string;
}

export interface SegmentCondition {
  id: string;
  campo: string;
  operador: SegmentOperator;
  valor: any;
  tipo: 'texto' | 'numero' | 'data' | 'booleano' | 'lista' | 'range';
  logico?: 'AND' | 'OR';
}

export type SegmentOperator =
  | 'igual'
  | 'diferente'
  | 'contem'
  | 'nao_contem'
  | 'inicia_com'
  | 'termina_com'
  | 'maior_que'
  | 'menor_que'
  | 'entre'
  | 'vazio'
  | 'nao_vazio'
  | 'em'
  | 'nao_em';

export interface SegmentFilter {
  tipo?: Segment['tipo'];
  ativo?: boolean;
  busca?: string;
  ordenacao?: 'nome' | 'criadoEm' | 'contadorLeads';
  direcao?: 'asc' | 'desc';
}

export interface SegmentStats {
  totalSegmentos: number;
  segmentosAtivos: number;
  totalLeadsSegmentados: number;
  distribuicaoPorTipo: {
    tipo: Segment['tipo'];
    quantidade: number;
  }[];
  segmentosMaisUtilizados: {
    id: string;
    nome: string;
    contadorLeads: number;
  }[];
}

export interface SegmentAnalytics {
  segmentoId: string;
  evolucaoContagem: {
    data: string;
    quantidade: number;
  }[];
  taxaCrescimento: number;
  leadsMaisRecentes: string[];
  campanhasAssociadas: string[];
  conversoes: {
    campanha: string;
    taxa: number;
  }[];
}

export interface SegmentBuilderField {
  nome: string;
  label: string;
  tipo: SegmentCondition['tipo'];
  opcoes?: { label: string; value: any }[];
  operadoresPermitidos: SegmentOperator[];
  descricao?: string;
  categoria: 'pessoal' | 'empresa' | 'comportamento' | 'interacao' | 'campanha';
}

export interface SegmentExport {
  formato: 'csv' | 'xlsx' | 'json';
  campos: string[];
  filtros?: SegmentFilter;
  incluirHistorico?: boolean;
}