# API Service Contracts: Campaign Lead Stages

**Feature**: Campaign Lead Stages Management Frontend
**Branch**: `006-doc-frontend-campaign`
**Date**: 2025-10-09

## Overview

This document defines the service layer contracts for the Campaign Lead Stages feature. All service functions follow established patterns from the existing codebase (`src/features/campaigns/services/campaigns.ts`) and use the centralized `apiClient`.

## Service Module Structure

```typescript
// Location: src/features/campaign-stages/services/stages.ts

import { apiClient } from '@/shared/services/client'
import type {
  CampaignLeadStage,
  CreateStageRequest,
  UpdateStageRequest,
  ReorderStagesRequest,
  TransitionLeadRequest,
  TransitionLeadResponse,
  BulkStageUpdateRequest,
  BulkStageUpdateResponse,
  CampaignContactStageHistory,
  FunnelMetrics,
  CampaignStageCharge,
  ChargeFilters,
  ChargesSummary,
  BillingConfiguration,
  UpdateBillingConfigRequest
} from '../types'

const STAGES_ENDPOINT = '/api/v1/campaign-lead-stages'
```

---

## 1. Stage Management Services (US1)

### 1.1 List Stages

**Function**: `fetchCampaignStages`

```typescript
/**
 * Fetch all campaign lead stages for the current company
 * @param filters - Optional filters for the query
 * @returns Promise<CampaignLeadStage[]>
 */
export async function fetchCampaignStages(filters?: {
  includeInactive?: boolean
  categoria?: StageCategory
}): Promise<CampaignLeadStage[]> {
  try {
    const queryParams = new URLSearchParams()

    if (filters?.includeInactive !== undefined) {
      queryParams.append('includeInactive', filters.includeInactive.toString())
    }
    if (filters?.categoria) {
      queryParams.append('categoria', filters.categoria)
    }

    const query = queryParams.toString() ? `?${queryParams}` : ''
    const response = await apiClient.request<{
      success: boolean
      data: CampaignLeadStage[]
      total: number
    }>(`${STAGES_ENDPOINT}${query}`, {
      method: 'GET'
    })

    return response.data
  } catch (error) {
    console.error('Error fetching campaign stages:', error)
    throw new Error('Falha ao buscar estágios da campanha')
  }
}
```

**API Endpoint**: `GET /api/v1/campaign-lead-stages`

**Query Parameters**:
- `includeInactive` (boolean, optional): Include soft-deleted stages
- `categoria` (StageCategory, optional): Filter by category

**Response**: `{ success: boolean, data: CampaignLeadStage[], total: number }`

**Error Handling**:
- Network errors: Caught and rethrown with user-friendly message
- 401 Unauthorized: Handled by apiClient (auto-refresh)
- 500 Server Error: Rethrown

---

### 1.2 Get Single Stage

**Function**: `fetchCampaignStage`

```typescript
/**
 * Fetch a single campaign lead stage by ID
 * @param stageId - UUID of the stage
 * @returns Promise<CampaignLeadStage>
 */
export async function fetchCampaignStage(stageId: string): Promise<CampaignLeadStage> {
  try {
    const response = await apiClient.request<{
      success: boolean
      data: CampaignLeadStage
    }>(`${STAGES_ENDPOINT}/${stageId}`, {
      method: 'GET'
    })

    return response.data
  } catch (error) {
    console.error('Error fetching campaign stage:', error)
    throw new Error('Falha ao buscar estágio')
  }
}
```

**API Endpoint**: `GET /api/v1/campaign-lead-stages/{stageId}`

**Response**: `{ success: boolean, data: CampaignLeadStage }`

**Error Codes**:
- 404: Stage not found

---

### 1.3 Create Stage

**Function**: `createCampaignStage`

```typescript
/**
 * Create a new campaign lead stage
 * @param data - Stage creation data
 * @returns Promise<CampaignLeadStage>
 */
export async function createCampaignStage(data: CreateStageRequest): Promise<CampaignLeadStage> {
  try {
    const response = await apiClient.request<{
      success: boolean
      data: CampaignLeadStage
    }>(STAGES_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(data)
    })

    return response.data
  } catch (error) {
    console.error('Error creating campaign stage:', error)

    // Check for specific error types
    if (error instanceof Error && error.message.includes('409')) {
      throw new Error('Nome duplicado ou múltiplos estágios iniciais')
    }
    if (error instanceof Error && error.message.includes('400')) {
      throw new Error('Dados inválidos. Verifique os campos obrigatórios.')
    }

    throw new Error('Falha ao criar estágio')
  }
}
```

