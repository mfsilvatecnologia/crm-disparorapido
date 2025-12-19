import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Metodologia } from '../../types/projeto.types'
import { MetodologiaSelector } from './MetodologiaSelector'

interface DefinirMetodologiaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (metodologia: Metodologia) => Promise<void> | void
  isLoading?: boolean
}

export function DefinirMetodologiaModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading
}: DefinirMetodologiaModalProps) {
  const [selected, setSelected] = React.useState<Metodologia | undefined>(undefined)

  React.useEffect(() => {
    if (!open) {
      setSelected(undefined)
    }
  }, [open])

  const handleConfirm = async () => {
    if (!selected) return
    await onConfirm(selected)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Definir metodologia</DialogTitle>
          <DialogDescription>
            Esta acao e unica. Depois de definida, a metodologia nao podera ser alterada.
          </DialogDescription>
        </DialogHeader>

        <MetodologiaSelector
          value={selected}
          onChange={setSelected}
          disabled={isLoading}
        />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!selected || isLoading}>
            {isLoading ? 'Salvando...' : 'Confirmar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
