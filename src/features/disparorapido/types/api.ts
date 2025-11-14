// Types baseados na documentação da API DisparoRapido

export interface ConversationSummary {
  id: number;
  codigoWhatsapp: string;
  telefone: string;
  nome: string | null;
  leadId: string | null; // UUID do lead vinculado
  lastActivityAt: string; // ISO 8601
}

export interface MessageSummary {
  id: number;
  content: string | null;
  messageType: number;
  status: number;
  sourceId: string | null;
  createdAt: string; // ISO 8601
}

export interface MessageResultItem {
  conversation: ConversationSummary;
  message: MessageSummary;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  previousPage: number | null;
  firstPage: number;
  lastPage: number;
}

export interface QueryMessagesResponse {
  success: boolean;
  data: MessageResultItem[];
  pagination: PaginationMeta;
  timestamp: string;
}

export interface LeadCandidato {
  id: string; // UUID
  nome: string;
  telefone: string;
  email: string | null;
  empresa: string | null;
  score: number; // 0-100: Score de similaridade
}

export interface VinculacaoPendente {
  id: string; // UUID
  conversation_id: number;
  empresa_id: string; // UUID
  dados_conversa: {
    nome: string | null;
    telefone: string;
    codigo_whatsapp: string;
  };
  candidatos: LeadCandidato[];
  revisado: boolean;
  criado_em: string; // ISO 8601
}

export interface ListVinculacoesPendentesResponse {
  success: boolean;
  data: VinculacaoPendente[];
  timestamp: string;
}

export interface VincularLeadManualRequest {
  conversation_id: number;
  lead_id: string; // UUID
  observacoes?: string;
}

export interface VincularLeadResponse {
  success: boolean;
  message: string;
  data: {
    success: boolean;
  };
  timestamp: string;
}

// Filtros para busca de mensagens
export interface MessageFilters {
  data_inicio?: string; // ISO 8601
  data_fim?: string; // ISO 8601
  telefone?: string;
  codigo_whatsapp?: string;
  device_id?: string;
  page?: number;
  limit?: number;
}

// Tipos de vinculação
export type TipoVinculacao = 
  | 'auto_exact'
  | 'auto_fuzzy' 
  | 'auto_created'
  | 'manual'
  | 'revised';

export type ConfiancaVinculacao = 'alta' | 'media' | 'baixa' | 'manual';

export interface VinculacaoInfo {
  tipo: TipoVinculacao;
  confianca: ConfiancaVinculacao;
  metadados?: Record<string, any>;
}

// Para componentes de UI
export interface MessageCardProps {
  item: MessageResultItem;
  onLeadClick?: (leadId: string) => void;
}

export interface VinculacaoPendenteCardProps {
  pendente: VinculacaoPendente;
  onVincular: (conversationId: number, leadId: string, observacoes?: string) => void;
  isVinculando?: boolean;
}

export interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export interface MessagesFiltersProps {
  filters: MessageFilters;
  onFiltersChange: (filters: MessageFilters) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

// Estados de loading e error para hooks
export interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

// Para dashboard/estatísticas (pode ser expandido)
export interface DisparoRapidoStats {
  totalMensagens: number;
  vinculacoesPendentes: number;
  leadsVinculados: number;
  conversasAtivas: number;
  ultimaAtualizacao: string;
}