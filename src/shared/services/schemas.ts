import { z } from 'zod';

// Base schemas
export const PaginationSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

// Error response schema
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
  details: z.record(z.any()).optional(),
  context: z.object({
    controller: z.string().optional(),
    method: z.string().optional(),
    stackTrace: z.string().optional(),
    trace_id: z.string().optional(),
    span_id: z.string().optional(),
  }).optional(),
  timestamp: z.string().optional(),
  trace: z.object({
    trace_id: z.string().optional(),
    span_id: z.string().optional(),
    requestId: z.string().optional(),
  }).optional(),
});

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    items: z.array(dataSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  });

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type CreateLeadDTO = z.infer<typeof CreateLeadDTOSchema>;
export type UpdateLeadDTO = z.infer<typeof UpdateLeadDTOSchema>;
export type User = z.infer<typeof UserSchema>;
export type LoginRequest = z.infer<typeof LoginSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordSchema>;
export type ConfirmResetPasswordRequest = z.infer<typeof ConfirmResetPasswordSchema>;
export type UpdateProfileRequest = z.infer<typeof UpdateProfileSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordSchema>;
export type CreateUserRequest = z.infer<typeof CreateUserSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>;
export type Segment = z.infer<typeof SegmentSchema>;
export type SegmentStats = z.infer<typeof SegmentStatsSchema>;
export type CreateSegment = z.infer<typeof CreateSegmentSchema>;
export type UpdateSegment = z.infer<typeof UpdateSegmentSchema>;
export type PipelineStage = z.infer<typeof PipelineStageSchema>;
export type PipelineItem = z.infer<typeof PipelineItemSchema>;
export type PipelineStats = z.infer<typeof PipelineStatsSchema>;
export type CreatePipelineItem = z.infer<typeof CreatePipelineItemSchema>;
export type UpdatePipelineItem = z.infer<typeof UpdatePipelineItemSchema>;
export type Campanha = z.infer<typeof CampanhaSchema>;
export type EmailTemplate = z.infer<typeof EmailTemplateSchema>;
export type CampanhaStats = z.infer<typeof CampanhaStatsSchema>;
export type CreateCampanha = z.infer<typeof CreateCampanhaSchema>;
export type UpdateCampanha = z.infer<typeof UpdateCampanhaSchema>;
export type CreateEmailTemplate = z.infer<typeof CreateEmailTemplateSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type Organization = z.infer<typeof OrganizationSchema>;
export type Lead = z.infer<typeof LeadSchema>;
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};
export type UsageMetrics = z.infer<typeof UsageMetricsSchema>;
export type AnalyticsData = z.infer<typeof AnalyticsDataSchema>;
export type ApiKey = z.infer<typeof ApiKeySchema>;

// User and Auth schemas
export const UserSchema = z.object({
  id: z.string(),
  sub: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  nome: z.string().optional(),
  telefone: z.string().optional(),
  cargo: z.string().optional(),
  ativo: z.boolean().optional(),
  ultimoLogin: z.string().optional(),
  createdAt: z.string().optional(),
  created_at: z.string().optional(), // Suporta snake_case
  updated_at: z.string().optional(), // Suporta snake_case
  empresa_id: z.string(), // ID da empresa do usuário (obrigatório na resposta de login)
  roles: z.array(z.string()),
  role: z.union([
    z.enum(['admin', 'org_admin', 'agent', 'viewer', 'user', 'usuario']),
    z.string() // Permite qualquer string para ser mais flexível
  ]).optional(),
  user_metadata: z.object({
    empresa_id: z.string().optional(),
    role: z.string().optional(),
  }),
  organizationId: z.string().optional(),
  avatar: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  device_id: z.string(),
  device_fingerprint: z.string(),
  client_type: z.enum(['web', 'extension']),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email(),
});

export const ConfirmResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  avatar: z.string().url().optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export const CreateUserSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  cargo: z.string().optional(),
  role: z.enum(['admin', 'org_admin', 'agent', 'viewer', 'user']),
  organizationId: z.string().optional(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const UpdateUserSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  telefone: z.string().optional(),
  cargo: z.string().optional(),
  role: z.enum(['admin', 'org_admin', 'agent', 'viewer', 'user']).optional(),
  organizationId: z.string().optional(),
  ativo: z.boolean().optional(),
});

