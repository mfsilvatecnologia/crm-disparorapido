import { useEffect } from 'react';
import type { EnrichmentJob } from '../types/enrichment';
import { notifyError, notifyPartial, notifySuccess } from '../lib/notifications';

export interface EnrichmentNotificationsProps {
  job: EnrichmentJob | null;
}

export const EnrichmentNotifications = ({ job }: EnrichmentNotificationsProps) => {
  useEffect(() => {
    if (!job || job.status === 'queued' || job.status === 'processing') return;

    const hasErrors = job.results?.some((r) => r.status === 'error');
    const hasSuccess = job.results?.some((r) => r.status === 'success');

    if (job.status === 'completed') {
      if (hasErrors && hasSuccess) {
        notifyPartial('Enriquecimento concluído com resultados parciais.');
      } else if (hasSuccess) {
        notifySuccess('Enriquecimento concluído com sucesso.');
      } else {
        notifyError('Todos os providers falharam no enriquecimento.');
      }
    } else if (job.status === 'error') {
      notifyError('Falha no enriquecimento.');
    }
  }, [job]);

  return null;
};
