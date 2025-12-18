# Data Model: Sistema de CRUD de Projetos

**Feature**: 001-projeto-crud
**Created**: 2025-12-18
**Phase**: Phase 1 - Design

## Overview

This document defines all TypeScript types, interfaces, and enums for the project CRUD feature. Types are organized by domain entity and include validation rules extracted from functional requirements.

## Core Entities

### Projeto (Base Project Type)

```typescript
/**
 * Base project entity with common fields
 * Source: FR-001 to FR-009 (project creation and basic data)
 */
interface ProjetoBase {
  id: string // UUID
  titulo: string // FR-001: 3-200 chars
  descricao: string // FR-002: 10+ chars
  cliente_id: string // UUID, FK to Cliente
  cliente?: Cliente // Populated relationship
  responsavel_id: string // UUID, FK to Usuario
  responsavel?: Responsavel // Populated relationship
  data_inicio: string // ISO 8601 date
  data_prevista_conclusao: string | null // ISO 8601 date, optional
  status: ProjetoStatus
  created_at: string // ISO 8601 datetime
  updated_at: string // ISO 8601 datetime
  arquivado_em: string | null // ISO 8601 datetime
}

/**
 * Project without methodology (initial state)
 * Source: FR-007, FR-010 (created without methodology)
 */
interface ProjetoSemMetodologia extends ProjetoBase {
  metodologia: null
  pode_definir_metodologia: true
  etapas: [] // No workflow stages until methodology is defined
  progresso_percentual: 0
}

/**
 * Project with methodology defined (immutable)
 * Source: FR-012, FR-020, FR-043 (methodology immutability)
 */
interface ProjetoComMetodologia extends ProjetoBase {
  metodologia: Metodologia
  pode_definir_metodologia: false
  etapas: WorkflowEtapa[]
  progresso_percentual: number // 0-100, FR-032
  metodologia_definida_em: string // ISO 8601 datetime
  metodologia_definida_por_id: string // UUID
}

/**
 * Union type for all project states
 */
type Projeto = ProjetoSemMetodologia | ProjetoComMetodologia

/**
 * Detailed project view with relationships populated
 * Used in ProjetoDetalhesPage
 */
interface ProjetoDetalhado extends Projeto {
  cliente: Cliente // Always populated
  responsavel: Responsavel // Always populated
  participantes: Participante[] // Team members
  anexos: Anexo[] // Attachments (future scope)
}
```

### Metodologia (Methodology Enum)

```typescript
/**
 * Available problem-resolution methodologies
 * Source: FR-011 (MASP, 8D, A3)
 */
enum Metodologia {
  MASP = 'MASP', // Método de Análise e Solução de Problemas (8 etapas)
  OITO_D = '8D', // 8 Disciplines (9 disciplinas na prática)
  A3 = 'A3', // A3 Problem Solving (7 seções)
}

/**
 * Methodology metadata for UI rendering
 */
interface MetodologiaInfo {
  codigo: Metodologia
  nome: string
  descricao: string
  num_etapas: number
  cor: string // Tailwind color class for badges
  icone: string // Icon identifier for UI
}

const METODOLOGIAS: Record<Metodologia, MetodologiaInfo> = {
  [Metodologia.MASP]: {
    codigo: Metodologia.MASP,
    nome: 'MASP',
    descricao: 'Método de Análise e Solução de Problemas',
    num_etapas: 8,
    cor: 'blue',
    icone: 'chart-line',
  },
  [Metodologia.OITO_D]: {
    codigo: Metodologia.OITO_D,
    nome: '8D',
    descricao: '8 Disciplines Problem Solving',
    num_etapas: 9,
    cor: 'green',
    icone: 'layers',
  },
  [Metodologia.A3]: {
    codigo: Metodologia.A3,
    nome: 'A3',
    descricao: 'A3 Problem Solving',
    num_etapas: 7,
    cor: 'purple',
    icone: 'file-text',
  },
}
```

### ProjetoStatus (Project Status)