// Segments schemas
export const SegmentSchema = z.object({
  id: z.string(),
  nome: z.string(),
  descricao: z.string().optional(),
  totalEmpresas: z.number(),
  totalLeads: z.number(),
  taxaConversao: z.number(),
  valorMedio: z.number().optional(),
  crescimentoMensal: z.number().optional(),
  empresasAtivas: z.number(),
  leadsQualificados: z.number(),
  oportunidadesAbertas: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const SegmentStatsSchema = z.object({
  totalSegmentos: z.number(),
  segmentoMaisLucrativo: z.string().optional(),
  segmentoMaisCrescimento: z.string().optional(),
  totalEmpresasSegmentadas: z.number(),
  taxaConversaoGeral: z.number(),
  faturamentoTotal: z.number(),
  distribuicaoPorSegmento: z.array(z.object({
    segmento: z.string(),
    percentual: z.number(),
    empresas: z.number(),
    leads: z.number(),
  })),
});

export const CreateSegmentSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
});

export const UpdateSegmentSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').optional(),
  descricao: z.string().optional(),
});

// Pipeline schemas
export const PipelineStageSchema = z.object({
  id: z.string(),
  nome: z.string(),
  descricao: z.string().optional(),
  ordem: z.number(),
  cor: z.string().optional(),
  configuracoes: z.object({
    tempoMedio: z.number().optional(),
    taxaConversao: z.number().optional(),
    acoesPadrao: z.array(z.string()).optional(),
  }).optional(),
});

export const PipelineItemSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  valor: z.number().optional(),
  probabilidade: z.number(),
  stageId: z.string(),
  empresaId: z.string().optional(),
  leadId: z.string().optional(),
  responsavelId: z.string().optional(),
  dataProximaAcao: z.string().optional(),
  proximaAcao: z.string().optional(),
  origem: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notas: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  empresa: z.object({
    id: z.string(),
    nome: z.string(),
    segmento: z.string().optional(),
  }).optional(),
  lead: z.object({
    id: z.string(),
    nomeContato: z.string().optional(),
    email: z.string().optional(),
  }).optional(),
  responsavel: z.object({
    id: z.string(),
    nome: z.string().optional(),
  }).optional(),
});

export const PipelineStatsSchema = z.object({
  totalOportunidades: z.number(),
  valorTotal: z.number(),
  valorMedio: z.number(),
  taxaConversaoGeral: z.number(),
  tempoMedioFechamento: z.number(), // em dias
  oportunidadesPorStage: z.array(z.object({
    stageId: z.string(),
    stageName: z.string(),
    count: z.number(),
    valor: z.number(),
    taxaConversao: z.number(),
  })),
  performanceMensal: z.array(z.object({
    mes: z.string(),
    oportunidades: z.number(),
    valor: z.number(),
    fechadas: z.number(),
  })),
});

export const CreatePipelineItemSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  valor: z.number().optional(),
  probabilidade: z.number().min(0).max(100),
  stageId: z.string(),
  empresaId: z.string().optional(),
  leadId: z.string().optional(),
  responsavelId: z.string().optional(),
  dataProximaAcao: z.string().optional(),
  proximaAcao: z.string().optional(),
  origem: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notas: z.string().optional(),
});

export const UpdatePipelineItemSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório').optional(),
  valor: z.number().optional(),
  probabilidade: z.number().min(0).max(100).optional(),
  stageId: z.string().optional(),
  empresaId: z.string().optional(),
  leadId: z.string().optional(),
  responsavelId: z.string().optional(),
  dataProximaAcao: z.string().optional(),
  proximaAcao: z.string().optional(),
  origem: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notas: z.string().optional(),
});

