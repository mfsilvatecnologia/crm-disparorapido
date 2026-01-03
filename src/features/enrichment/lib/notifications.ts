import { toast } from 'sonner';

export const notifySuccess = (message: string) => toast.success(message);
export const notifyPartial = (message: string) => toast.warning(message);
export const notifyError = (message: string) => toast.error(message);

// Legacy object-style export kept for compatibility with older imports
export const notify = {
  enrichmentSuccess: (leadName?: string) =>
    toast.success(leadName ? `Enriquecimento concluído para ${leadName}.` : 'Enriquecimento concluído.'),
  enrichmentPartial: () => toast.warning('Enriquecimento parcial: alguns providers falharam.'),
  enrichmentError: () => toast.error('Enriquecimento falhou em todos os providers.'),
  investigationComplete: () => toast.success('Investigação concluída.'),
  investigationEmpty: () => toast.info('Nenhuma fonte encontrada na investigação.'),
  investigationError: () => toast.error('Falha ao concluir a investigação.'),
  providerSaved: () => toast.success('Provider atualizado com sucesso.'),
  providerSaveError: () => toast.error('Erro ao salvar provider.'),
};
