# Data Model: Campaign Lead Stages Management Frontend

**Feature**: Campaign Lead Stages Management Frontend
**Branch**: `006-doc-frontend-campaign`
**Date**: 2025-10-09

## Overview

This document defines the TypeScript interfaces, types, and data structures for the Campaign Lead Stages feature. All models are designed to match the backend API contracts while following established frontend patterns.

## Core Domain Models

### CampaignLeadStage

Represents a stage in the sales funnel for a specific company.

```typescript
/**
 * Stage category defines the semantic meaning of a stage
 */
export type StageCategory =
  | 'novo'          // New/uncontacted leads
  | 'contato'       // First contact made
  | 'qualificacao'  // Qualification in progress
  | 'negociacao'    // Active negotiation
  | 'ganho'         // Deal won (final stage)
  | 'perdido'       // Deal lost (final stage)

/**
 * Campaign lead stage configuration
 * Represents a customizable stage in the sales funnel
 */
export interface CampaignLeadStage {
  id: string                    // UUID
  empresaId: string             // UUID - company owner
  nome: string                  // Display name (unique per company)
  categoria: StageCategory      // Semantic category
  cor: string                   // Hex color #RRGGBB for UI display
  icone?: string                // Lucide icon name (e.g., "star", "check-circle")
  ordem: number                 // Display order (0-indexed, controls column position)
  isInicial: boolean            // Initial stage (only 1 per company)
  isFinal: boolean              // Final stage (no further transitions)
  cobraCreditos: boolean        // Whether to charge credits on transition
  custocentavos?: number        // Cost in centavos (required if cobraCreditos=true)
  descricaoCobranca?: string    // Charge description
  isAtivo: boolean              // Soft delete flag (false = deleted)
  criadoPor?: string            // UUID - creator user ID
  createdAt: string             // ISO 8601 timestamp
  updatedAt: string             // ISO 8601 timestamp
}

/**
 * Payload for creating a new stage
 */
export interface CreateStageRequest {
  nome: string
  categoria: StageCategory
  cor: string                   // Must be valid hex: #RRGGBB
  icone?: string
  ordem?: number                // Auto-assigned if not provided
  isInicial?: boolean           // Default: false
  isFinal?: boolean             // Default: false
  cobraCreditos?: boolean       // Default: false
  custocentavos?: number        // Required if cobraCreditos=true
  descricaoCobranca?: string
}

/**
 * Payload for updating an existing stage
 * Note: categoria and isInicial cannot be changed after creation (backend validation)
 */
export interface UpdateStageRequest {
  nome?: string
  cor?: string
  icone?: string
  cobraCreditos?: boolean
  custocentavos?: number
  descricaoCobranca?: string
  // ❌ Not allowed: categoria, isInicial
}

/**
 * Payload for reordering stages (drag-and-drop)
 */
export interface ReorderStagesRequest {
  stages: Array<{
    id: string
    ordem: number               // New order position
  }>
}
```

### CampaignContactStageHistory

Audit trail of all stage transitions for a lead.