**API Endpoint**: `POST /api/v1/campaign-lead-stages`

**Request Body**: `CreateStageRequest`

**Response**: `{ success: boolean, data: CampaignLeadStage }`

**Error Codes**:
- 400: Validation failed (invalid data, max stages reached)
- 409: Duplicate name OR multiple initial stages

**Validation Rules** (enforced by backend):
- Maximum 20 stages per company
- Nome must be unique per company
- Only 1 stage with `isInicial=true`
- If `cobraCreditos=true`, `custocentavos` is required
- `cor` must be valid hex format `#RRGGBB`

---

### 1.4 Update Stage

**Function**: `updateCampaignStage`

```typescript
/**
 * Update an existing campaign lead stage
 * @param stageId - UUID of the stage
 * @param data - Stage update data
 * @returns Promise<CampaignLeadStage>
 */
export async function updateCampaignStage(
  stageId: string,
  data: UpdateStageRequest
): Promise<CampaignLeadStage> {
  try {
    const response = await apiClient.request<{
      success: boolean
      data: CampaignLeadStage
    }>(`${STAGES_ENDPOINT}/${stageId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })

    return response.data
  } catch (error) {
    console.error('Error updating campaign stage:', error)

    if (error instanceof Error && error.message.includes('400')) {
      throw new Error('Não é permitido alterar categoria ou isInicial após criação')
    }
    if (error instanceof Error && error.message.includes('409')) {
      throw new Error('Nome duplicado')
    }

    throw new Error('Falha ao atualizar estágio')
  }
}
```

**API Endpoint**: `PUT /api/v1/campaign-lead-stages/{stageId}`

**Request Body**: `UpdateStageRequest`

**Response**: `{ success: boolean, data: CampaignLeadStage }`

**Error Codes**:
- 400: Attempt to change `categoria` or `isInicial` (not allowed)
- 404: Stage not found
- 409: Duplicate name

**Restrictions**:
- ❌ Cannot change `categoria` after creation
- ❌ Cannot change `isInicial` after creation
- ✅ Can change `nome`, `cor`, `icone`, `custocentavos`

---

### 1.5 Delete Stage (Soft Delete)

**Function**: `deleteCampaignStage`

```typescript
/**
 * Delete (soft delete) a campaign lead stage
 * @param stageId - UUID of the stage
 * @returns Promise<void>
 */
export async function deleteCampaignStage(stageId: string): Promise<void> {
  try {
    await apiClient.request<{
      success: boolean
      message: string
    }>(`${STAGES_ENDPOINT}/${stageId}`, {
      method: 'DELETE'
    })
  } catch (error) {
    console.error('Error deleting campaign stage:', error)

    if (error instanceof Error && error.message.includes('409')) {
      throw new Error('Não é possível deletar estágio com leads ativos')
    }

    throw new Error('Falha ao deletar estágio')
  }
}
```

**API Endpoint**: `DELETE /api/v1/campaign-lead-stages/{stageId}`

**Response**: `{ success: boolean, message: string }`

**Error Codes**:
- 404: Stage not found
- 409: Stage has active leads (cannot delete)

**Note**: Soft delete sets `isAtivo = false`, does not remove from database.

---

### 1.6 Reorder Stages

**Function**: `reorderCampaignStages`

```typescript
/**
 * Reorder campaign lead stages (for drag-and-drop)
 * @param stages - Array of stage IDs with new order positions
 * @returns Promise<void>
 */
export async function reorderCampaignStages(stages: Array<{ id: string; ordem: number }>): Promise<void> {
  try {
    await apiClient.request<{
      success: boolean
      message: string
    }>(`${STAGES_ENDPOINT}/reorder`, {
      method: 'POST',
      body: JSON.stringify({ stages })
    })
  } catch (error) {
    console.error('Error reordering campaign stages:', error)
    throw new Error('Falha ao reordenar estágios')
  }
}
```

**API Endpoint**: `POST /api/v1/campaign-lead-stages/reorder`

**Request Body**: `{ stages: Array<{ id: string, ordem: number }> }`

**Response**: `{ success: boolean, message: string }`

**Usage**: Called after drag-and-drop completes to persist new order.

---

## 2. Lead Transition Services (US2)

### 2.1 Transition Single Lead

**Function**: `transitionLeadStage`

```typescript
/**
 * Move a single lead to a new stage
 * @param campaignId - UUID of the campaign
 * @param contactId - UUID of the lead/contact
 * @param data - Transition data (stageId, motivo, automatico)
 * @returns Promise<TransitionLeadResponse>
 */
