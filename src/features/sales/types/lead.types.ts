/**
 * Lead Types
 * 
 * TypeScript interfaces for lead marketplace and access control
 */

/**
 * Marketplace status enum
 */
export enum MarketplaceStatus {
  /** Available for purchase */
  DISPONIVEL = 'disponivel',
  
  /** Reserved (in cart) */
  RESERVADO = 'reservado',
  
  /** Sold */
  VENDIDO = 'vendido',
  
  /** Unavailable */
  INDISPONIVEL = 'indisponivel'
}

/**
 * Access type enum
 */
export enum AccessType {
  /** Purchased with credits */
  COMPRADO = 'comprado',
  
  /** Trial access */
  TRIAL = 'trial',
  
  /** Bonus access */
  BONUS = 'bonus'
}

/**
 * Lead segmento (business segment)
 */
export type LeadSegmento = 
  | 'tecnologia'
  | 'varejo'
  | 'servicos'
  | 'industria'
  | 'saude'
  | 'educacao'
  | 'financeiro'
  | 'construcao'
  | 'alimentos'
  | 'outros';

/**
 * Lead interest level
 */
export enum InterestLevel {
  /** Cold lead */
  FRIO = 'frio',
  
  /** Warm lead */
  MORNO = 'morno',
  
  /** Hot lead */
  QUENTE = 'quente'
}

/**
 * Lead interface (masked data for marketplace)
 */
export interface Lead {
  /** Unique identifier */
  id: string;
  
  /** Company name */
  empresaNome: string;
  
  /** Business segment */
  segmento: LeadSegmento;
  
  /** City */
  cidade: string;
  
  /** State (UF) */
  estado: string;
  
  /** Phone (masked: (11) 9****-***4) */
  telefone: string;
  
  /** Email (masked: j***@example.com) */
  email: string;
  
  /** Cost in credits (centavos) */
  custoCreditosCentavos: number;
  
  /** Marketplace status */
  statusMarketplace: MarketplaceStatus;
  
  /** Interest level */
  nivelInteresse: InterestLevel;
  
  /** Company size (number of employees) */
  tamanhoEmpresa: string | null;
  
  /** Website */
  website: string | null;
  
  /** Tags */
  tags: string[];
  
  /** Lead description */
  descricao: string | null;
  
  /** Creation timestamp */
  createdAt: string;
  
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Lead with full data (unmasked - after purchase)
 */
export interface LeadFull extends Lead {
  /** Full unmasked phone */
  telefone: string;
  
  /** Full unmasked email */
  email: string;
  
  /** Contact person name */
  contatoNome: string;
  
  /** Contact person position */
  contatoCargo: string | null;
  
  /** LinkedIn URL */
  linkedinUrl: string | null;
  
  /** Additional notes */
  observacoes: string | null;
}

/**
 * Lead Access interface
 */
export interface LeadAccess {
  /** Unique identifier */
  id: string;
  
  /** Company ID (who has access) */
  empresaId: string;
  
  /** Lead ID */
  leadId: string;
  
  /** Access type */
  tipoAcesso: AccessType;
  
  /** Number of times lead was viewed */
  visualizacoesCount: number;
  
  /** Limit of views (null = unlimited) */
  limiteVisualizacoes: number | null;
  
  /** First access timestamp */
  primeiroAcesso: string | null;
  
  /** Last access timestamp */
  ultimoAcesso: string | null;
  
  /** Access granted timestamp */
  concedidoEm: string;
  
  /** Access expires at (for trial) */
  expiraEm: string | null;
  
  /** Whether access is active */
  ativo: boolean;
  
  /** Credit transaction ID (for purchased access) */
  transacaoCreditoId: string | null;
  
  /** Creation timestamp */
  createdAt: string;
  
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Lead Access with computed fields
 */
export interface LeadAccessWithComputed extends LeadAccess {
  /** Whether access has expired */
  expirado: boolean;
  
  /** Days until expiration (if applicable) */
  diasParaExpirar: number | null;
  
  /** Whether view limit reached */
  limiteVisualizacoesAtingido: boolean;
  
  /** Remaining views */
  visualizacoesRestantes: number | null;
  
  /** Can access lead */
  podeAcessar: boolean;
}

/**
 * Lead with access info
 */
export interface LeadWithAccess extends Lead {
  /** Access info (if user has access) */
  acesso: LeadAccess | null;
  
  /** Whether user has active access */
  temAcesso: boolean;
  
  /** Can purchase this lead */
  podeComprar: boolean;
}

/**
 * Lead search filters
 */
export interface LeadSearchFilters {
  /** Search query (empresa, cidade, etc) */
  query?: string;
  