// Campaign schemas
export const CampanhaSchema = z.object({
  id: z.string(),
  nome: z.string(),
  descricao: z.string().optional(),
  tipo: z.enum(['EMAIL', 'SMS', 'WHATSAPP', 'LINKEDIN', 'SEQUENCE']),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']),
  configuracoes: z.object({
    segmentosAlvo: z.array(z.string()).optional(),
    filtrosPersonalizados: z.record(z.any()).optional(),
    agendamento: z.object({
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
      periodicidade: z.enum(['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY']).optional(),
    }).optional(),
  }),
  metricas: z.object({
    totalEnviados: z.number(),
    totalEntregues: z.number(),
    totalAbertos: z.number(),
    totalCliques: z.number(),
    totalRespostas: z.number(),
    taxaEntrega: z.number(),
    taxaAbertura: z.number(),
    taxaClique: z.number(),
    taxaResposta: z.number(),
  }),
  criadoPor: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const EmailTemplateSchema = z.object({
  id: z.string(),
  nome: z.string(),
  assunto: z.string(),
  conteudo: z.string(),
  tipo: z.enum(['PROSPECCAO', 'FOLLOW_UP', 'NUTRICAO', 'PROMOCIONAL', 'TRANSACIONAL']),
  variaveis: z.array(z.string()),
  tags: z.array(z.string()).optional(),
  ativo: z.boolean(),
  criadoPor: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CampanhaStatsSchema = z.object({
  totalCampanhas: z.number(),
  campanhasAtivas: z.number(),
  totalEnviados: z.number(),
  taxaEntregaGeral: z.number(),
  taxaAberturaGeral: z.number(),
  taxaCliqueGeral: z.number(),
  melhoresCampanhas: z.array(z.object({
    id: z.string(),
    nome: z.string(),
    tipo: z.string(),
    taxaAbertura: z.number(),
    totalEnviados: z.number(),
  })),
  performanceMensal: z.array(z.object({
    mes: z.string(),
    enviados: z.number(),
    abertos: z.number(),
    cliques: z.number(),
  })),
});

export const CreateCampanhaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  tipo: z.enum(['EMAIL', 'SMS', 'WHATSAPP', 'LINKEDIN', 'SEQUENCE']),
  configuracoes: z.object({
    segmentosAlvo: z.array(z.string()).optional(),
    filtrosPersonalizados: z.record(z.any()).optional(),
    agendamento: z.object({
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
      periodicidade: z.enum(['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY']).optional(),
    }).optional(),
  }),
});

export const UpdateCampanhaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').optional(),
  descricao: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']).optional(),
  configuracoes: z.object({
    segmentosAlvo: z.array(z.string()).optional(),
    filtrosPersonalizados: z.record(z.any()).optional(),
    agendamento: z.object({
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
      periodicidade: z.enum(['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY']).optional(),
    }).optional(),
  }).optional(),
});

export const CreateEmailTemplateSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  assunto: z.string().min(1, 'Assunto é obrigatório'),
  conteudo: z.string().min(1, 'Conteúdo é obrigatório'),
  tipo: z.enum(['PROSPECCAO', 'FOLLOW_UP', 'NUTRICAO', 'PROMOCIONAL', 'TRANSACIONAL']),
  variaveis: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const AuthResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    token: z.string(),
    user: UserSchema,
    empresa: z.object({
      id: z.string(),
      nome: z.string(),
      cnpj: z.string(),
    }),
    session: z.object({
      id: z.string(),
      device_id: z.string(),
      expires_at: z.string(),
    }).nullable(),
    subscription: z.object({
      isActive: z.boolean(),
      message: z.string().optional(),
      planId: z.string().optional(),
      expiresAt: z.string().optional(),
    }).optional(),
  }),
  message: z.string(),
  timestamp: z.string(),
  trace: z.object({
    trace_id: z.string(),
    span_id: z.string(),
    requestId: z.string(),
  }).optional(),
});

// Organization schemas
export const OrganizationPlanSchema = z.enum(['basic', 'professional', 'enterprise', 'white_label']);

export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  cnpj: z.string().optional(),
  plan: OrganizationPlanSchema,
  quota: z.object({
    total: z.number(),
    used: z.number(),
    resetDate: z.string(),
  }).optional(),
  settings: z.object({
    theme: z.object({
      primaryColor: z.string().optional(),
      logo: z.string().optional(),
      domain: z.string().optional(),
    }).optional(),
    webhooks: z.array(z.object({
      id: z.string(),
      url: z.string().url(),
      events: z.array(z.string()),
      secret: z.string(),
      active: z.boolean(),
    })).optional(),
  }).optional(),
  isActive: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Lead schemas baseados na API real
export const LeadAddressSchema = z.object({
  rua: z.string().nullable().optional(),
  numero: z.string().nullable().optional(),
  cidade: z.string().nullable().optional(),
  estado: z.string().nullable().optional(),
  cep: z.string().nullable().optional(),
  pais: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});

