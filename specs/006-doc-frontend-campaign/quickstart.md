# Quickstart Guide: Campaign Lead Stages Feature

**Feature**: Campaign Lead Stages Management Frontend
**Branch**: `006-doc-frontend-campaign`
**Date**: 2025-10-09

## Overview

This quickstart guide helps developers implement the Campaign Lead Stages feature. The feature provides a CRM-like pipeline system for managing leads through customizable stages, tracking transitions, displaying funnel metrics, and handling credit charging.

**Prerequisites**:
- Backend API is 100% complete and deployed
- Familiarity with React 18, TypeScript, and React Query
- Understanding of the existing codebase patterns

**Estimated Implementation Time**: 3-4 sprints (6-8 weeks)

---

## Quick Setup (15 minutes)

### 1. Create Feature Directory Structure

```bash
mkdir -p src/features/campaign-stages/{components,hooks,services,types,schemas,utils,pages}
mkdir -p src/features/campaign-stages/components/{stage-config,funnel-board,history,metrics,billing}
```

### 2. Copy Type Definitions

Create the base types file from the data model specification:

```bash
# Location: src/features/campaign-stages/types/index.ts
```

Copy the interfaces from `specs/006-doc-frontend-campaign/data-model.md` sections:
- Core Domain Models
- Validation Schemas
- API Response Wrappers
- Constants

### 3. Create API Service Layer

```bash
# Location: src/features/campaign-stages/services/stages.ts
```

Copy service functions from `specs/006-doc-frontend-campaign/contracts/api-services.md`

### 4. Set Up React Query Hooks

```typescript
// Location: src/features/campaign-stages/hooks/useStages.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  fetchCampaignStages,
  createCampaignStage,
  updateCampaignStage,
  deleteCampaignStage,
  reorderCampaignStages
} from '../services/stages'
import { QUERY_KEYS, CACHE_TIMES } from '../constants/query-config'

// Query hook for fetching stages
export function useCampaignStages(filters?: { includeInactive?: boolean; categoria?: string }) {
  return useQuery({
    queryKey: QUERY_KEYS.stages.list(filters),
    queryFn: () => fetchCampaignStages(filters),
    staleTime: CACHE_TIMES.stages.staleTime,
    cacheTime: CACHE_TIMES.stages.cacheTime
  })
}

// Mutation hook for creating a stage
export function useCreateCampaignStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCampaignStage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stages.all })
      toast.success('Estágio criado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

// ... more mutation hooks
```

---

## Development Workflow

### Phase 1: Stage Configuration (Priority P1) - Week 1-2

**Goal**: Implement CRUD operations for stages with drag-and-drop reordering.

#### Step 1.1: Create Stage Card Component

```typescript
// Location: src/features/campaign-stages/components/stage-config/StageCard.tsx

import { CampaignLeadStage } from '../../types'
import { DEFAULT_STAGE_ICONS } from '../../constants'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import * as Icons from 'lucide-react'

interface StageCardProps {
  stage: CampaignLeadStage
  onEdit: (stage: CampaignLeadStage) => void
  onDelete: (stageId: string) => void
  isDragging?: boolean
}

export function StageCard({ stage, onEdit, onDelete, isDragging }: StageCardProps) {
  const Icon = Icons[stage.icone as keyof typeof Icons] || Icons.Circle

  return (
    <div
      className={`border rounded-lg p-4 ${isDragging ? 'opacity-50' : ''}`}
      style={{ borderLeft: `4px solid ${stage.cor}` }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" style={{ color: stage.cor }} />
          <h3 className="font-semibold">{stage.nome}</h3>
        </div>
        <div className="flex gap-1">
          {stage.isInicial && <Badge variant="default">Inicial</Badge>}
          {stage.isFinal && <Badge variant="secondary">Final</Badge>}
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-2">
        Categoria: {stage.categoria}
      </p>

      {stage.cobraCreditos && (
        <div className="flex items-center gap-2 text-sm mb-3">
          <Icons.DollarSign className="w-4 h-4" />
          <span>R$ {((stage.custocentavos || 0) / 100).toFixed(2)}</span>
        </div>
      )}

      <div className="flex gap-2">
        <Button size="sm" onClick={() => onEdit(stage)}>
          Editar
        </Button>
        <Button size="sm" variant="destructive" onClick={() => onDelete(stage.id)}>
          Excluir
        </Button>
      </div>
    </div>
  )
}
```

