// src/hooks/useSWR.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Key = string | null;

interface Options {
  refreshInterval?: number;
}

type Fetcher<T> = (key: string) => Promise<T>;

interface SWRResponse<T> {
  data: T | undefined;
  error: unknown;
  isLoading: boolean;
  mutate: (value: T | undefined) => void;
}

/**
 * Lightweight polling-based SWR-like hook to keep data fresh without spamming the server.
 */
export default function useSWR<T>(
  key: Key,
  fetcher: Fetcher<T>,
  options: Options = {},
): SWRResponse<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<unknown>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshInterval = options.refreshInterval ?? 0;
  const activeKeyRef = useRef<Key>(key);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const runFetcher = useCallback(
    async (currentKey: string) => {
      setIsLoading(true);
      try {
        const result = await fetcher(currentKey);
        if (activeKeyRef.current === currentKey) {
          setData(result);
          setError(undefined);
        }
      } catch (err) {
        if (activeKeyRef.current === currentKey) {
          setError(err);
        }
      } finally {
        if (activeKeyRef.current === currentKey) {
          setIsLoading(false);
        }
      }
    },
    [fetcher],
  );

  useEffect(() => {
    activeKeyRef.current = key;
    clearTimer();

    if (!key) {
      setIsLoading(false);
      return undefined;
    }

    void runFetcher(key);

    if (refreshInterval > 0) {
      timerRef.current = setInterval(() => {
        if (activeKeyRef.current) {
          void runFetcher(activeKeyRef.current);
        }
      }, refreshInterval);

      return () => clearTimer();
    }

    return undefined;
  }, [clearTimer, key, refreshInterval, runFetcher]);

  const mutate = useCallback((value: T | undefined) => setData(value), []);

  return useMemo(
    () => ({ data, error, isLoading, mutate }),
    [data, error, isLoading, mutate],
  );
}