export const LeadSchema = z.object({
  id: z.string(),
  empresaId: z.string().nullable().optional(), // Pode ser string vazia "" ou null
  nomeEmpresa: z.string().nullable().optional(), // Pode ser null
  nomeContato: z.string().nullable().optional(),
  cargoContato: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  telefone: z.string().nullable().optional(),
  linkedinUrl: z.string().nullable().optional(),
  siteEmpresa: z.string().nullable().optional(),
  cnpj: z.string().nullable().optional(),
  segmento: z.string().nullable().optional(),
  porteEmpresa: z.string().nullable().optional(),
  numFuncionarios: z.number().nullable().optional(),
  receitaAnualEstimada: z.number().nullable().optional(),
  endereco: LeadAddressSchema.nullable().optional(),
  status: z.enum(['novo', 'qualificado', 'contatado', 'convertido', 'descartado', 'privado']).nullable().optional(),
  scoreQualificacao: z.number().min(0).max(100).default(0),
  tags: z.array(z.string()).nullable().optional(),
  observacoes: z.string().nullable().optional(),
  fonte: z.string().nullable().optional(),
  dadosOriginais: z.record(z.unknown()).nullable().optional(),
  custoAquisicao: z.number().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Schema de resposta da API real
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
  });

export const PaginatedApiResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  ApiResponseSchema(z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }));

export const LeadAccessSchema = z.object({
  id: z.string(),
  leadId: z.string(),
  organizationId: z.string(),
  userId: z.string(),
  cost: z.number().nonnegative(),
  accessedAt: z.string(),
});

// Schema específico para a resposta de leads
export const LeadsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(LeadSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
    firstPage: z.number().optional(),
    lastPage: z.number().optional(),
  }),
  timestamp: z.string().optional(),
  trace: z.object({
    trace_id: z.string(),
    span_id: z.string(),
    requestId: z.string(),
  }).optional(),
});

export type LeadsResponse = z.infer<typeof LeadsResponseSchema>;

export const LeadFilterSchema = z.object({
  search: z.string().optional(),
  segmentId: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  qualityScore: z.object({
    min: z.number().min(0).max(100).optional(),
    max: z.number().min(0).max(100).optional(),
  }).optional(),
  tags: z.array(z.string()).optional(),
  dateRange: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  }).optional(),
  isAccessed: z.boolean().optional(),
});

