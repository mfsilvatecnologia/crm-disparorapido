import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useCampaignStages, useCreateCampaignStage, useDeleteCampaignStage, useReorderCampaignStages, useUpdateCampaignStage } from '../hooks/useStages'
import StageBoard from '../components/stage-config/StageBoard'
import StageFormModal from '../components/stage-config/StageFormModal'
import StageDeleteDialog from '../components/stage-config/StageDeleteDialog'
import type { StageCardData } from '../types/ui.types'

export function StageConfigPage() {
  const { id: campaignId } = useParams()
  const navigate = useNavigate()
  const stagesQuery = useCampaignStages()
  const createStage = useCreateCampaignStage()
  const updateStage = useUpdateCampaignStage()
  const deleteStage = useDeleteCampaignStage()
  const reorderStages = useReorderCampaignStages()

  const [createOpen, setCreateOpen] = React.useState(false)
  const [editStage, setEditStage] = React.useState<StageCardData | null>(null)
  const [deleteStageState, setDeleteStageState] = React.useState<StageCardData | null>(null)

  // Debug: Log state changes
  React.useEffect(() => {
    console.log('editStage state changed:', editStage)
  }, [editStage])

  const stages: StageCardData[] = (stagesQuery.data || []).map((s) => ({
    id: s.id,
    nome: s.nome,
    categoria: s.categoria,
    cor: s.cor,
    icone: s.icone,
    ordem: s.ordem,
    cobraCreditos: s.cobraCreditos,
    custoCentavos: s.custoCentavos,
    isInicial: s.isInicial,
    isFinal: s.isFinal,
  }))

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {campaignId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app/campanhas')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Campanhas
            </Button>
          )}
          <h1 className="text-xl font-semibold">
            {campaignId ? `Estágios da Campanha ${campaignId}` : 'Estágios das Campanhas'}
          </h1>
        </div>
        <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => setCreateOpen(true)}>
          Novo estágio
        </button>
      </div>

      {stagesQuery.isLoading && <div>Carregando estágios...</div>}
      {stagesQuery.isError && <div>Falha ao carregar estágios</div>}

      {!stagesQuery.isLoading && !stagesQuery.isError && (
        <StageBoard
          stages={stages}
          onEdit={(s) => {
            console.log('onEdit called with stage:', s)
            setEditStage(s)
          }}
          onDelete={(s) => setDeleteStageState(s)}
          onReorder={(order) => reorderStages.mutate(order)}
        />
      )}

      {/* Create */}
      <StageFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={(data) => {
          createStage.mutate({
            nome: data.nome,
            categoria: data.categoria,
            cor: data.cor,
            icone: data.icone,
            isInicial: data.isInicial,
            isFinal: data.isFinal,
            cobraCreditos: data.cobraCreditos,
            custoCentavos: data.custoCentavos,
            descricaoCobranca: data.descricaoCobranca,
          })
          setCreateOpen(false)
        }}
      />

      {/* Edit */}
      <StageFormModal
        open={!!editStage}
        initial={editStage || undefined}
        onClose={() => setEditStage(null)}
        onSubmit={(data) => {
          if (!editStage) return
          updateStage.mutate({ id: editStage.id, data: {
            nome: data.nome,
            cor: data.cor,
            icone: data.icone,
            cobraCreditos: data.cobraCreditos,
            custoCentavos: data.custoCentavos,
            descricaoCobranca: data.descricaoCobranca,
          } })
          setEditStage(null)
        }}
      />

      {/* Delete */}
      <StageDeleteDialog
        open={!!deleteStageState}
        onCancel={() => setDeleteStageState(null)}
        onConfirm={() => {
          if (!deleteStageState) return
          deleteStage.mutate(deleteStageState.id)
          setDeleteStageState(null)
        }}
      />
    </div>
  )
}

export default StageConfigPage

