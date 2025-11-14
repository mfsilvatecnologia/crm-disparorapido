// Lead Agent Types - Aligned with Backend Domain Model

export interface LeadAddress {
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  pais?: string;
}

export interface LeadData {
  id: string;
  empresaId: string;
  nomeEmpresa: string;
  fonte: string;
  status: LeadStatus;
  scoreQualificacao: number;
  createdAt: Date;
  updatedAt: Date;

  // Single contact fields (not array)
  nomeContato?: string;
  cargoContato?: string;
  email?: string;
  telefone?: string;

  // Company data
  linkedinUrl?: string;
  siteEmpresa?: string;
  cnpj?: string;
  segmento?: string;
  porteEmpresa?: PorteEmpresa;
  numFuncionarios?: number;
  receitaAnualEstimada?: number;
  endereco?: LeadAddress;
  tags: string[];
  observacoes?: string;
  dadosOriginais?: any;
  custoAquisicao?: number;
}

export interface LeadAgentState {
  lead: LeadData;
}

export enum PorteEmpresa {
  MEI = 'MEI',
  MICRO = 'Micro',
  PEQUENA = 'Pequena',
  MEDIA = 'Média',
  GRANDE = 'Grande',
}

export enum LeadStatus {
  NOVO = 'novo',
  QUALIFICADO = 'qualificado',
  NAO_QUALIFICADO = 'nao_qualificado',
  CONTATADO = 'contatado',
  CONVERTIDO = 'convertido',
  DESCARTADO = 'descartado',
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  [LeadStatus.NOVO]: 'Novo',
  [LeadStatus.QUALIFICADO]: 'Qualificado',
  [LeadStatus.NAO_QUALIFICADO]: 'Não Qualificado',
  [LeadStatus.CONTATADO]: 'Contatado',
  [LeadStatus.CONVERTIDO]: 'Convertido',
  [LeadStatus.DESCARTADO]: 'Descartado',
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  [LeadStatus.NOVO]: '#94a3b8',
  [LeadStatus.QUALIFICADO]: '#3b82f6',
  [LeadStatus.NAO_QUALIFICADO]: '#f59e0b',
  [LeadStatus.CONTATADO]: '#f59e0b',
  [LeadStatus.CONVERTIDO]: '#10b981',
  [LeadStatus.DESCARTADO]: '#ef4444',
};