export async function transitionLeadStage(
  campaignId: string,
  contactId: string,
  data: TransitionLeadRequest
): Promise<TransitionLeadResponse> {
  try {
    const response = await apiClient.request<TransitionLeadResponse>(
      `/api/v1/campaigns/${campaignId}/contacts/${contactId}/stage`,
      {
        method: 'PATCH',
        body: JSON.stringify(data)
      }
    )

    return response
  } catch (error) {
    console.error('Error transitioning lead stage:', error)
    throw new Error('Falha ao mover lead para novo estágio')
  }
}
```

**API Endpoint**: `PATCH /api/v1/campaigns/{campaignId}/contacts/{contactId}/stage`

**Request Body**: `TransitionLeadRequest`

**Response**: `TransitionLeadResponse`

```typescript
{
  success: true,
  data: {
    contactId: string
    previousStageId: string | null
    currentStageId: string
    stageChangedAt: string      // ISO 8601
    stageChangedBy: string | null
    duracaoHoras: number | null
  },
  warnings?: [{
    type: 'charge_failed',
    message: 'Cobrança de R$ 5,00 falhou: Saldo insuficiente. Saldo atual: -R$ 4,00'
  }]
}
```

**Important Behavior**:
- ✅ Transition ALWAYS succeeds (even if charge fails)
- ✅ Creates record in `campaign_contact_stage_history`
- ✅ Updates `campaign_contacts.current_stage_id`
- ✅ Calculates `duracaoHoras` automatically
- ✅ If stage charges credits, attempts to charge (non-blocking)
- ✅ Allows negative credit balance

**Error Codes**:
- 404: Campaign or contact not found
- 400: Stage doesn't belong to company

---

### 2.2 Bulk Stage Update

**Function**: `bulkUpdateLeadStages`

```typescript
/**
 * Move multiple leads to a new stage at once
 * @param campaignId - UUID of the campaign
 * @param data - Bulk update data (contactIds, stageId, motivo)
 * @returns Promise<BulkStageUpdateResponse>
 */
export async function bulkUpdateLeadStages(
  campaignId: string,
  data: BulkStageUpdateRequest
): Promise<BulkStageUpdateResponse> {
  try {
    const response = await apiClient.request<BulkStageUpdateResponse>(
      `/api/v1/campaigns/${campaignId}/contacts/bulk-stage-update`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    )

    return response
  } catch (error) {
    console.error('Error bulk updating lead stages:', error)
    throw new Error('Falha ao atualizar leads em massa')
  }
}
```

**API Endpoint**: `POST /api/v1/campaigns/{campaignId}/contacts/bulk-stage-update`

**Request Body**: `BulkStageUpdateRequest`

**Response**: `BulkStageUpdateResponse`

```typescript
{
  success: true,
  data: {
    successCount: 48,
    failedCount: 2,
    totalRequested: 50,
    errors: [
      { contactId: 'uuid-x', error: 'Contato não encontrado' },
      { contactId: 'uuid-y', error: 'Estágio não pertence à empresa' }
    ],
    chargeWarnings: [
      { contactId: 'uuid-z', warning: 'Cobrança falhou: Saldo insuficiente' }
    ]
  }
}
```

**Performance**: < 5 seconds for 50 leads (backend uses `Promise.allSettled`)

---

### 2.3 Fetch Lead Stage History

**Function**: `fetchLeadStageHistory`

```typescript
/**
 * Fetch the complete stage transition history for a lead
 * @param campaignId - UUID of the campaign
 * @param contactId - UUID of the lead/contact
 * @returns Promise<CampaignContactStageHistory[]>
 */