export const PipelineLeadSchema = z.object({
  id: z.string(),
  lead: LeadSchema,
  stageId: z.string(),
  value: z.number().optional(),
  notes: z.string().optional(),
  activities: z.array(z.object({
    id: z.string(),
    type: z.enum(['call', 'email', 'meeting', 'note']),
    description: z.string(),
    completedAt: z.string().optional(),
    createdAt: z.string(),
  })),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Usage and Analytics schemas
export const UsageMetricsSchema = z.object({
  period: z.object({
    from: z.string(),
    to: z.string(),
  }),
  leadsAccessed: z.number(),
  apiRequests: z.number(),
  totalCost: z.number(),
  quotaUsed: z.number(),
  quotaTotal: z.number(),
  conversionRate: z.number().min(0).max(1),
});

export const AnalyticsDataSchema = z.object({
  date: z.string(),
  leadsCollected: z.number(),
  leadsAccessed: z.number(),
  qualityAverage: z.number(),
  cost: z.number(),
  conversions: z.number(),
});

// API Key schemas
export const ApiKeySchema = z.object({
  id: z.string(),
  name: z.string(),
  key: z.string(),
  permissions: z.array(z.string()),
  lastUsedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  createdAt: z.string(),
});

// Empresa schemas
export const EmpresaSchema = z.object({
  id: z.string(),
  nome: z.string(),
  cnpj: z.string(),
  email: z.string().email(),
  asaas_customer_id: z.string().nullable().optional(),
  api_key: z.string(),
  saldo_creditos: z.number().optional().default(0),
  segmento: z.string().optional(),
  volume_auditorias_mensal: z.string().optional(),
  recursos_interesse: z.array(z.string()).optional(),
  rua: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});

export const CreateEmpresaDTOSchema = z.object({
  nome: z.string(),
  cnpj: z.string(),
  email: z.string().email(),
  segmento: z.string().optional(),
  volume_auditorias_mensal: z.string().optional(),
  recursos_interesse: z.array(z.string()).optional(),
  rua: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
});

export type Empresa = z.infer<typeof EmpresaSchema>;
export type CreateEmpresaDTO = z.infer<typeof CreateEmpresaDTOSchema>;

// Search Terms schemas
export const SearchTermSchema = z.object({
  id: z.string(),
  termo: z.string(),
  categoria: z.string(),
  descricao: z.string().optional(),
  ativo: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateSearchTermSchema = z.object({
  termo: z.string().min(1, 'Termo é obrigatório'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  descricao: z.string().optional(),
  ativo: z.boolean().optional().default(true),
});

export const UpdateSearchTermSchema = CreateSearchTermSchema.partial();

export const SearchTermStatsSchema = z.object({
  termoId: z.string(),
  termo: z.string(),
  totalBuscas: z.number(),
  leadsGerados: z.number(),
  taxaSucesso: z.number().min(0).max(1),
  ultimaExecucao: z.string().optional(),
});

// Google Maps Scraping schemas
export const GoogleMapsSearchParamsSchema = z.object({
  termo: z.string(),
  localizacao: z.string(),
  limite: z.number().min(1).max(1000).default(50),
  prioridade: z.enum(['low', 'normal', 'high']).default('normal'),
  filtros: z.object({
    verificado: z.boolean().optional(),
    comTelefone: z.boolean().optional(),
    avaliacaoMinima: z.number().min(0).max(5).optional(),
    aberto: z.boolean().optional(),
  }).optional().default({}),
});

// Novo formato para criação de jobs de scraping
export const CreateScrapingJobSchema = z.object({
  parametros_busca: z.object({
    termo_busca: z.string(),
    cidade: z.string(),
    estado: z.string(),
    maxResultados: z.number().min(1).max(1000).default(20),
    filtros: z.object({
      apenasVerificados: z.boolean().optional().default(false),
      apenasComTelefone: z.boolean().optional().default(true),
      avaliacaoMinima: z.number().min(0).max(5).optional().default(0),
    }).optional().default({}),
  }),
  prioridade: z.enum(['low', 'normal', 'high']).default('normal'),
});

export const ScrapingJobSchema = z.object({
  id: z.string(),
  parametros: GoogleMapsSearchParamsSchema,
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
  progresso: z.number().min(0).max(100).default(0),
  leadsEncontrados: z.number().default(0),
  erros: z.array(z.string()).default([]),
  criadoEm: z.string(),
  iniciadoEm: z.string().optional(),
  finalizadoEm: z.string().optional(),
});

export const ScrapingTemplateSchema = z.object({
  id: z.string(),
  nome: z.string(),
  segmento: z.string(),
  parametrosBase: GoogleMapsSearchParamsSchema,
  localizacoesSugeridas: z.array(z.string()),
  descricao: z.string().optional(),
  ativo: z.boolean().default(true),
});

export const ScrapingStatsSchema = z.object({
  totalJobs: z.number().optional().default(0),
  jobsAtivos: z.number().optional().default(0),
  jobsConcluidos: z.number().optional().default(0),
  totalLeadsColetados: z.number().optional().default(0),
  leadsHoje: z.number().optional().default(0),
  taxaSucesso: z.number().min(0).max(1).optional().default(0),
  tempoMedioExecucao: z.number().optional().default(0), // em minutos
  ultimaExecucao: z.string().optional(),
});

// Worker Status schemas - matches actual API response from /scraping/status
export const WorkerStatusSchema = z.object({
  isRunning: z.boolean(),
  currentJobs: z.number().optional(),
  maxConcurrentJobs: z.number().optional(),
  totalJobsProcessed: z.number().optional(),
  totalLeadsScraped: z.number().optional(),
  errorCount: z.number().optional(),
  queueSize: z.number().optional(),
});

export const WorkerStatsSchema = z.object({
  totalProcessed: z.number(),
  successRate: z.number().min(0).max(1),
  averageProcessingTime: z.number(), // em segundos
  errorsLastHour: z.number(),
  memoryUsage: z.number().optional(), // em MB
  cpuUsage: z.number().optional(), // percentual
});

// Export types
export type SearchTerm = z.infer<typeof SearchTermSchema>;
export type CreateSearchTerm = z.infer<typeof CreateSearchTermSchema>;
export type UpdateSearchTerm = z.infer<typeof UpdateSearchTermSchema>;
export type SearchTermStats = z.infer<typeof SearchTermStatsSchema>;
export type GoogleMapsSearchParams = z.infer<typeof GoogleMapsSearchParamsSchema>;
export type ScrapingJob = z.infer<typeof ScrapingJobSchema>;
export type CreateScrapingJob = z.infer<typeof CreateScrapingJobSchema>;
export type ScrapingTemplate = z.infer<typeof ScrapingTemplateSchema>;
export type ScrapingStats = z.infer<typeof ScrapingStatsSchema>;
export type WorkerStatus = z.infer<typeof WorkerStatusSchema>;
export type WorkerStats = z.infer<typeof WorkerStatsSchema>;

// Session Management schemas
export const ActiveSessionSchema = z.object({
  id: z.string(),
  device_id: z.string(),
  device_fingerprint: z.string().optional(),
  client_type: z.enum(['web', 'extension']),
  status: z.enum(['active', 'expired', 'revoked', 'suspicious']).optional(),
  last_activity: z.string(),
  created_at: z.string(),
  expires_at: z.string().optional(),
  ip_address: z.string().nullable().optional(),
  user_agent: z.string().nullable().optional(),
  is_current: z.boolean().optional(),
});

export const ActiveSessionsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(ActiveSessionSchema),
});

export const SessionLimitErrorSchema = z.object({
  success: z.literal(false),
  error: z.literal('SESSION_LIMIT_EXCEEDED'),
  message: z.string(),
  data: z.object({
    current_sessions: z.number(),
    max_sessions: z.number(),
    active_sessions: z.array(ActiveSessionSchema),
    action_required: z.literal('CHOOSE_SESSION_TO_CLOSE'),
    management_token: z.string(),
    management_token_expires_in: z.number(),
    allowed_operations: z.array(z.enum(['delete', 'revoke'])),
  }),
  timestamp: z.string(),
});

export const RevokeOtherSessionsSchema = z.object({
  user_id: z.string(),
  keep_device_id: z.string(),
  reason: z.enum(['logout_other_devices', 'security', 'user_request']),
  revoked_by: z.string(),
});

export const DeleteSessionSchema = z.object({
  device_id: z.string(),
  reason: z.enum(['user_logout', 'security', 'expired']),
  revoked_by: z.string(),
});

export type ActiveSession = z.infer<typeof ActiveSessionSchema>;
export type ActiveSessionsResponse = z.infer<typeof ActiveSessionsResponseSchema>;
export type SessionLimitError = z.infer<typeof SessionLimitErrorSchema>;
export type RevokeOtherSessions = z.infer<typeof RevokeOtherSessionsSchema>;
export type DeleteSession = z.infer<typeof DeleteSessionSchema>;

// Lead DTOs
export const CreateLeadDTOSchema = z.object({
  organizationId: z.string(),
  nomeEmpresa: z.string(),
  nomeContato: z.string().optional(),
  cargoContato: z.string().optional(),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  siteEmpresa: z.string().url().optional(),
  cnpj: z.string().optional(),
  segmento: z.string().optional(),
  porteEmpresa: z.enum(['MEI', 'Micro', 'Pequena', 'Média', 'Grande']).optional(),
  numFuncionarios: z.number().optional(),
  receitaAnualEstimada: z.number().optional(),
  endereco: z.object({
    rua: z.string().optional(),
    numero: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().optional(),
    cep: z.string().optional(),
    pais: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional(),
  tags: z.array(z.string()).optional(),
  observacoes: z.string().optional(),
  fonte: z.enum(['MANUAL', 'WEBSITE', 'LINKEDIN', 'INDICACAO', 'EVENTO', 'OUTROS']).optional(),
  dadosOriginais: z.record(z.any()).optional(),
  custoAquisicao: z.number().optional(),
});

export const UpdateLeadDTOSchema = z.object({
  nomeContato: z.string().optional(),
  cargoContato: z.string().optional(),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  siteEmpresa: z.string().url().optional(),
  cnpj: z.string().optional(),
  segmento: z.string().optional(),
  porteEmpresa: z.enum(['MEI', 'Micro', 'Pequena', 'Média', 'Grande']).optional(),
  numFuncionarios: z.number().optional(),
  receitaAnualEstimada: z.number().optional(),
  endereco: z.object({
    rua: z.string().optional(),
    numero: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().optional(),
    cep: z.string().optional(),
    pais: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional(),
  tags: z.array(z.string()).optional(),
  observacoes: z.string().optional(),
  dadosOriginais: z.record(z.any()).optional(),
  custoAquisicao: z.number().optional(),
});