```typescript
/**
 * Historical record of a stage transition
 */
export interface CampaignContactStageHistory {
  id: string                    // UUID
  campaignContactId: string     // Lead/contact ID
  fromStageId: string | null    // null on initial transition (lead creation)
  toStageId: string             // Destination stage
  motivo?: string               // Reason for transition (user-provided)
  automatico: boolean           // true = automated, false = manual
  duracaoHoras?: number         // Time spent in previous stage (auto-calculated)
  criadoPor?: string            // UUID - user who made transition (null if automatic)
  createdAt: string             // ISO 8601 timestamp

  // Denormalized fields for UI display (included in API response)
  fromStageName?: string        // Name of previous stage
  toStageName: string           // Name of new stage
  userName?: string             // Name of user who made transition
}

/**
 * Payload for transitioning a single lead to a new stage
 */
export interface TransitionLeadRequest {
  stageId: string               // Target stage UUID
  motivo?: string               // Reason for transition (optional)
  automatico: boolean           // Should be false for manual transitions
}

/**
 * Response from transitioning a lead
 */
export interface TransitionLeadResponse {
  success: boolean
  data: {
    contactId: string
    previousStageId: string | null
    currentStageId: string
    stageChangedAt: string      // ISO 8601
    stageChangedBy: string | null
    duracaoHoras: number | null
  }
  warnings?: Array<{
    type: 'charge_failed' | 'validation_warning'
    message: string             // e.g., "Cobrança de R$ 5,00 falhou: Saldo insuficiente"
  }>
}

/**
 * Payload for bulk stage update
 */
export interface BulkStageUpdateRequest {
  contactIds: string[]          // Array of lead UUIDs
  stageId: string               // Target stage UUID
  motivo?: string               // Reason for transition
  automatico: boolean           // Should be false for manual bulk updates
}

/**
 * Response from bulk stage update
 */
export interface BulkStageUpdateResponse {
  success: boolean
  data: {
    successCount: number
    failedCount: number
    totalRequested: number
    errors: Array<{
      contactId: string
      error: string             // Error message
    }>
    chargeWarnings: Array<{
      contactId: string
      warning: string           // Charge failure message
    }>
  }
}
```

### CampaignStageCharge

Billing record for stage transitions.

```typescript
/**
 * Type of charge
 */
export type ChargeType =
  | 'mudanca_estagio'    // Charge for stage transition
  | 'acesso_lead'        // Charge for lead access (future)
  | 'execucao_agente'    // Charge for AI agent execution (future)

/**
 * Billing record for a stage transition
 */
export interface CampaignStageCharge {
  id: string                    // UUID
  empresaId: string             // UUID
  campanhaId: string            // UUID
  campaignContactId: string     // Lead/contact UUID
  stageId: string               // Stage that triggered charge
  custocentavos: number         // Charge amount in centavos
  tipoCobranca: ChargeType
  creditoTransacaoId?: string   // UUID of credit transaction (null if failed)
  motivo?: string               // Charge description
  foiCobrado: boolean           // true = charged successfully, false = failed
  erroCobranca?: string         // Error message if foiCobrado=false
  createdAt: string             // ISO 8601 timestamp

  // Denormalized for UI
  stageName?: string
}

/**
 * Filters for charge list API
 */
export interface ChargeFilters {
  startDate?: string            // ISO date
  endDate?: string              // ISO date
  stageId?: string              // Filter by stage
  foiCobrado?: boolean          // Filter by success/failure
}

/**
 * Summary of charges for a campaign
 */
export interface ChargesSummary {
  campanhaId: string
  totalCharges: number          // Total charge attempts
  successfulCharges: number     // Successful charges
  failedCharges: number         // Failed charges
  totalAmountCentavos: number   // Total amount charged (successful only)
  totalAmountReais: number      // Total amount in reais (centavos / 100)
  chargesByStage: Array<{
    stageId: string
    stageName: string
    chargeCount: number
    totalCentavos: number
    totalReais: number
  }>
  generatedAt: string           // ISO 8601 timestamp
}
```

### FunnelMetrics

Analytics data for campaign funnel visualization.

```typescript
/**
 * Metrics for a single stage in the funnel
 */
export interface StageMetrics {
  stageId: string
  stageName: string
  categoria: StageCategory
  cor: string
  ordem: number
  leadCount: number                 // Current leads in this stage
  percentageOfTotal: number         // % of total leads (0-100)
  conversionFromPrevious: number | null  // % converted from previous stage
  averageDurationHours: number | null    // Average time leads spend here
}

/**
 * Complete funnel metrics for a campaign
 */
export interface FunnelMetrics {
  campaignId: string
  totalLeads: number
  stages: StageMetrics[]            // Ordered by ordem
  generatedAt: string               // ISO 8601 timestamp
}
```

### BillingConfiguration

Company-wide billing settings.

