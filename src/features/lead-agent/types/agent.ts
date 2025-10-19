// Lead Agent Types
export interface LeadContact {
  nome: string;
  cargo: string;
  email: string;
  telefone?: string;
}

export interface LeadActivity {
  tipo: 'email' | 'chamada' | 'reuniao' | 'nota' | 'proposta';
  descricao: string;
  data: string;
}

export interface LeadAddress {
  cidade?: string;
  estado?: string;
  pais?: string;
}

export interface LeadData {
  nomeEmpresa: string;
  cnpj?: string;
  segmento?: string;
  porteEmpresa: 'MEI' | 'Micro' | 'Pequena' | 'Média' | 'Grande';
  status: 'novo' | 'qualificado' | 'contatado' | 'interessado' | 'desqualificado' | 'convertido';
  score: number;
  tags: string[];
  contacts: LeadContact[];
  activities: LeadActivity[];
  observacoes?: string;
  endereco?: LeadAddress;
  apiData?: {
    id?: string;
    empresaId?: string | null;
    linkedinUrl?: string | null;
    siteEmpresa?: string | null;
    numFuncionarios?: number | null;
    receitaAnualEstimada?: number | null;
    fonte?: string | null;
    dadosOriginais?: Record<string, unknown> | null;
    custoAquisicao?: number | null;
    createdAt?: string;
    updatedAt?: string;
  };
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
  CONTATADO = 'contatado',
  INTERESSADO = 'interessado',
  DESQUALIFICADO = 'desqualificado',
  CONVERTIDO = 'convertido',
}

export enum ActivityType {
  EMAIL = 'email',
  CHAMADA = 'chamada',
  REUNIAO = 'reuniao',
  NOTA = 'nota',
  PROPOSTA = 'proposta',
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  [LeadStatus.NOVO]: 'Novo',
  [LeadStatus.QUALIFICADO]: 'Qualificado',
  [LeadStatus.CONTATADO]: 'Contatado',
  [LeadStatus.INTERESSADO]: 'Interessado',
  [LeadStatus.DESQUALIFICADO]: 'Desqualificado',
  [LeadStatus.CONVERTIDO]: 'Convertido',
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  [LeadStatus.NOVO]: '#94a3b8',
  [LeadStatus.QUALIFICADO]: '#3b82f6',
  [LeadStatus.CONTATADO]: '#f59e0b',
  [LeadStatus.INTERESSADO]: '#8b5cf6',
  [LeadStatus.DESQUALIFICADO]: '#ef4444',
  [LeadStatus.CONVERTIDO]: '#10b981',
};

export const ACTIVITY_ICONS: Record<ActivityType, string> = {
  [ActivityType.EMAIL]: '📧',
  [ActivityType.CHAMADA]: '📞',
  [ActivityType.REUNIAO]: '🤝',
  [ActivityType.NOTA]: '📝',
  [ActivityType.PROPOSTA]: '📄',
};
