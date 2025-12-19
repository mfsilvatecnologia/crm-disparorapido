import * as React from 'react'
import { Button } from '@/shared/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import type { Projeto } from '../../types/projeto.types'
import { MetodologiaBadge } from '../metodologia/MetodologiaBadge'
import { ProjetoStatusBadge } from './ProjetoStatusBadge'
import { ProjetoProgress } from './ProjetoProgress'
import { EtapasList } from '../etapa/EtapasList'
import { DefinirMetodologiaModal } from '../metodologia/DefinirMetodologiaModal'
import { useDefinirMetodologia } from '../../hooks/useDefinirMetodologia'
import { Metodologia } from '../../types/projeto.types'

interface ProjetoDetalhesProps {
  projeto: Projeto
}

export function ProjetoDetalhes({ projeto }: ProjetoDetalhesProps) {
  const [modalOpen, setModalOpen] = React.useState(false)
  const definirMutation = useDefinirMetodologia()

  const handleDefinirMetodologia = async (metodologia: Metodologia) => {
    await definirMutation.mutateAsync({ projetoId: projeto.id, metodologia })
    setModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border bg-background p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{projeto.titulo}</h2>
            <p className="text-sm text-muted-foreground">{projeto.descricao}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <MetodologiaBadge metodologia={projeto.metodologia} />
            <ProjetoStatusBadge status={projeto.status} />
          </div>
        </div>

        <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
          <div>
            <div className="text-xs uppercase tracking-wide">Lead</div>
            <div className="text-sm text-foreground">
              {projeto.cliente?.nome ?? projeto.cliente_id}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide">Responsavel</div>
            <div className="text-sm text-foreground">
              {projeto.responsavel?.nome ?? projeto.responsavel_id}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide">Data inicio</div>
            <div className="text-sm text-foreground">{projeto.data_inicio}</div>
          </div>
        </div>

        {projeto.pode_definir_metodologia ? (
          <Alert>
            <AlertTitle>Metodologia pendente</AlertTitle>
            <AlertDescription>
              Defina a metodologia para liberar o acompanhamento das etapas.
            </AlertDescription>
            <div className="mt-3">
              <Button size="sm" onClick={() => setModalOpen(true)}>
                Definir metodologia
              </Button>
            </div>
          </Alert>
        ) : null}
      </div>

      <ProjetoProgress projeto={projeto} />

      <div>
        <h3 className="mb-3 text-base font-semibold">Etapas</h3>
        <EtapasList etapas={projeto.etapas} />
      </div>

      <DefinirMetodologiaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onConfirm={handleDefinirMetodologia}
        isLoading={definirMutation.isPending}
      />
    </div>
  )
}