```typescript
/**
 * Billing model options
 */
export type BillingModel =
  | 'mudanca_estagio'
  | 'acesso_lead'
  | 'execucao_agente'

/**
 * Company billing configuration
 */
export interface BillingConfiguration {
  empresaId: string
  modeloCobrancaCampanha: BillingModel
  debitarMudancaEstagio: boolean    // Enable/disable stage transition charging
  updatedAt: string                 // ISO 8601 timestamp
}

/**
 * Payload for updating billing configuration
 */
export interface UpdateBillingConfigRequest {
  modeloCobrancaCampanha: BillingModel
  debitarMudancaEstagio: boolean
}
```

## Extended Campaign Models

Extend existing `Campaign` and `CampaignContact` interfaces.

```typescript
/**
 * Extension to existing Campaign interface
 * (Located in src/features/campaigns/types/campaigns.ts)
 */
export interface Campaign {
  // ... existing fields ...

  // NEW: Stage-related fields
  currentStages?: CampaignLeadStage[]  // Cache of active stages for this campaign
  defaultStageId?: string               // Initial stage for new leads
}

/**
 * Extension to existing CampaignContact interface
 * (Located in src/features/campaigns/types/campaigns.ts)
 */
export interface CampaignContact {
  // ... existing fields ...

  // NEW: Stage tracking
  currentStageId?: string               // Current stage UUID
  stageChangedAt?: string               // ISO 8601 - last stage change
  stageChangedBy?: string               // UUID - user who changed stage
}
```

## Validation Schemas (Zod)

Validation schemas for forms and API responses.

```typescript
import { z } from 'zod'

/**
 * Stage category enum validation
 */
export const StageCategorySchema = z.enum([
  'novo',
  'contato',
  'qualificacao',
  'negociacao',
  'ganho',
  'perdido'
])

/**
 * Hex color validation
 */
export const HexColorSchema = z
  .string()
  .regex(/^#[0-9A-F]{6}$/i, 'Color must be in format #RRGGBB')

/**
 * Campaign lead stage schema
 */
export const CampaignLeadStageSchema = z.object({
  id: z.string().uuid(),
  empresaId: z.string().uuid(),
  nome: z.string().min(1).max(100),
  categoria: StageCategorySchema,
  cor: HexColorSchema,
  icone: z.string().optional(),
  ordem: z.number().int().min(0).max(19), // Max 20 stages (0-19)
  isInicial: z.boolean(),
  isFinal: z.boolean(),
  cobraCreditos: z.boolean(),
  custocentavos: z.number().int().min(0).optional(),
  descricaoCobranca: z.string().max(255).optional(),
  isAtivo: z.boolean(),
  criadoPor: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

/**
 * Create stage form schema
 */
export const CreateStageSchema = z.object({
  nome: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  categoria: StageCategorySchema,
  cor: HexColorSchema,
  icone: z.string().optional(),
  ordem: z.number().int().min(0).max(19).optional(),
  isInicial: z.boolean().default(false),
  isFinal: z.boolean().default(false),
  cobraCreditos: z.boolean().default(false),
  custocentavos: z.number().int().min(0).optional(),
  descricaoCobranca: z.string().max(255).optional()
}).refine(
  (data) => {
    // If cobraCreditos is true, custocentavos is required
    if (data.cobraCreditos && !data.custocentavos) {
      return false
    }
    return true
  },
  {
    message: 'Custo em centavos é obrigatório quando cobrança está ativada',
    path: ['custocentavos']
  }
)

/**
 * Update stage form schema
 */
export const UpdateStageSchema = z.object({
  nome: z.string().min(1).max(100).optional(),
  cor: HexColorSchema.optional(),
  icone: z.string().optional(),
  cobraCreditos: z.boolean().optional(),
  custocentavos: z.number().int().min(0).optional(),
  descricaoCobranca: z.string().max(255).optional()
}).refine(
  (data) => {
    if (data.cobraCreditos && !data.custocentavos) {
      return false
    }
    return true
  },
  {
    message: 'Custo em centavos é obrigatório quando cobrança está ativada',
    path: ['custocentavos']
  }
)

/**
 * Transition lead form schema
 */
export const TransitionLeadSchema = z.object({
  stageId: z.string().uuid('ID do estágio inválido'),
  motivo: z.string().max(500, 'Motivo deve ter no máximo 500 caracteres').optional(),
  automatico: z.boolean().default(false)
})

/**
 * Stage history schema
 */
export const CampaignContactStageHistorySchema = z.object({
  id: z.string().uuid(),
  campaignContactId: z.string().uuid(),
  fromStageId: z.string().uuid().nullable(),
  toStageId: z.string().uuid(),
  motivo: z.string().optional(),
  automatico: z.boolean(),
  duracaoHoras: z.number().optional(),
  criadoPor: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
  fromStageName: z.string().optional(),
  toStageName: z.string(),
  userName: z.string().optional()
})
```