export async function fetchLeadStageHistory(
  campaignId: string,
  contactId: string
): Promise<CampaignContactStageHistory[]> {
  try {
    const response = await apiClient.request<{
      success: boolean
      data: CampaignContactStageHistory[]
      total: number
    }>(
      `/api/v1/campaigns/${campaignId}/contacts/${contactId}/stage-history`,
      {
        method: 'GET'
      }
    )

    return response.data
  } catch (error) {
    console.error('Error fetching lead stage history:', error)
    throw new Error('Falha ao buscar histórico de estágios')
  }
}
```

**API Endpoint**: `GET /api/v1/campaigns/{campaignId}/contacts/{contactId}/stage-history`

**Response**: `{ success: boolean, data: CampaignContactStageHistory[], total: number }`

**Data Characteristics**:
- Ordered by `createdAt DESC` (most recent first)
- `fromStageId = null` on initial transition (lead creation)
- `automatico = true` for automated transitions
- `duracaoHoras` auto-calculated based on time between transitions
- Includes denormalized `fromStageName`, `toStageName`, `userName`

---

## 3. Metrics & Analytics Services (US3, US4)

### 3.1 Fetch Funnel Metrics

**Function**: `fetchCampaignFunnelMetrics`

```typescript
/**
 * Fetch funnel metrics for a campaign (lead counts, conversion rates, durations)
 * @param campaignId - UUID of the campaign
 * @returns Promise<FunnelMetrics>
 */
export async function fetchCampaignFunnelMetrics(campaignId: string): Promise<FunnelMetrics> {
  try {
    const response = await apiClient.request<{
      success: boolean
      data: FunnelMetrics
    }>(
      `/api/v1/campaigns/${campaignId}/funnel`,
      {
        method: 'GET'
      }
    )

    return response.data
  } catch (error) {
    console.error('Error fetching campaign funnel metrics:', error)
    throw new Error('Falha ao buscar métricas do funil')
  }
}
```

**API Endpoint**: `GET /api/v1/campaigns/{campaignId}/funnel`

**Response**: `{ success: boolean, data: FunnelMetrics }`

**FunnelMetrics Structure**:
```typescript
{
  campaignId: string
  totalLeads: 100
  stages: [
    {
      stageId: 'uuid',
      stageName: 'Novo Lead',
      categoria: 'novo',
      cor: '#3B82F6',
      ordem: 0,
      leadCount: 30,
      percentageOfTotal: 30.0,
      conversionFromPrevious: null,      // null for first stage
      averageDurationHours: null
    },
    {
      stageId: 'uuid',
      stageName: 'Contato Inicial',
      categoria: 'contato',
      cor: '#8B5CF6',
      ordem: 1,
      leadCount: 20,
      percentageOfTotal: 20.0,
      conversionFromPrevious: 66.67,     // 20/30 = 66.67%
      averageDurationHours: 24.5
    }
    // ... more stages
  ],
  generatedAt: '2025-10-08T17:00:00.000Z'
}
```

**Performance Goal**: < 3 seconds for campaigns with 1000 leads

---

### 3.2 List Campaign Charges

**Function**: `fetchCampaignCharges`

```typescript
/**
 * Fetch charge records for a campaign
 * @param campaignId - UUID of the campaign
 * @param filters - Optional filters (date range, stage, status)
 * @returns Promise<CampaignStageCharge[]>
 */
export async function fetchCampaignCharges(
  campaignId: string,
  filters?: ChargeFilters
): Promise<CampaignStageCharge[]> {
  try {
    const queryParams = new URLSearchParams()

    if (filters?.startDate) queryParams.append('startDate', filters.startDate)
    if (filters?.endDate) queryParams.append('endDate', filters.endDate)
    if (filters?.stageId) queryParams.append('stageId', filters.stageId)
    if (filters?.foiCobrado !== undefined) {
      queryParams.append('foiCobrado', filters.foiCobrado.toString())
    }

    const query = queryParams.toString() ? `?${queryParams}` : ''
    const response = await apiClient.request<{
      success: boolean
      data: CampaignStageCharge[]
      total: number
    }>(
      `/api/v1/campaigns/${campaignId}/charges${query}`,
      {
        method: 'GET'
      }
    )

    return response.data
  } catch (error) {
    console.error('Error fetching campaign charges:', error)
    throw new Error('Falha ao buscar cobranças da campanha')
  }
}
```

**API Endpoint**: `GET /api/v1/campaigns/{campaignId}/charges`

**Query Parameters**:
- `startDate` (ISO date, optional): Filter by date range start
- `endDate` (ISO date, optional): Filter by date range end
- `stageId` (UUID, optional): Filter by specific stage
- `foiCobrado` (boolean, optional): Filter by success/failure status

**Response**: `{ success: boolean, data: CampaignStageCharge[], total: number }`

---

### 3.3 Fetch Charges Summary

**Function**: `fetchCampaignChargesSummary`

```typescript
/**
 * Fetch aggregated charges summary for a campaign
 * @param campaignId - UUID of the campaign
 * @returns Promise<ChargesSummary>
 */