```typescript
/**
 * Project lifecycle status
 * Source: FR-033 to FR-037 (status management)
 */
enum ProjetoStatus {
  PLANEJAMENTO = 'PLANEJAMENTO', // Initial state
  EM_ANDAMENTO = 'EM_ANDAMENTO', // Actively being worked on
  AGUARDANDO = 'AGUARDANDO', // Waiting for external input
  CONCLUIDO = 'CONCLUIDO', // All stages completed
  CANCELADO = 'CANCELADO', // Cancelled by user
  ARQUIVADO = 'ARQUIVADO', // Archived (soft delete)
}

/**
 * Status metadata for UI rendering
 */
interface StatusInfo {
  codigo: ProjetoStatus
  label: string
  cor: string // Tailwind color class
  descricao: string
}

const STATUS_INFO: Record<ProjetoStatus, StatusInfo> = {
  [ProjetoStatus.PLANEJAMENTO]: {
    codigo: ProjetoStatus.PLANEJAMENTO,
    label: 'Planejamento',
    cor: 'gray',
    descricao: 'Projeto em fase inicial de planejamento',
  },
  [ProjetoStatus.EM_ANDAMENTO]: {
    codigo: ProjetoStatus.EM_ANDAMENTO,
    label: 'Em Andamento',
    cor: 'blue',
    descricao: 'Projeto em execução',
  },
  [ProjetoStatus.AGUARDANDO]: {
    codigo: ProjetoStatus.AGUARDANDO,
    label: 'Aguardando',
    cor: 'yellow',
    descricao: 'Aguardando informação externa',
  },
  [ProjetoStatus.CONCLUIDO]: {
    codigo: ProjetoStatus.CONCLUIDO,
    label: 'Concluído',
    cor: 'green',
    descricao: 'Projeto finalizado com sucesso',
  },
  [ProjetoStatus.CANCELADO]: {
    codigo: ProjetoStatus.CANCELADO,
    label: 'Cancelado',
    cor: 'red',
    descricao: 'Projeto cancelado',
  },
  [ProjetoStatus.ARQUIVADO]: {
    codigo: ProjetoStatus.ARQUIVADO,
    label: 'Arquivado',
    cor: 'slate',
    descricao: 'Projeto arquivado',
  },
}
```

### WorkflowEtapa (Workflow Stage - Polymorphic)

```typescript
/**
 * Base workflow stage (common fields)
 * Source: FR-013 (automatic stage initialization)
 */
interface WorkflowEtapaBase {
  id: string // UUID
  projeto_id: string // UUID, FK to Projeto
  ordem: number // 1-based sequence
  titulo: string
  descricao: string
  status: EtapaStatus
  data_inicio: string | null // ISO 8601 date
  data_conclusao: string | null // ISO 8601 date
  responsavel_id: string | null
  responsavel?: Responsavel
  observacoes: string | null
  anexos: Anexo[]
  created_at: string
  updated_at: string
}

/**
 * MASP-specific stage (8 etapas)
 */
interface EtapaMasp extends WorkflowEtapaBase {
  tipo: 'MASP'
  fase: MaspFase
}

enum MaspFase {
  IDENTIFICACAO = 'IDENTIFICACAO',
  OBSERVACAO = 'OBSERVACAO',
  ANALISE = 'ANALISE',
  PLANO_ACAO = 'PLANO_ACAO',
  EXECUCAO = 'EXECUCAO',
  VERIFICACAO = 'VERIFICACAO',
  PADRONIZACAO = 'PADRONIZACAO',
  CONCLUSAO = 'CONCLUSAO',
}

/**
 * 8D-specific stage (9 disciplinas)
 */
interface Etapa8D extends WorkflowEtapaBase {
  tipo: '8D'
  disciplina: Disciplina8D
}

enum Disciplina8D {
  D0_PREPARACAO = 'D0_PREPARACAO',
  D1_EQUIPE = 'D1_EQUIPE',
  D2_DESCRICAO = 'D2_DESCRICAO',
  D3_CONTENCAO = 'D3_CONTENCAO',
  D4_CAUSA_RAIZ = 'D4_CAUSA_RAIZ',
  D5_ACAO_CORRETIVA = 'D5_ACAO_CORRETIVA',
  D6_IMPLEMENTACAO = 'D6_IMPLEMENTACAO',
  D7_PREVENCAO = 'D7_PREVENCAO',
  D8_RECONHECIMENTO = 'D8_RECONHECIMENTO',
}

/**
 * A3-specific stage (7 seções)
 */
interface EtapaA3 extends WorkflowEtapaBase {
  tipo: 'A3'
  secao: SecaoA3
}

enum SecaoA3 {
  CONTEXTO = 'CONTEXTO',
  CONDICAO_ATUAL = 'CONDICAO_ATUAL',
  OBJETIVO = 'OBJETIVO',
  ANALISE_CAUSA_RAIZ = 'ANALISE_CAUSA_RAIZ',
  CONTRAMEDIDAS = 'CONTRAMEDIDAS',
  PLANO = 'PLANO',
  ACOMPANHAMENTO = 'ACOMPANHAMENTO',
}

/**
 * Union type for all stage types
 */
type WorkflowEtapa = EtapaMasp | Etapa8D | EtapaA3
```