## API Response Wrappers

Standard API response formats.

```typescript
/**
 * Standard success response wrapper
 */
export interface ApiSuccessResponse<T> {
  success: true
  data: T
}

/**
 * Standard error response wrapper
 */
export interface ApiErrorResponse {
  success: false
  error: string
  details?: any
}

/**
 * List stages response
 */
export type ListStagesResponse = ApiSuccessResponse<{
  stages: CampaignLeadStage[]
  total: number
}>

/**
 * Get single stage response
 */
export type GetStageResponse = ApiSuccessResponse<CampaignLeadStage>

/**
 * Create/Update stage response
 */
export type MutateStageResponse = ApiSuccessResponse<CampaignLeadStage>

/**
 * Delete stage response
 */
export type DeleteStageResponse = ApiSuccessResponse<{
  message: string
}>

/**
 * Reorder stages response
 */
export type ReorderStagesResponse = ApiSuccessResponse<{
  message: string
}>

/**
 * List stage history response
 */
export type ListHistoryResponse = ApiSuccessResponse<{
  history: CampaignContactStageHistory[]
  total: number
}>

/**
 * Get funnel metrics response
 */
export type GetFunnelMetricsResponse = ApiSuccessResponse<FunnelMetrics>

/**
 * List charges response
 */
export type ListChargesResponse = ApiSuccessResponse<{
  charges: CampaignStageCharge[]
  total: number
}>

/**
 * Get charges summary response
 */
export type GetChargesSummaryResponse = ApiSuccessResponse<ChargesSummary>
```

## UI-Specific Models

Models used only in the frontend for UI state management.

```typescript
/**
 * Stage card display props
 */
export interface StageCardData extends CampaignLeadStage {
  leadCount?: number            // Number of leads currently in this stage
  isReordering?: boolean        // True during drag-and-drop
}

/**
 * Lead card for Kanban board
 */
export interface LeadCardData {
  id: string
  nome: string
  email?: string
  telefone?: string
  empresa?: string
  currentStageId: string
  stageChangedAt?: string
  score?: number
  tags?: string[]
}

/**
 * Kanban column data
 */
export interface KanbanColumn {
  stage: CampaignLeadStage
  leads: LeadCardData[]
  isLoading?: boolean
}

/**
 * Form state for stage creation/editing
 */
export interface StageFormState {
  mode: 'create' | 'edit'
  stage?: CampaignLeadStage     // Populated in edit mode
  isSubmitting: boolean
  errors?: Record<string, string>
}

/**
 * Bulk action state
 */
export interface BulkActionState {
  selectedLeadIds: string[]
  isProcessing: boolean
  targetStageId?: string
  motivo?: string
}

/**
 * Charge warning toast data
 */
export interface ChargeWarning {
  type: 'charge_failed'
  leadId: string
  leadName: string
  amount: number                // In centavos
  errorMessage: string
}
```

## Utility Types

Helper types for common patterns.

