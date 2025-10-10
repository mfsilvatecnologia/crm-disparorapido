import React from 'react'
import type { StageCardData } from '../../types/ui.types'
import { StageCard } from './StageCard'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Props = {
  stages: StageCardData[]
  onEdit?: (stage: StageCardData) => void
  onDelete?: (stage: StageCardData) => void
  onReorder?: (newOrder: Array<{ id: string; ordem: number }>) => void
}

// Placeholder list; integrate @dnd-kit for drag-and-drop later
function SortableItem({ item, children }: { item: StageCardData; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  )
}

export function StageBoard({ stages, onEdit, onDelete, onReorder }: Props) {
  const [items, setItems] = React.useState(stages)

  React.useEffect(() => setItems(stages), [stages])

  // Simple up/down reordering for now
  function move(index: number, delta: number) {
    const next = [...items]
    const target = index + delta
    if (target < 0 || target >= next.length) return
    const [removed] = next.splice(index, 1)
    next.splice(target, 0, removed)
    setItems(next)
    onReorder?.(next.map((s, i) => ({ id: s.id, ordem: i })))
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    const next = arrayMove(items, oldIndex, newIndex)
    setItems(next)
    onReorder?.(next.map((s, i) => ({ id: s.id, ordem: i })))
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="grid gap-3">
          {items.map((s, i) => (
            <SortableItem key={s.id} item={s}>
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1">
                  <button className="text-xs border rounded px-2 py-1" onClick={() => move(i, -1)}>↑</button>
                  <button className="text-xs border rounded px-2 py-1" onClick={() => move(i, 1)}>↓</button>
                </div>
                <div className="flex-1">
                  <StageCard stage={s} onEdit={onEdit} onDelete={onDelete} />
                </div>
              </div>
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

export default StageBoard