### EtapaStatus (Stage Status)

```typescript
/**
 * Workflow stage status
 * Source: FR-029 to FR-031 (stage progress tracking)
 */
enum EtapaStatus {
  PENDENTE = 'PENDENTE',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDA = 'CONCLUIDA',
  BLOQUEADA = 'BLOQUEADA',
}

const ETAPA_STATUS_INFO: Record<EtapaStatus, StatusInfo> = {
  [EtapaStatus.PENDENTE]: {
    codigo: EtapaStatus.PENDENTE,
    label: 'Pendente',
    cor: 'gray',
    descricao: 'Etapa ainda não iniciada',
  },
  [EtapaStatus.EM_ANDAMENTO]: {
    codigo: EtapaStatus.EM_ANDAMENTO,
    label: 'Em Andamento',
    cor: 'blue',
    descricao: 'Etapa em execução',
  },
  [EtapaStatus.CONCLUIDA]: {
    codigo: EtapaStatus.CONCLUIDA,
    label: 'Concluída',
    cor: 'green',
    descricao: 'Etapa finalizada',
  },
  [EtapaStatus.BLOQUEADA]: {
    codigo: EtapaStatus.BLOQUEADA,
    label: 'Bloqueada',
    cor: 'red',
    descricao: 'Etapa bloqueada por impedimento',
  },
}
```

## Related Entities

### Cliente (Customer)

```typescript
/**
 * Customer entity (referenced by projects)
 * Source: FR-003 (customer is required)
 */
interface Cliente {
  id: string // UUID
  nome: string
  razao_social: string | null
  cnpj: string | null
  email: string
  telefone: string | null
  ativo: boolean
}
```

### Responsavel (User/Responsible)

```typescript
/**
 * User entity for project ownership and team members
 * Source: FR-004 (responsible is required)
 */
interface Responsavel {
  id: string // UUID
  nome: string
  email: string
  avatar_url: string | null
  cargo: string | null
  departamento: string | null
  ativo: boolean
}

/**
 * Project participant (team member)
 */
interface Participante extends Responsavel {
  papel: 'MEMBRO' | 'OBSERVADOR' | 'APROVADOR'
  adicionado_em: string // ISO 8601 datetime
}
```

### Anexo (Attachment)

```typescript
/**
 * File attachment (future scope, included for completeness)
 */
interface Anexo {
  id: string // UUID
  nome: string
  tipo_arquivo: string // MIME type
  tamanho_bytes: number
  url: string
  uploaded_por_id: string
  uploaded_em: string // ISO 8601 datetime
}
```

## API Request/Response Types

### Request DTOs

```typescript
/**
 * Request to create a new project (without methodology)
 * Source: FR-001 to FR-009
 */
interface CreateProjetoRequest {
  titulo: string
  descricao: string
  cliente_id: string
  responsavel_id: string
  data_inicio: string // ISO 8601 date
  data_prevista_conclusao?: string // ISO 8601 date, optional
  status?: ProjetoStatus // Defaults to PLANEJAMENTO
}

/**
 * Request to update project basic data
 * Source: FR-038 to FR-042 (edit project)
 */
interface UpdateProjetoRequest {
  titulo?: string
  descricao?: string
  data_prevista_conclusao?: string | null
  status?: ProjetoStatus
  // metodologia is EXCLUDED - immutable per FR-043
}

/**
 * Request to define methodology (one-time operation)
 * Source: FR-010 to FR-020
 */
interface DefinirMetodologiaRequest {
  metodologia: Metodologia
}

/**
 * Request to archive project
 * Source: FR-060 to FR-063
 */
interface ArquivarProjetoRequest {
  motivo?: string // Optional archive reason
}

/**
 * List projects query parameters
 * Source: FR-044 to FR-059 (filtering, pagination)
 */
interface ListProjetosQuery {
  page?: number // Default: 1
  limit?: number // Default: 20
  status?: ProjetoStatus | ProjetoStatus[]
  metodologia?: Metodologia | Metodologia[]
  cliente_id?: string
  responsavel_id?: string
  busca?: string // Full-text search in titulo/descricao
  data_inicio_de?: string // ISO 8601 date
  data_inicio_ate?: string // ISO 8601 date
  incluir_arquivados?: boolean // Default: false
  ordenar_por?: 'data_inicio' | 'titulo' | 'updated_at'
  ordem?: 'asc' | 'desc' // Default: desc
}
```

### Response DTOs

