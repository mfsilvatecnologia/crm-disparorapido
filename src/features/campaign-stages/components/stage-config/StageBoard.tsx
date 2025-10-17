import React from 'react'
import type { StageCardData } from '../../types/ui.types'
import { StageCard } from './StageCard'

type Props = {
  stages: StageCardData[]
  onEdit?: (stage: StageCardData) => void
  onDelete?: (stage: StageCardData) => void
  onReorder?: (newOrder: Array<{ id: string; ordem: number }>) => void
}



export function StageBoard({ stages, onEdit, onDelete, onReorder }: Props) {
  const [items, setItems] = React.useState(stages)

  React.useEffect(() => setItems(stages), [stages])

  // Simple up/down reordering
  function move(index: number, delta: number) {
    const next = [...items]
    const target = index + delta
    if (target < 0 || target >= next.length) return
    
    // Swap the items
    const [removed] = next.splice(index, 1)
    next.splice(target, 0, removed)
    
    setItems(next)
    onReorder?.(next.map((s, i) => ({ id: s.id, ordem: i })))
  }

  return (
    <div className="grid gap-3">
      {items.map((s, i) => (
        <div key={s.id} className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <button 
              className="text-xs border rounded px-2 py-1 hover:bg-gray-50" 
              onClick={() => move(i, -1)}
              disabled={i === 0}
            >
              ↑
            </button>
            <button 
              className="text-xs border rounded px-2 py-1 hover:bg-gray-50" 
              onClick={() => move(i, 1)}
              disabled={i === items.length - 1}
            >
              ↓
            </button>
          </div>
          <div className="flex-1">
            <StageCard stage={s} onEdit={onEdit} onDelete={onDelete} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default StageBoard
