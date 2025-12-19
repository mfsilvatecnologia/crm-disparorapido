import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/shared/components/ui/dialog'
import type { CreateProjetoRequest } from '../../types/api.types'
import { ProjetoForm } from './ProjetoForm'

interface ProjetoCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateProjetoRequest) => Promise<void> | void
  isLoading?: boolean
}

export function ProjetoCreateModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading
}: ProjetoCreateModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Novo projeto</DialogTitle>
          <DialogDescription>
            Informe os dados basicos para iniciar o projeto sem metodologia.
          </DialogDescription>
        </DialogHeader>
        <ProjetoForm
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}
