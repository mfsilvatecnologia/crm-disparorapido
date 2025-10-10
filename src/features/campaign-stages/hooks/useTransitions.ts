import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { transitionLeadStage, bulkUpdateLeadStages } from '../services/stages'

export function useTransitionLead(campaignId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ contactId, stageId, motivo, automatico = false }: { contactId: string; stageId: string; motivo?: string; automatico?: boolean }) =>
      transitionLeadStage(campaignId, contactId, { stageId, motivo, automatico }),
    onSuccess: (res) => {
      // Invalidate campaign contacts list
      queryClient.invalidateQueries({ queryKey: ['campaigns', campaignId, 'contacts'] })
      if (res?.warnings?.length) {
        res.warnings.forEach((w) => toast.error(w.message))
      } else {
        toast.success('Lead movido com sucesso')
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Falha ao mover lead')
    },
  })
}

export function useBulkUpdateLeads(campaignId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ contactIds, stageId, motivo, automatico = false }: { contactIds: string[]; stageId: string; motivo?: string; automatico?: boolean }) =>
      bulkUpdateLeadStages(campaignId, { contactIds, stageId, motivo, automatico }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', campaignId, 'contacts'] })
      const { successCount, failedCount, chargeWarnings } = res.data
      if (chargeWarnings?.length) {
        chargeWarnings.forEach((w) => toast.error(w.warning))
      }
      toast.success(`Atualização em massa concluída: ${successCount} sucesso, ${failedCount} falha(s)`) 
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Falha na atualização em massa')
    },
  })
}