#### Step 1.2: Create Stage Form Modal

```typescript
// Location: src/features/campaign-stages/components/stage-config/StageFormModal.tsx

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateStageSchema } from '../../schemas'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Button } from '@/shared/components/ui/button'
import { STAGE_CATEGORY_LABELS, DEFAULT_STAGE_COLORS } from '../../constants'

interface StageFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  initialData?: CampaignLeadStage
}

export function StageFormModal({ isOpen, onClose, onSubmit, initialData }: StageFormModalProps) {
  const form = useForm({
    resolver: zodResolver(CreateStageSchema),
    defaultValues: initialData || {
      nome: '',
      categoria: 'novo',
      cor: '#3B82F6',
      icone: 'inbox',
      cobraCreditos: false,
      custocentavos: 0
    }
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar Estágio' : 'Novo Estágio'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Estágio</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Qualificação Avançada" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(STAGE_CATEGORY_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Add color picker, icon picker, charge toggle, etc. */}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {initialData ? 'Atualizar' : 'Criar'} Estágio
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

#### Step 1.3: Implement Drag-and-Drop with @dnd-kit

```typescript
// Location: src/features/campaign-stages/components/stage-config/StageBoard.tsx

import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CampaignLeadStage } from '../../types'
import { StageCard } from './StageCard'
import { useReorderStages } from '../../hooks/useStages'

function SortableStageCard({ stage, onEdit, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: stage.id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <StageCard
        stage={stage}
        onEdit={onEdit}
        onDelete={onDelete}
        isDragging={isDragging}
      />
    </div>
  )
}

export function StageBoard({ stages, onEdit, onDelete }: any) {
  const [items, setItems] = useState(stages)
  const { mutate: reorderStages } = useReorderStages()

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (active.id !== over?.id) {
      setItems((items: CampaignLeadStage[]) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over!.id)

        const reorderedItems = arrayMove(items, oldIndex, newIndex)

        // Update ordem values
        const updates = reorderedItems.map((item, index) => ({
          id: item.id,
          ordem: index
        }))

        // Call API to persist new order
        reorderStages(updates)

        return reorderedItems
      })
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((stage) => (
            <SortableStageCard
              key={stage.id}
              stage={stage}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
```

#### Step 1.4: Create Stage Configuration Page

```typescript
// Location: src/features/campaign-stages/pages/StageConfigPage.tsx

import { useState } from 'react'
import { useCampaignStages, useCreateCampaignStage, useUpdateCampaignStage, useDeleteCampaignStage } from '../hooks/useStages'
import { StageBoard } from '../components/stage-config/StageBoard'
import { StageFormModal } from '../components/stage-config/StageFormModal'
import { Button } from '@/shared/components/ui/button'
import { Loader2 } from 'lucide-react'

export function StageConfigPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStage, setEditingStage] = useState<CampaignLeadStage | undefined>()

  const { data: stages, isLoading } = useCampaignStages()
  const { mutate: createStage } = useCreateCampaignStage()
  const { mutate: updateStage } = useUpdateCampaignStage()
  const { mutate: deleteStage } = useDeleteCampaignStage()

  const handleSubmit = (data: any) => {
    if (editingStage) {
      updateStage({ stageId: editingStage.id, data })
    } else {
      createStage(data)
    }
    setIsModalOpen(false)
    setEditingStage(undefined)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Configurar Estágios de Campanha</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          Criar Novo Estágio
        </Button>
      </div>

      <StageBoard
        stages={stages || []}
        onEdit={(stage) => {
          setEditingStage(stage)
          setIsModalOpen(true)
        }}
        onDelete={(id) => deleteStage(id)}
      />

      <StageFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingStage(undefined)
        }}
        onSubmit={handleSubmit}
        initialData={editingStage}
      />
    </div>
  )
}
```

---

### Phase 2: Funnel Board with Drag-and-Drop (Priority P1) - Week 3-4

**Goal**: Implement Kanban-style board for moving leads between stages.

#### Step 2.1: Create Lead Card Component

```typescript
// Location: src/features/campaign-stages/components/funnel-board/LeadCard.tsx

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { LeadCardData } from '../../types'
import * as Icons from 'lucide-react'