export async function fetchCampaignChargesSummary(campaignId: string): Promise<ChargesSummary> {
  try {
    const response = await apiClient.request<{
      success: boolean
      data: ChargesSummary
    }>(
      `/api/v1/campaigns/${campaignId}/charges/summary`,
      {
        method: 'GET'
      }
    )

    return response.data
  } catch (error) {
    console.error('Error fetching campaign charges summary:', error)
    throw new Error('Falha ao buscar resumo de cobranças')
  }
}
```

**API Endpoint**: `GET /api/v1/campaigns/{campaignId}/charges/summary`

**Response**: `{ success: boolean, data: ChargesSummary }`

**ChargesSummary Structure**:
```typescript
{
  campanhaId: 'uuid',
  totalCharges: 150,
  successfulCharges: 145,
  failedCharges: 5,
  totalAmountCentavos: 75000,
  totalAmountReais: 750.00,
  chargesByStage: [
    {
      stageId: 'uuid',
      stageName: 'Qualificação',
      chargeCount: 80,
      totalCentavos: 40000,
      totalReais: 400.00
    }
    // ... more stages
  ],
  generatedAt: '2025-10-08T18:00:00.000Z'
}
```

---

## 4. Billing Configuration Services (US5)

### 4.1 Fetch Billing Configuration

**Function**: `fetchBillingConfiguration`

```typescript
/**
 * Fetch company billing configuration
 * @returns Promise<BillingConfiguration>
 */
export async function fetchBillingConfiguration(): Promise<BillingConfiguration> {
  try {
    const response = await apiClient.request<{
      success: boolean
      data: BillingConfiguration
    }>(
      '/api/v1/empresa/configuracoes/cobranca',
      {
        method: 'GET'
      }
    )

    return response.data
  } catch (error) {
    console.error('Error fetching billing configuration:', error)
    throw new Error('Falha ao buscar configurações de cobrança')
  }
}
```

**API Endpoint**: `GET /api/v1/empresa/configuracoes/cobranca`

**Response**: `{ success: boolean, data: BillingConfiguration }`

---

### 4.2 Update Billing Configuration

**Function**: `updateBillingConfiguration`

```typescript
/**
 * Update company billing configuration
 * @param data - Billing configuration updates
 * @returns Promise<BillingConfiguration>
 */
