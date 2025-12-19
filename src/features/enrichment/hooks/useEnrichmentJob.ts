import { useEffect, useMemo, useRef, useState } from 'react';
import type { EnrichmentJob } from '../types/enrichment';
import { getEnrichmentJob } from '../services/enrichmentApi';
import { createPoller } from '../lib/polling';

export interface UseEnrichmentJobOptions {
  intervalMs?: number; // default 3000
}

export const useEnrichmentJob = (
  jobId: string | null,
  options: UseEnrichmentJobOptions = {}
) => {
  const intervalMs = options.intervalMs ?? 3000;
  const [job, setJob] = useState<EnrichmentJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollerRef = useRef<ReturnType<typeof createPoller> | null>(null);

  const stopOnTerminal = (j: EnrichmentJob) =>
    j.status === 'completed' || j.status === 'error';

  const start = useMemo(
    () =>
      async () => {
        if (!jobId) return;
        setLoading(true);
        setError(null);
        const poller = createPoller({
          intervalMs,
          retryDelays: [1000, 2000, 4000],
          onUpdate: (next) => {
            setJob(next as EnrichmentJob);
            if (stopOnTerminal(next as EnrichmentJob)) {
              poller.stop();
              setLoading(false);
            }
          },
          onError: (e) => {
            setError(e instanceof Error ? e.message : String(e));
            setLoading(false);
          },
        });
        pollerRef.current = poller;
        poller.start(async () => getEnrichmentJob(jobId));
      },
    [jobId, intervalMs]
  );

  const stop = () => {
    pollerRef.current?.stop();
    pollerRef.current = null;
  };

  useEffect(() => {
    return () => stop();
  }, []);

  return { job, loading, error, start, stop };
};