  /** Segment filter */
  segmento?: LeadSegmento[];
  
  /** State filter */
  estado?: string[];
  
  /** City filter */
  cidade?: string[];
  
  /** Interest level filter */
  nivelInteresse?: InterestLevel[];
  
  /** Max credit cost */
  custoMaximo?: number;
  
  /** Tags filter */
  tags?: string[];
  
  /** Only available leads */
  apenasDisponiveis?: boolean;
}

/**
 * Helper function to check if access is expired
 */
export function isAccessExpired(acesso: LeadAccess): boolean {
  if (!acesso.expiraEm) return false;
  return new Date(acesso.expiraEm) < new Date();
}

/**
 * Helper function to get days until expiration
 */
export function getDaysUntilExpiration(acesso: LeadAccess): number | null {
  if (!acesso.expiraEm) return null;
  const now = new Date();
  const expiresAt = new Date(acesso.expiraEm);
  const diff = expiresAt.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Helper function to check if view limit is reached
 */
export function isViewLimitReached(acesso: LeadAccess): boolean {
  if (acesso.limiteVisualizacoes === null) return false;
  return acesso.visualizacoesCount >= acesso.limiteVisualizacoes;
}

/**
 * Helper function to get remaining views
 */
export function getRemainingViews(acesso: LeadAccess): number | null {
  if (acesso.limiteVisualizacoes === null) return null;
  return Math.max(0, acesso.limiteVisualizacoes - acesso.visualizacoesCount);
}

/**
 * Helper function to check if user can access lead
 */
export function canAccessLead(acesso: LeadAccess): boolean {
  if (!acesso.ativo) return false;
  if (isAccessExpired(acesso)) return false;
  if (isViewLimitReached(acesso)) return false;
  return true;
}

/**
 * Helper function to mask phone
 */
export function maskPhone(phone: string): string {
  // (11) 98765-4321 -> (11) 9****-**21
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned[2]}****-**${cleaned.slice(-2)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ****-**${cleaned.slice(-2)}`;
  }
  return phone;
}

/**
 * Helper function to mask email
 */
export function maskEmail(email: string): string {
  // john.doe@example.com -> j***@example.com
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const maskedLocal = local[0] + '***';
  return `${maskedLocal}@${domain}`;
}

/**
 * Marketplace status colors
 */
export const MarketplaceStatusColors: Record<MarketplaceStatus, string> = {
  [MarketplaceStatus.DISPONIVEL]: 'green',
  [MarketplaceStatus.RESERVADO]: 'yellow',
  [MarketplaceStatus.VENDIDO]: 'red',
  [MarketplaceStatus.INDISPONIVEL]: 'gray'
};

/**
 * Marketplace status labels in Portuguese
 */
export const MarketplaceStatusLabels: Record<MarketplaceStatus, string> = {
  [MarketplaceStatus.DISPONIVEL]: 'Disponível',
  [MarketplaceStatus.RESERVADO]: 'Reservado',
  [MarketplaceStatus.VENDIDO]: 'Vendido',
  [MarketplaceStatus.INDISPONIVEL]: 'Indisponível'
};

/**
 * Access type colors
 */
export const AccessTypeColors: Record<AccessType, string> = {
  [AccessType.COMPRADO]: 'blue',
  [AccessType.TRIAL]: 'blue',
  [AccessType.BONUS]: 'green'
};

/**
 * Access type labels in Portuguese
 */
export const AccessTypeLabels: Record<AccessType, string> = {
  [AccessType.COMPRADO]: 'Comprado',
  [AccessType.TRIAL]: 'Trial',
  [AccessType.BONUS]: 'Bônus'
};

/**
 * Interest level colors
 */
export const InterestLevelColors: Record<InterestLevel, string> = {
  [InterestLevel.FRIO]: 'blue',
  [InterestLevel.MORNO]: 'yellow',
  [InterestLevel.QUENTE]: 'red'
};

/**
 * Interest level labels in Portuguese
 */
export const InterestLevelLabels: Record<InterestLevel, string> = {
  [InterestLevel.FRIO]: 'Frio',
  [InterestLevel.MORNO]: 'Morno',
  [InterestLevel.QUENTE]: 'Quente'
};

/**
 * Segment labels in Portuguese
 */
export const SegmentoLabels: Record<LeadSegmento, string> = {
  tecnologia: 'Tecnologia',
  varejo: 'Varejo',
  servicos: 'Serviços',
  industria: 'Indústria',
  saude: 'Saúde',
  educacao: 'Educação',
  financeiro: 'Financeiro',
  construcao: 'Construção',
  alimentos: 'Alimentos',
  outros: 'Outros'
};
