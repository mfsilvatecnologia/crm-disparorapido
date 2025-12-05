# Research: Campaign Lead Stages Management Frontend

**Feature**: Campaign Lead Stages Management Frontend
**Branch**: `006-doc-frontend-campaign`
**Date**: 2025-10-09

## Executive Summary

This feature implements a comprehensive frontend for managing lead stages in campaigns, creating a CRM-like pipeline system (similar to Pipedrive/HubSpot). The backend API is already 100% implemented with all necessary endpoints, data models, and business logic. The frontend implementation will integrate with existing backend services to provide a complete user experience for stage configuration, lead movement tracking, funnel metrics, and credit charging management.

## Technology Stack Analysis

### Current Frontend Stack
- **Framework**: React 18.3.1 with TypeScript 5.8.3
- **Build Tool**: Vite 5.4.19
- **State Management**: @tanstack/react-query 5.89
- **UI Components**: Radix UI primitives + custom components
- **Styling**: Tailwind CSS 3.4.17
- **Forms**: react-hook-form 7.62 + zod 3.25
- **Drag & Drop**: @dnd-kit/* (core 6.3.1, sortable 10.0.0, utilities 3.2.2)
- **HTTP Client**: Custom ApiClient with Axios 1.11
- **Testing**: Vitest 3.2.4, @testing-library/react 16.3.0, MSW 2.11.3
- **Icons**: lucide-react 0.462.0
- **Charts**: recharts 2.15.4
- **Notifications**: react-hot-toast 2.6 + sonner 1.7.4

### Backend API Status
- **Status**: ✅ 100% Complete
- **Base URL**: `http://localhost:3000/api/v1` (dev) / `https://api.leadsrapido.com/api/v1` (prod)
- **Authentication**: Bearer JWT tokens
- **Multi-tenancy**: Row Level Security (RLS) via empresaId in JWT

## Existing Code Patterns

### Project Structure
```
src/
├── features/                # Feature-based organization
│   ├── campaigns/          # Existing campaign features
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks (useCampaigns)
│   │   ├── services/       # API service layer
│   │   ├── types/          # TypeScript interfaces
│   │   └── pages/          # Page components
│   ├── leads/              # Existing lead management
│   ├── pipeline/           # Existing pipeline (may need refactor)
│   └── [other features]/
├── shared/
│   └── services/
│       └── client.ts       # Centralized ApiClient
└── lib/                    # Utility functions
```

### API Client Pattern (Established)
The codebase uses a centralized `ApiClient` class in `src/shared/services/client.ts`:

```typescript
// Standard usage pattern
export const apiClient = new ApiClient();

// Request method signature
async request<T>(
  endpoint: string,
  config: RequestInit = {},
  schema?: z.ZodSchema<T>
): Promise<T>

// Helper methods available
apiClient.get<T>(url, schema?)
apiClient.post<T>(url, data, schema?)
apiClient.patch<T>(url, data, schema?)
apiClient.put<T>(url, data, schema?)
apiClient.delete<T>(url, schema?)
```

### Feature Service Pattern (Campaigns Example)
Located in `src/features/campaigns/services/campaigns.ts`:
- Each feature has its own service module
- Services use the centralized `apiClient.request()` method
- TypeScript interfaces defined in separate `types/` directory
- Error handling with try/catch and meaningful error messages

```typescript
// Example from campaigns service
export async function fetchCampaigns(filters: CampaignFilters = {}): Promise<CampaignsResponse> {
  try {
    const response = await apiClient.request<{
      success: boolean;
      data: {
        campanhas: Campaign[]
        total: number
        page: number
        limit: number
        totalPages: number
      }
    }>(CAMPAIGNS_ENDPOINT, {
      method: 'GET',
    })

    // Transform API response to internal format
    return {
      campaigns: response.data?.campanhas || [],
      total: response.data?.total || 0,
      // ... more fields
    }
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    throw new Error('Falha ao buscar campanhas')
  }
}
```

### React Query Pattern (Established)
From `src/features/campaigns/hooks/useCampaigns.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Query hook pattern
export function useCampaigns(filters?: CampaignFilters) {
  return useQuery({
    queryKey: ['campaigns', filters],
    queryFn: () => fetchCampaigns(filters),
    staleTime: 30000
  })
}

// Mutation hook pattern
export function useCreateCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCampaignData) => createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('Campanha criada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao criar campanha')
    }
  })
}
```

### Drag & Drop Pattern
The codebase already includes `@dnd-kit` libraries (version 6.3.1+). Example usage pattern can be seen in pipeline features. For campaign stages:
- Use `@dnd-kit/core` for drag context
- Use `@dnd-kit/sortable` for stage reordering
- Use `@dnd-kit/utilities` for CSS transforms

## Backend API Endpoints (Available)

### Stage Management (US1)
- `POST /api/v1/campaign-lead-stages` - Create stage
- `GET /api/v1/campaign-lead-stages` - List stages (with filters)
- `GET /api/v1/campaign-lead-stages/{stageId}` - Get single stage
- `PUT /api/v1/campaign-lead-stages/{stageId}` - Update stage
- `DELETE /api/v1/campaign-lead-stages/{stageId}` - Soft delete stage
- `POST /api/v1/campaign-lead-stages/reorder` - Reorder stages

### Lead Transitions (US2)
- `PATCH /api/v1/campaigns/{campaignId}/contacts/{contactId}/stage` - Move lead
- `POST /api/v1/campaigns/{campaignId}/contacts/bulk-stage-update` - Bulk update
- `GET /api/v1/campaigns/{campaignId}/contacts/{contactId}/stage-history` - History

### Metrics & Analytics (US3, US4)
- `GET /api/v1/campaigns/{campaignId}/funnel` - Funnel metrics
- `GET /api/v1/campaigns/{campaignId}/charges` - List charges
- `GET /api/v1/campaigns/{campaignId}/charges/summary` - Charge summary

### Billing Configuration (US5)
- `PUT /api/v1/empresa/configuracoes/cobranca` - Configure charging model

## Data Models (Backend Provided)

### CampaignLeadStage
```typescript
interface CampaignLeadStage {
  id: string                    // UUID
  empresaId: string             // UUID
  nome: string                  // Unique per company
  categoria: StageCategory      // enum
  cor: string                   // Hex: #RRGGBB
  icone?: string                // Icon name
  ordem: number                 // 0-indexed
  isInicial: boolean            // Only 1 per company
  isFinal: boolean
  cobraCreditos: boolean
  custocentavos?: number        // Required if cobraCreditos=true
  descricaoCobranca?: string
  isAtivo: boolean
  criadoPor?: string            // UUID
  createdAt: string             // ISO 8601
  updatedAt: string
}

type StageCategory = 'novo' | 'contato' | 'qualificacao' | 'negociacao' | 'ganho' | 'perdido'
```

### CampaignContactStageHistory
```typescript
interface CampaignContactStageHistory {
  id: string
  campaignContactId: string
  fromStageId?: string          // null on first transition
  toStageId: string
  motivo?: string
  automatico: boolean
  duracaoHoras?: number         // Auto-calculated
  criadoPor?: string            // UUID
  createdAt: string
  // Denormalized for UI
  fromStageName?: string
  toStageName: string
  userName?: string
}
```

### CampaignStageCharge
```typescript
interface CampaignStageCharge {
  id: string
  empresaId: string
  campanhaId: string
  campaignContactId: string
  stageId: string
  custocentavos: number
  tipoCobranca: 'mudanca_estagio' | 'acesso_lead' | 'execucao_agente'
  creditoTransacaoId?: string   // null if failed
  motivo?: string
  foiCobrado: boolean           // true=success, false=failed
  erroCobranca?: string
  createdAt: string
}
```

## UI/UX Requirements

### 1. Stage Configuration Page (Priority P1)
**Route**: `/campaigns/stages/config` or `/settings/campaign-stages`

**Components Needed**:
- `StageConfigPage` - Main page wrapper
- `StageBoard` - Grid/list of stage cards
- `StageCard` - Individual stage display with actions
- `StageFormModal` - Create/edit modal with form
- `StageDeleteDialog` - Confirmation dialog
- `ColorPicker` - Hex color selector (could use existing or Radix)
- `IconPicker` - Icon selection from lucide-react

**Key Features**:
- Drag-and-drop reordering (@dnd-kit)
- CRUD operations with form validation (react-hook-form + zod)
- Visual indicators for isInicial, isFinal, cobraCreditos
- Max 20 stages validation
- Unique name validation
- Charge configuration with currency input (centavos to reais)

### 2. Campaign Funnel Board (Priority P1)
**Route**: `/campaigns/{id}/funnel` or integrated in `/campaigns/{id}`

**Components Needed**:
- `CampaignFunnelBoard` - Main Kanban container
- `StageColumn` - Column for each stage
- `LeadCard` - Draggable lead card
- `BulkUpdateModal` - Multi-select actions modal
- `LeadTransitionModal` - Prompt for motivo when dragging

**Key Features**:
- Kanban-style columns per stage (colors from stage.cor)
- Drag-and-drop leads between stages
- Lead count badges on stage headers
- Reason prompt on drop
- Bulk selection (checkbox mode)
- Real-time updates via React Query invalidation
- Charge warning toasts (sonner/toast)

### 3. Lead History Timeline (Priority P1)
**Route**: `/campaigns/{campaignId}/contacts/{contactId}/history` or embedded in lead detail modal

**Components Needed**:
- `LeadStageHistory` - Timeline container
- `TimelineItem` - Individual history entry
- `TimelineMarker` - Visual marker (user icon vs robot icon)

**Key Features**:
- Vertical timeline layout
- fromStageName → toStageName display
- Motivo text
- duracaoHoras formatted (e.g., "2d 4h")
- userName display
- automatico badge
- Sorted by createdAt DESC

### 4. Funnel Metrics Dashboard (Priority P2)
**Route**: `/campaigns/{id}/metrics` or `/campaigns/{id}#metrics`

**Components Needed**:
- `CampaignDashboard` - Dashboard container
- `FunnelChart` - Visual funnel (recharts)
- `StageMetricCard` - KPI card per stage
- `StageMetricsTable` - Tabular view

**Key Features**:
- Visual funnel showing drop-off
- Cards with leadCount, percentageOfTotal, conversionFromPrevious
- Charts showing trends
- averageDurationHours per stage
- Performance goal: < 3s for 1000 leads

### 5. Billing Configuration (Priority P2)
**Route**: `/settings/billing` or `/settings/campaign-charges`

**Components Needed**:
- `BillingConfigPage` - Settings page
- `ChargeConfigForm` - modeloCobrancaCampanha toggle
- `ChargeAuditTable` - List of campaign charges
- `ChargesSummaryCard` - Summary metrics

**Key Features**:
- Toggle debitarMudancaEstagio
- View charge history with filters
- View charge summary per campaign
- Display foiCobrado status
- Error messages (erroCobranca)

## Integration Points

### Existing Campaign Types
Current `Campaign` interface in `src/features/campaigns/types/campaigns.ts` needs extension:

```typescript
// Existing interface needs these additions
interface Campaign {
  // ... existing fields ...

  // NEW: Stage-related fields
  currentStages?: CampaignLeadStage[]  // Cache of active stages
  defaultStageId?: string               // Initial stage for new leads
}

interface CampaignContact {
  // ... existing fields ...

  // NEW: Stage tracking
  currentStageId?: string               // Current lead stage
  stageChangedAt?: string               // Last stage change timestamp
  stageChangedBy?: string               // User who changed stage
}
```

### Existing Pipeline Feature
Located in `src/features/pipeline/`, this may overlap with the new stage system. Options:
1. **Refactor**: Replace generic pipeline with campaign-specific stages
2. **Coexist**: Keep both (pipeline for deals, stages for campaign leads)
3. **Deprecate**: Phase out old pipeline if it's not being used

**Recommendation**: Investigate current pipeline usage. If actively used, maintain both systems with clear separation. If not, refactor to use the new campaign stages system.

## Performance Considerations

### React Query Caching Strategy
```typescript
// Recommended cache times
const CACHE_CONFIG = {
  stages: {
    staleTime: 5 * 60 * 1000,      // 5 minutes (rarely changes)
    cacheTime: 10 * 60 * 1000       // 10 minutes
  },
  funnelMetrics: {
    staleTime: 30 * 1000,           // 30 seconds (updates frequently)
    cacheTime: 2 * 60 * 1000        // 2 minutes
  },
  stageHistory: {
    staleTime: 60 * 1000,           // 1 minute
    cacheTime: 5 * 60 * 1000        // 5 minutes
  },
  charges: {
    staleTime: 2 * 60 * 1000,       // 2 minutes
    cacheTime: 5 * 60 * 1000        // 5 minutes
  }
}
```

### Optimistic Updates
For drag-and-drop lead transitions:
```typescript
// Update UI immediately, rollback on error
useMutation({
  mutationFn: updateLeadStage,
  onMutate: async (newData) => {
    await queryClient.cancelQueries(['campaign', campaignId, 'leads'])
    const previousData = queryClient.getQueryData(['campaign', campaignId, 'leads'])

    queryClient.setQueryData(['campaign', campaignId, 'leads'], (old) => ({
      ...old,
      leads: old.leads.map(lead =>
        lead.id === newData.leadId
          ? { ...lead, currentStageId: newData.stageId }
          : lead
      )
    }))

    return { previousData }
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(['campaign', campaignId, 'leads'], context.previousData)
  },
  onSettled: () => {
    queryClient.invalidateQueries(['campaign', campaignId, 'leads'])
  }
})
```

### Virtualization
For large lists (100+ leads per stage), consider:
- `react-virtual` or `@tanstack/react-virtual` for virtual scrolling
- Lazy loading lead cards as user scrolls

## Testing Strategy

### Unit Tests (Vitest)
- Service layer functions (API calls, data transformation)
- Custom hooks (useCampaignStages, useStageTransitions)
- Utility functions (formatDuration, validateStageData)
- Form validation schemas (Zod)

### Component Tests (@testing-library/react)
- StageCard rendering and interactions
- StageFormModal form submission
- LeadCard drag interactions (mock @dnd-kit)
- Timeline rendering with history data

### Integration Tests
- Full stage CRUD flow
- Drag-and-drop lead between stages
- Bulk update workflow
- Charge warning display

### Contract Tests
- Verify API response shapes match TypeScript interfaces
- Test error responses (400, 409, 404)

## Risks & Mitigation

### Risk 1: Pipeline Feature Overlap
**Impact**: High - Confusion between old pipeline and new stages
**Mitigation**:
- Audit current pipeline usage
- Document clear distinction
- Provide migration path if needed

### Risk 2: Drag-and-Drop Performance
**Impact**: Medium - Lag with many leads
**Mitigation**:
- Implement virtualization for > 50 leads per stage
- Use requestAnimationFrame for smooth animations
- Debounce API calls during drag

### Risk 3: Credit Charge Failures
**Impact**: High - User confusion when charge fails but transition succeeds
**Mitigation**:
- Prominent warning UI (toast + persistent banner)
- Clear messaging explaining non-blocking behavior
- Link to billing/credits page

### Risk 4: Multi-tenancy Leaks
**Impact**: Critical - Data leaking between companies
**Mitigation**:
- Backend RLS already implemented
- Frontend validates empresaId in responses
- Never cache data across different empresaId contexts

## Dependencies Analysis

### New Dependencies Needed
**None** - All required libraries already installed:
- ✅ @dnd-kit/* for drag-and-drop
- ✅ @tanstack/react-query for state management
- ✅ react-hook-form + zod for forms
- ✅ recharts for funnel visualization
- ✅ lucide-react for icons
- ✅ sonner/toast for notifications

### Peer Dependencies
All satisfied by current versions.

## Security Considerations

1. **Authentication**: All requests use Bearer token from ApiClient
2. **Authorization**: Backend enforces RLS per empresaId
3. **Input Validation**:
   - Frontend: Zod schemas for form validation
   - Backend: Already validated (per spec)
4. **XSS Prevention**: React escapes by default, sanitize any HTML in motivo/descriptions
5. **CSRF**: Not applicable (JWT-based API)

## Accessibility Requirements

1. **Keyboard Navigation**:
   - Tab through stage cards
   - Arrow keys to navigate Kanban columns
   - Space/Enter to activate drag (keyboard DnD)
2. **Screen Readers**:
   - ARIA labels on interactive elements
   - Announce stage transitions (live region)
   - Semantic HTML (header, main, section)
3. **Color Contrast**:
   - Stage colors must meet WCAG AA (4.5:1)
   - Provide color picker presets with high contrast
4. **Focus Management**:
   - Return focus after modal close
   - Focus trap in modals
   - Visible focus indicators

## Internationalization (i18n)

**Current Status**: Codebase appears to be Portuguese (pt-BR)

**Strings to Externalize**:
- Stage categories: novo, contato, qualificação, negociação, ganho, perdido
- UI labels: buttons, form fields, error messages
- Validation messages
- Toast notifications

**Recommendation**: If i18n not yet implemented, hardcode pt-BR strings for now. Add i18n in future iteration.

## Deployment Considerations

1. **Feature Flags**: None required (full feature release)
2. **Database Migrations**: Already applied on backend
3. **Environment Variables**: Use existing `VITE_API_BASE_URL`
4. **Rollback Plan**: Backend supports existing campaigns without stages (backward compatible)

## Open Questions

1. **Pipeline Coexistence**: Should we keep old pipeline or migrate? (Requires product decision)
2. **Default Stages**: Should system auto-create default stages for new companies? (Spec mentions this in edge cases)
3. **Stage Limits**: 20 stages enforced - do we show warning at 15? 18?
4. **Bulk Update**: Max leads per bulk operation? (Backend might have limits)
5. **Charge Display**: Show charges in lead card? In stage header?

## Next Steps (Phase 1)

After this research, proceed to:
1. **Data Model Design** - TypeScript interfaces for all entities
2. **API Contracts** - Detailed service function signatures
3. **Quickstart Guide** - Developer onboarding document

---

**Research Complete**: 2025-10-09
**Confidence Level**: High (Backend 100% complete, tech stack familiar, patterns established)