export function LeadCard({ lead }: { lead: LeadCardData }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
    data: { type: 'lead', lead }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white border rounded-lg p-3 cursor-move hover:shadow-md transition-shadow"
    >
      <h4 className="font-semibold text-sm">{lead.nome}</h4>
      {lead.empresa && <p className="text-xs text-muted-foreground">{lead.empresa}</p>}
      {lead.email && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <Icons.Mail className="w-3 h-3" />
          {lead.email}
        </div>
      )}
      {lead.score && (
        <div className="mt-2">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Score: {lead.score}
          </span>
        </div>
      )}
    </div>
  )
}
```

#### Step 2.2: Create Stage Column Component

```typescript
// Location: src/features/campaign-stages/components/funnel-board/StageColumn.tsx

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CampaignLeadStage, LeadCardData } from '../../types'
import { LeadCard } from './LeadCard'
import { Badge } from '@/shared/components/ui/badge'
import * as Icons from 'lucide-react'

interface StageColumnProps {
  stage: CampaignLeadStage
  leads: LeadCardData[]
  isOver?: boolean
}

export function StageColumn({ stage, leads, isOver }: StageColumnProps) {
  const { setNodeRef } = useDroppable({
    id: stage.id,
    data: { type: 'stage', stage }
  })

  const Icon = Icons[stage.icone as keyof typeof Icons] || Icons.Circle

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-50 rounded-lg p-4 min-h-[500px] ${isOver ? 'ring-2 ring-blue-500' : ''}`}
      style={{ borderTop: `3px solid ${stage.cor}` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" style={{ color: stage.cor }} />
          <h3 className="font-semibold">{stage.nome}</h3>
        </div>
        <Badge>{leads.length}</Badge>
      </div>

      <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}
```

#### Step 2.3: Create Funnel Board Container

```typescript
// Location: src/features/campaign-stages/components/funnel-board/FunnelBoard.tsx

import { useState } from 'react'
import { DndContext, DragOverlay, DragEndEvent, DragOverEvent } from '@dnd-kit/core'
import { useCampaignStages } from '../../hooks/useStages'
import { useTransitionLead } from '../../hooks/useTransitions'
import { StageColumn } from './StageColumn'
import { LeadCard } from './LeadCard'
import { TransitionReasonModal } from './TransitionReasonModal'

export function FunnelBoard({ campaignId, leads }: any) {
  const { data: stages } = useCampaignStages()
  const { mutate: transitionLead } = useTransitionLead()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false)
  const [pendingTransition, setPendingTransition] = useState<any>(null)

  function handleDragStart(event: any) {
    setActiveId(event.active.id)
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event
    setOverId(over?.id as string | null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over) return

    const leadId = active.id as string
    const targetStageId = over.id as string

    // Open modal to ask for reason
    setPendingTransition({ campaignId, leadId, targetStageId })
    setIsReasonModalOpen(true)

    setActiveId(null)
    setOverId(null)
  }

  function handleConfirmTransition(motivo: string) {
    if (!pendingTransition) return

    transitionLead({
      campaignId: pendingTransition.campaignId,
      contactId: pendingTransition.leadId,
      data: {
        stageId: pendingTransition.targetStageId,
        motivo,
        automatico: false
      }
    })

    setIsReasonModalOpen(false)
    setPendingTransition(null)
  }

  const activeLead = activeId ? leads.find((l: any) => l.id === activeId) : null

  return (
    <>
      <DndContext
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages?.map((stage) => (
            <div key={stage.id} className="flex-shrink-0 w-80">
              <StageColumn
                stage={stage}
                leads={leads.filter((l: any) => l.currentStageId === stage.id)}
                isOver={overId === stage.id}
              />
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeLead ? <LeadCard lead={activeLead} /> : null}
        </DragOverlay>
      </DndContext>

      <TransitionReasonModal
        isOpen={isReasonModalOpen}
        onClose={() => setIsReasonModalOpen(false)}
        onConfirm={handleConfirmTransition}
      />
    </>
  )
}
```

---

### Phase 3: History Timeline (Priority P1) - Week 5

**Goal**: Display complete transition history for individual leads.

#### Implementation Steps:
1. Create `LeadStageHistory` component with vertical timeline
2. Use `fetchLeadStageHistory` service
3. Format `duracaoHoras` for human-readable display
4. Display motivo, userName, automatico flag
5. Add filtering/sorting options

---

### Phase 4: Funnel Metrics (Priority P2) - Week 6

**Goal**: Visualize funnel metrics with charts and KPIs.

#### Implementation Steps:
1. Use `fetchCampaignFunnelMetrics` service
2. Create `FunnelChart` component with recharts
3. Display conversion rates between stages
4. Show average duration per stage
5. Highlight bottlenecks

---

### Phase 5: Billing & Charges (Priority P2) - Week 7-8

**Goal**: Configure billing and display charge audit trails.

#### Implementation Steps:
1. Create billing configuration page
2. Display charge warnings on transitions (toasts)
3. Show charge history table with filters
4. Display charges summary per campaign

---

## Testing Strategy

### Unit Tests

```bash
# Test service functions
npm run test src/features/campaign-stages/services/*.test.ts

# Test hooks
npm run test src/features/campaign-stages/hooks/*.test.ts

# Test utility functions
npm run test src/features/campaign-stages/utils/*.test.ts
```

### Component Tests

```bash
# Test individual components
npm run test src/features/campaign-stages/components/**/*.test.tsx
```

### Integration Tests

```bash
# Test full user workflows
npm run test src/features/campaign-stages/integration/*.test.tsx
```

---

## Routing Setup

Add routes to your router configuration:

```typescript
// src/App.tsx or router config

import { StageConfigPage } from '@/features/campaign-stages/pages/StageConfigPage'
import { CampaignFunnelPage } from '@/features/campaign-stages/pages/CampaignFunnelPage'

const routes = [
  {
    path: '/settings/campaign-stages',
    element: <StageConfigPage />
  },
  {
    path: '/campaigns/:id/funnel',
    element: <CampaignFunnelPage />
  }
]
```

---

## Common Pitfalls & Solutions

### Issue 1: Drag-and-Drop Not Working
**Solution**: Ensure `@dnd-kit` sensors are configured correctly and IDs are unique.

### Issue 2: Stale Data After Mutations
**Solution**: Always invalidate React Query cache after mutations:
```typescript
queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stages.all })
```

### Issue 3: Charge Warnings Not Displaying
**Solution**: Check `TransitionLeadResponse.warnings` array and display using toast/alert.

### Issue 4: Performance Issues with Many Leads
**Solution**: Implement virtualization with `@tanstack/react-virtual` for 100+ leads per stage.

---

## Helpful Resources

- [React Query Docs](https://tanstack.com/query/latest)
- [@dnd-kit Documentation](https://docs.dndkit.com/)
- [Radix UI Components](https://www.radix-ui.com/)
- [Recharts Documentation](https://recharts.org/)
- Backend API Spec: `doc/FRONTEND_CAMPAIGN_STAGES_SPEC.md`

---

## Next Steps

1. ✅ Complete Phase 1 (Stage Config)
2. ✅ Complete Phase 2 (Funnel Board)
3. ✅ Complete Phase 3 (History Timeline)
4. Test end-to-end workflows
5. Gather user feedback
6. Iterate on UX improvements

---

**Quickstart Version**: 1.0
**Last Updated**: 2025-10-09
**Status**: Ready for Development
