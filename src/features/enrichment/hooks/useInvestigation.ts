import { useEffect, useMemo, useRef, useState } from 'react';
import type { Investigation } from '../types/enrichment';
import { getInvestigation } from '../services/investigationApi';
import { createPoller } from '../lib/polling';

export interface UseInvestigationOptions {
  intervalMs?: number; // default 5000
}

export const useInvestigation = (
  id: string | null,
  options: UseInvestigationOptions = {}
) => {
  const intervalMs = options.intervalMs ?? 5000;
  const [data, setData] = useState<Investigation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollerRef = useRef<ReturnType<typeof createPoller> | null>(null);

  const stopOnTerminal = (j: Investigation) =>
    j.status === 'completed' || j.status === 'failed';

  const start = useMemo(
    () =>
      async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        const poller = createPoller({
          intervalMs,
          retryDelays: [1000, 2000, 4000],
          onUpdate: (next) => {
            setData(next as Investigation);
            if (stopOnTerminal(next as Investigation)) {
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
        poller.start(async () => getInvestigation(id));
      },
    [id, intervalMs]
  );

  const stop = () => {
    pollerRef.current?.stop();
    pollerRef.current = null;
  };

  useEffect(() => {
    return () => stop();
  }, []);

  return { data, loading, error, start, stop };
};