```typescript
/**
 * Omit fields for create operations
 */
export type CreateDto<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'empresaId' | 'criadoPor'>

/**
 * Partial fields for update operations
 */
export type UpdateDto<T> = Partial<Omit<T, 'id' | 'createdAt' | 'empresaId'>>

/**
 * Query filters with pagination
 */
export interface PaginatedFilters {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}
```

## Type Guards

Runtime type checking helpers.

```typescript
/**
 * Check if a stage is the initial stage
 */
export function isInitialStage(stage: CampaignLeadStage): boolean {
  return stage.isInicial === true
}

/**
 * Check if a stage is a final stage
 */
export function isFinalStage(stage: CampaignLeadStage): boolean {
  return stage.isFinal === true
}

/**
 * Check if a stage charges credits
 */
export function stageChargesCredits(stage: CampaignLeadStage): boolean {
  return stage.cobraCreditos === true && (stage.custocentavos ?? 0) > 0
}

/**
 * Check if API response is an error
 */
export function isApiError(response: any): response is ApiErrorResponse {
  return response?.success === false
}

/**
 * Check if transition response has warnings
 */
export function hasTransitionWarnings(response: TransitionLeadResponse): boolean {
  return !!response.warnings && response.warnings.length > 0
}
```

## Constants

Common constants used across the feature.

```typescript
/**
 * Stage configuration limits
 */
export const STAGE_LIMITS = {
  MAX_STAGES_PER_COMPANY: 20,
  MIN_STAGE_NAME_LENGTH: 1,
  MAX_STAGE_NAME_LENGTH: 100,
  MAX_MOTIVO_LENGTH: 500,
  MAX_DESCRICAO_COBRANCA_LENGTH: 255
} as const

/**
 * Default colors for stage categories
 */
export const DEFAULT_STAGE_COLORS: Record<StageCategory, string> = {
  novo: '#3B82F6',          // Blue
  contato: '#8B5CF6',       // Purple
  qualificacao: '#10B981',  // Green
  negociacao: '#F59E0B',    // Amber
  ganho: '#10B981',         // Green
  perdido: '#EF4444'        // Red
} as const

/**
 * Default icons for stage categories
 */
export const DEFAULT_STAGE_ICONS: Record<StageCategory, string> = {
  novo: 'inbox',
  contato: 'phone',
  qualificacao: 'star',
  negociacao: 'trending-up',
  ganho: 'check-circle',
  perdido: 'x-circle'
} as const

/**
 * Stage category labels (Portuguese)
 */
export const STAGE_CATEGORY_LABELS: Record<StageCategory, string> = {
  novo: 'Novo Lead',
  contato: 'Contato Inicial',
  qualificacao: 'Qualificação',
  negociacao: 'Negociação',
  ganho: 'Ganho',
  perdido: 'Perdido'
} as const
```

## File Organization

Recommended file structure for type definitions:

```
src/features/campaign-stages/
├── types/
│   ├── index.ts                      # Re-exports all types
│   ├── stage.types.ts                # CampaignLeadStage, CreateStageRequest, etc.
│   ├── history.types.ts              # CampaignContactStageHistory, transitions
│   ├── charge.types.ts               # CampaignStageCharge, billing types
│   ├── metrics.types.ts              # FunnelMetrics, StageMetrics
│   ├── ui.types.ts                   # UI-specific types
│   └── constants.ts                  # Constants and defaults
├── schemas/
│   ├── index.ts                      # Re-exports all schemas
│   ├── stage.schemas.ts              # Zod schemas for stages
│   ├── transition.schemas.ts         # Zod schemas for transitions
│   └── charge.schemas.ts             # Zod schemas for charges
└── utils/
    ├── type-guards.ts                # Type guard functions
    ├── validators.ts                 # Custom validators
    └── formatters.ts                 # Data formatters (e.g., centavos to reais)
```

---

**Data Model Version**: 1.0
**Last Updated**: 2025-10-09
**Status**: Complete