```typescript
/**
 * Paginated list response
 */
interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

type ListProjetosResponse = PaginatedResponse<Projeto>

/**
 * Single project response (with relationships)
 */
type GetProjetoResponse = ProjetoDetalhado

/**
 * Standard success response
 */
interface SuccessResponse {
  success: true
  message: string
}

/**
 * Standard error response
 */
interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, string[]> // Validation errors
  }
}
```

## Validation Rules

### Project Creation Validation

```typescript
import { z } from 'zod'

const projetoCreateSchema = z.object({
  titulo: z
    .string()
    .min(3, 'Título deve ter no mínimo 3 caracteres')
    .max(200, 'Título deve ter no máximo 200 caracteres'),
  descricao: z
    .string()
    .min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  cliente_id: z
    .string()
    .uuid('ID do cliente inválido'),
  responsavel_id: z
    .string()
    .uuid('ID do responsável inválido'),
  data_inicio: z
    .string()
    .datetime()
    .or(z.date()),
  data_prevista_conclusao: z
    .string()
    .datetime()
    .or(z.date())
    .nullable()
    .optional(),
  status: z
    .nativeEnum(ProjetoStatus)
    .optional()
    .default(ProjetoStatus.PLANEJAMENTO),
})

type ProjetoCreateInput = z.infer<typeof projetoCreateSchema>
```

### Project Update Validation

```typescript
const projetoUpdateSchema = z.object({
  titulo: z
    .string()
    .min(3)
    .max(200)
    .optional(),
  descricao: z
    .string()
    .min(10)
    .optional(),
  data_prevista_conclusao: z
    .string()
    .datetime()
    .or(z.date())
    .nullable()
    .optional(),
  status: z
    .nativeEnum(ProjetoStatus)
    .optional(),
  // metodologia is intentionally excluded (FR-043)
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Pelo menos um campo deve ser atualizado' }
)

type ProjetoUpdateInput = z.infer<typeof projetoUpdateSchema>
```

### Methodology Definition Validation

```typescript
const definirMetodologiaSchema = z.object({
  metodologia: z
    .nativeEnum(Metodologia, {
      errorMap: () => ({ message: 'Metodologia inválida' }),
    }),
})

type DefinirMetodologiaInput = z.infer<typeof definirMetodologiaSchema>
```

## Type Guards

```typescript
/**
 * Type guard to check if project has methodology defined
 */
function isProjetoComMetodologia(
  projeto: Projeto
): projeto is ProjetoComMetodologia {
  return projeto.metodologia !== null
}

/**
 * Type guard for MASP stages
 */
function isEtapaMasp(etapa: WorkflowEtapa): etapa is EtapaMasp {
  return etapa.tipo === 'MASP'
}

/**
 * Type guard for 8D stages
 */
function isEtapa8D(etapa: WorkflowEtapa): etapa is Etapa8D {
  return etapa.tipo === '8D'
}

/**
 * Type guard for A3 stages
 */
function isEtapaA3(etapa: WorkflowEtapa): etapa is EtapaA3 {
  return etapa.tipo === 'A3'
}
```

## State Transitions

### Project Lifecycle

```
NULL (creation)
  ↓
PLANEJAMENTO (initial status)
  ↓
EM_ANDAMENTO (work started)
  ↓ ↔ AGUARDANDO (can toggle)
  ↓
CONCLUIDO (all stages done)
  ↓
ARQUIVADO (soft delete)

CANCELADO (can transition from any state except CONCLUIDO/ARQUIVADO)
```

### Methodology Definition

```
metodologia: null (creation)
  ↓ (one-time operation via DefinirMetodologiaRequest)
metodologia: MASP | 8D | A3 (immutable forever)
```

### Stage Status Flow

```
PENDENTE (initial)
  ↓
EM_ANDAMENTO (work started)
  ↓ ↔ BLOQUEADA (can unblock and resume)
  ↓
CONCLUIDA (final state)
```

## Summary

This data model defines:
- **4 core entities**: Projeto (polymorphic), Metodologia, WorkflowEtapa (polymorphic), ProjetoStatus
- **3 related entities**: Cliente, Responsavel, Anexo
- **8 request DTOs**: Create, Update, DefinirMetodologia, Arquivar, ListQuery
- **4 response DTOs**: Paginated, Detailed, Success, Error
- **3 Zod schemas**: Create validation, Update validation, Metodologia validation
- **4 type guards**: Methodology check, MASP/8D/A3 stage type checks
- **Immutability enforcement**: TypeScript types + validation prevent methodology changes (FR-043)

All types are derived from functional requirements (FR-001 to FR-063) in the spec.