export async function updateBillingConfiguration(
  data: UpdateBillingConfigRequest
): Promise<BillingConfiguration> {
  try {
    const response = await apiClient.request<{
      success: boolean
      data: BillingConfiguration
    }>(
      '/api/v1/empresa/configuracoes/cobranca',
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    )

    return response.data
  } catch (error) {
    console.error('Error updating billing configuration:', error)
    throw new Error('Falha ao atualizar configurações de cobrança')
  }
}
```

**API Endpoint**: `PUT /api/v1/empresa/configuracoes/cobranca`

**Request Body**: `UpdateBillingConfigRequest`

**Response**: `{ success: boolean, data: BillingConfiguration }`

---

## Error Handling Strategy

### Standard Error Flow

```typescript
// All service functions follow this pattern:
try {
  const response = await apiClient.request(...)
  return response.data
} catch (error) {
  console.error('Error [operation]:', error)

  // Optional: Check for specific error codes
  if (error instanceof Error && error.message.includes('409')) {
    throw new Error('User-friendly specific error message')
  }

  // Generic fallback
  throw new Error('User-friendly generic error message')
}
```

### ApiClient Automatic Handling

The `apiClient` automatically handles:
- ✅ 401 Unauthorized → Attempts token refresh → Retries request
- ✅ Network errors → User-friendly connectivity message
- ✅ JSON parsing errors
- ✅ Request queueing during token refresh

### Service-Specific Error Messages

Each service function should provide Portuguese error messages:

```typescript
const ERROR_MESSAGES = {
  FETCH_STAGES_FAILED: 'Falha ao buscar estágios da campanha',
  CREATE_STAGE_FAILED: 'Falha ao criar estágio',
  UPDATE_STAGE_FAILED: 'Falha ao atualizar estágio',
  DELETE_STAGE_FAILED: 'Falha ao deletar estágio',
  REORDER_STAGES_FAILED: 'Falha ao reordenar estágios',
  TRANSITION_LEAD_FAILED: 'Falha ao mover lead para novo estágio',
  BULK_UPDATE_FAILED: 'Falha ao atualizar leads em massa',
  FETCH_HISTORY_FAILED: 'Falha ao buscar histórico de estágios',
  FETCH_METRICS_FAILED: 'Falha ao buscar métricas do funil',
  FETCH_CHARGES_FAILED: 'Falha ao buscar cobranças da campanha',
  FETCH_BILLING_CONFIG_FAILED: 'Falha ao buscar configurações de cobrança',
  UPDATE_BILLING_CONFIG_FAILED: 'Falha ao atualizar configurações de cobrança',

  // Specific business errors
  DUPLICATE_NAME: 'Nome duplicado ou múltiplos estágios iniciais',
  INVALID_DATA: 'Dados inválidos. Verifique os campos obrigatórios.',
  STAGE_HAS_LEADS: 'Não é possível deletar estágio com leads ativos',
  CANNOT_CHANGE_CATEGORIA: 'Não é permitido alterar categoria ou isInicial após criação'
} as const
```

---

## Testing Contracts

### Unit Tests for Services

Each service function should have corresponding tests:

```typescript
// Example test for fetchCampaignStages
describe('fetchCampaignStages', () => {
  it('should fetch stages successfully', async () => {
    const mockStages = [/* mock data */]
    vi.spyOn(apiClient, 'request').mockResolvedValue({
      success: true,
      data: mockStages,
      total: mockStages.length
    })

    const result = await fetchCampaignStages()

    expect(result).toEqual(mockStages)
    expect(apiClient.request).toHaveBeenCalledWith(
      '/api/v1/campaign-lead-stages',
      { method: 'GET' }
    )
  })

  it('should handle fetch error', async () => {
    vi.spyOn(apiClient, 'request').mockRejectedValue(new Error('Network error'))

    await expect(fetchCampaignStages()).rejects.toThrow('Falha ao buscar estágios da campanha')
  })
})
```

### Contract Tests with MSW

Mock API responses for integration testing:

```typescript
// src/test/mocks/handlers/stages.ts
import { http, HttpResponse } from 'msw'

export const stagesHandlers = [
  http.get('/api/v1/campaign-lead-stages', () => {
    return HttpResponse.json({
      success: true,
      data: [/* mock stages */],
      total: 5
    })
  }),

  http.post('/api/v1/campaign-lead-stages', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      success: true,
      data: { id: 'new-uuid', ...body }
    }, { status: 201 })
  }),

  // ... more handlers
]
```

---

## Performance Considerations

### React Query Cache Configuration

Recommended cache settings per endpoint:

```typescript
export const QUERY_KEYS = {
  stages: {
    all: ['campaign-stages'] as const,
    list: (filters?: any) => ['campaign-stages', 'list', filters] as const,
    detail: (id: string) => ['campaign-stages', 'detail', id] as const
  },
  history: {
    lead: (campaignId: string, contactId: string) =>
      ['campaign-stages', 'history', campaignId, contactId] as const
  },
  metrics: {
    funnel: (campaignId: string) =>
      ['campaign-stages', 'metrics', campaignId] as const
  },
  charges: {
    list: (campaignId: string, filters?: ChargeFilters) =>
      ['campaign-stages', 'charges', campaignId, filters] as const,
    summary: (campaignId: string) =>
      ['campaign-stages', 'charges', 'summary', campaignId] as const
  }
} as const

export const CACHE_TIMES = {
  stages: {
    staleTime: 5 * 60 * 1000,      // 5 minutes
    cacheTime: 10 * 60 * 1000      // 10 minutes
  },
  metrics: {
    staleTime: 30 * 1000,           // 30 seconds
    cacheTime: 2 * 60 * 1000        // 2 minutes
  },
  history: {
    staleTime: 60 * 1000,           // 1 minute
    cacheTime: 5 * 60 * 1000        // 5 minutes
  },
  charges: {
    staleTime: 2 * 60 * 1000,       // 2 minutes
    cacheTime: 5 * 60 * 1000        // 5 minutes
  }
} as const
```

---

**Contracts Version**: 1.0
**Last Updated**: 2025-10-09
**Status**: Complete
