type PollingFn<T> = () => Promise<T>;

type ShouldStopFn<T> = (data: T) => boolean;

type CallbackFn<T> = (data: T) => void;

export interface PollingOptions<T> {
  intervalMs: number; // base interval between successful polls
  fetchFn: PollingFn<T>;
  shouldStop: ShouldStopFn<T>;
  onUpdate?: CallbackFn<T>;
  onError?: (error: unknown) => void;
  retryDelaysMs?: number[]; // backoff delays on errors
}

export interface PollingController {
  start: () => void;
  stop: () => void;
}

const defaultRetryDelays = [1000, 2000, 4000];

export const createPoller = <T>(options: PollingOptions<T>): PollingController => {
  const retryDelays = options.retryDelaysMs ?? defaultRetryDelays;
  let stopped = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let retryAttempt = 0;

  const schedule = (delayMs: number) => {
    timeoutId = setTimeout(tick, delayMs);
  };

  const tick = async () => {
    if (stopped) return;
    try {
      const data = await options.fetchFn();
      retryAttempt = 0; // reset on success
      options.onUpdate?.(data);
      if (options.shouldStop(data)) {
        stopped = true;
        return;
      }
      schedule(options.intervalMs);
    } catch (error) {
      const delay = retryDelays[Math.min(retryAttempt, retryDelays.length - 1)];
      retryAttempt += 1;
      if (retryAttempt > retryDelays.length) {
        options.onError?.(error);
        stopped = true;
        return;
      }
      schedule(delay);
    }
  };

  return {
    start: () => {
      if (stopped) return;
      schedule(0);
    },
    stop: () => {
      stopped = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    },
  };
};
