// src/hooks/useCircleMessagesPolling.ts
'use client';

import { useEffect, useRef, useState } from 'react';
import { getCircleMessages } from '@/lib/api/circles';
import { useAppStore } from '@/store/useAppStore';

const POLL_INTERVAL_MS = 8000; // 8 секунд

type UseCircleMessagesPollingResult = {
  notMember: boolean;
};

export function useCircleMessagesPolling(
  circleId: string | null,
): UseCircleMessagesPollingResult {
  const setMessages = useAppStore((state) => state.setMessages);
  const getStoreRef = useRef(useAppStore.getState);
  const [notMember, setNotMember] = useState(false);

  const latestCreatedAtRef = useRef<string | null>(null);

  useEffect(() => {
    if (!circleId) {
      setNotMember(false);
      latestCreatedAtRef.current = null;
      return;
    }

    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;

      // если вкладка скрыта — просто пропускаем тик
      if (typeof document !== 'undefined' && document.hidden) {
        return;
      }

      try {
        const since = latestCreatedAtRef.current ?? undefined;
        const response = await getCircleMessages({ circleId, since });

        if (cancelled) return;

        if (response.notMember) {
          setNotMember(true);
          return;
        }

        const incoming = response.messages ?? [];
        if (incoming.length === 0) return;

        const prev = getStoreRef.current().messages;

        const byId = new Map(prev.map((m) => [m.id, m]));
        for (const msg of incoming) {
          byId.set(msg.id, msg);
        }

        const merged = Array.from(byId.values()).sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime(),
        );

        const prevLast = prev[prev.length - 1];
        const nextLast = merged[merged.length - 1];

        // Обновляем store только если реально что-то изменилось
        if (
          merged.length !== prev.length ||
          prevLast?.id !== nextLast?.id
        ) {
          setMessages(merged);
        }

        latestCreatedAtRef.current =
          incoming[incoming.length - 1]?.createdAt ??
          latestCreatedAtRef.current;
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[useCircleMessagesPolling] poll failed', error);
        }
      }
    };

    // первый тик сразу
    void poll();

    const id = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [circleId, setMessages]);

  return { notMember };
}
