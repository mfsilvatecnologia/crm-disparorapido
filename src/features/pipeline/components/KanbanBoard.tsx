import React, { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Plus, MoreHorizontal, TrendingUp, DollarSign } from 'lucide-react'
import { DealCard } from './DealCard'
import type { Deal, PipelineStage, BoardColumn } from '../types/pipeline'

interface KanbanBoardProps {
  columns: BoardColumn[]
  onDealMove?: (dealId: string, fromStageId: string, toStageId: string) => void
  onDealEdit?: (deal: Deal) => void
  onDealDelete?: (dealId: string) => void
  onDealCall?: (deal: Deal) => void
  onDealEmail?: (deal: Deal) => void
  onDealSchedule?: (deal: Deal) => void
  onCreateDeal?: (stageId: string) => void
  onStageEdit?: (stage: PipelineStage) => void
  loading?: boolean
  className?: string
}

interface DroppableColumnProps {
  column: BoardColumn
  deals: Deal[]
  onCreateDeal?: (stageId: string) => void
  onStageEdit?: (stage: PipelineStage) => void
  onDealEdit?: (deal: Deal) => void
  onDealDelete?: (dealId: string) => void
  onDealCall?: (deal: Deal) => void
  onDealEmail?: (deal: Deal) => void
  onDealSchedule?: (deal: Deal) => void
}

interface DraggableDealProps {
  deal: Deal
  onEdit?: (deal: Deal) => void
  onDelete?: (dealId: string) => void
  onCall?: (deal: Deal) => void
  onEmail?: (deal: Deal) => void
  onSchedule?: (deal: Deal) => void
}

// Draggable Deal Component
function DraggableDeal({ deal, onEdit, onDelete, onCall, onEmail, onSchedule }: DraggableDealProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <DealCard
        deal={deal}
        onEdit={onEdit}
        onDelete={onDelete}
        onCall={onCall}
        onEmail={onEmail}
        onSchedule={onSchedule}
        className="mb-3"
      />
    </div>
  )
}

// Droppable Column Component
function DroppableColumn({
  column,
  deals,
  onCreateDeal,
  onStageEdit,
  onDealEdit,
  onDealDelete,
  onDealCall,
  onDealEmail,
  onDealSchedule,
}: DroppableColumnProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  return (
    <Card className="flex flex-col h-full min-h-[600px] w-80 flex-shrink-0">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: column.stage.cor }}
            />
            <CardTitle className="text-base font-semibold">
              {column.stage.nome}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {column.count}
            </Badge>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onStageEdit?.(column.stage)}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Column Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
          <div className="flex items-center space-x-1">
            <DollarSign className="h-3 w-3" />
            <span>{formatCurrency(column.totalValue)}</span>
          </div>

          <div className="flex items-center space-x-1">
            <TrendingUp className="h-3 w-3" />
            <span>{column.stage.probabilidade}%</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-3">
        <ScrollArea className="h-full">
          <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {deals.map((deal) => (
                <DraggableDeal
                  key={deal.id}
                  deal={deal}
                  onEdit={onDealEdit}
                  onDelete={onDealDelete}
                  onCall={onDealCall}
                  onEmail={onDealEmail}
                  onSchedule={onDealSchedule}
                />
              ))}

              {/* Add Deal Button */}
              {onCreateDeal && (
                <Button
                  variant="dashed"
                  className="w-full h-20 border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  onClick={() => onCreateDeal(column.stage.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Negócio
                </Button>
              )}

              {/* Empty State */}
              {deals.length === 0 && !onCreateDeal && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-6xl mb-4 opacity-20">📋</div>
                  <p className="text-sm text-muted-foreground">
                    Nenhum negócio nesta etapa
                  </p>
                </div>
              )}
            </div>
          </SortableContext>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export function KanbanBoard({
  columns,
  onDealMove,
  onDealEdit,
  onDealDelete,
  onDealCall,
  onDealEmail,
  onDealSchedule,
  onCreateDeal,
  onStageEdit,
  loading,
  className
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum distance to start drag
      },
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)

    // Find the deal being dragged
    for (const column of columns) {
      const deal = column.deals.find(d => d.id === event.active.id)
      if (deal) {
        setDraggedDeal(deal)
        break
      }
    }
  }, [columns])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setDraggedDeal(null)

    if (!over || !onDealMove) return

    const dealId = active.id as string
    const targetStageId = over.id as string

    // Find current stage
    let currentStageId: string | undefined
    for (const column of columns) {
      if (column.deals.some(d => d.id === dealId)) {
        currentStageId = column.stage.id
        break
      }
    }

    if (currentStageId && currentStageId !== targetStageId) {
      onDealMove(dealId, currentStageId, targetStageId)
    }
  }, [columns, onDealMove])

  if (loading) {
    return (
      <div className={`flex space-x-4 p-4 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="w-80 h-[600px] animate-pulse">
            <CardHeader className="pb-3 border-b">
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-1/3 mt-2" />
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-32 bg-muted rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!columns.length) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-20">📊</div>
          <p className="text-lg font-medium text-muted-foreground">
            Pipeline não configurado
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Configure as etapas do pipeline para começar
          </p>
        </div>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={`flex space-x-4 p-4 overflow-x-auto ${className}`}>
        <SortableContext items={columns.map(c => c.stage.id)} strategy={verticalListSortingStrategy}>
          {columns.map((column) => (
            <DroppableColumn
              key={column.stage.id}
              column={column}
              deals={column.deals}
              onCreateDeal={onCreateDeal}
              onStageEdit={onStageEdit}
              onDealEdit={onDealEdit}
              onDealDelete={onDealDelete}
              onDealCall={onDealCall}
              onDealEmail={onDealEmail}
              onDealSchedule={onDealSchedule}
            />
          ))}
        </SortableContext>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId && draggedDeal ? (
          <div className="transform rotate-5 scale-105">
            <DealCard
              deal={draggedDeal}
              className="shadow-2xl border-primary/50"
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}