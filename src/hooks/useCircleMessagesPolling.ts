'use client';

import { useEffect, useRef, useState } from 'react';
import { getCircleMessages } from '@/lib/api/circles';
import { useAppStore } from '@/store/useAppStore';

const POLL_INTERVAL_MS = 8000; // стало реже, можно вернуть 4000, если хочется живее

type UseCircleMessagesPollingResult = {
  notMember: boolean;
};

export function useCircleMessagesPolling(
  circleId: string | null,
): UseCircleMessagesPollingResult {
  const setMessages = useAppStore((state) => state.setMessages);
  // прямой доступ к Zustand-стору, не тащим getState в зависимости
  const getStateRef = useRef(useAppStore.getState);
  const [notMember, setNotMember] = useState(false);

  useEffect(() => {
    if (!circleId) {
      setNotMember(false);
      return;
    }

    let stopped = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let lastTimestamp: string | null = null;

    const tick = async () => {
      if (stopped) return;

      // не спамим сеть, если вкладка не активна
      if (typeof document !== 'undefined' && document.hidden) {
        timeoutId = setTimeout(tick, POLL_INTERVAL_MS);
        return;
      }

      try {
        const response = await getCircleMessages({
          circleId,
          since: lastTimestamp ?? undefined,
        });

        if (stopped) return;

        if (response.notMember) {
          // важно: останавливаем поллинг, иначе он будет крутиться вхолостую
          setNotMember(true);
          stopped = true;
          return;
        }

        const incoming = response.messages ?? [];
        if (incoming.length > 0) {
          const prev = getStateRef.current().messages;

          // объединяем без дублей
          const byId = new Map(prev.map((m) => [m.id, m]));
          for (const msg of incoming) {
            byId.set(msg.id, msg);
          }

          const merged = Array.from(byId.values()).sort(
            (a, b) =>
              new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime(),
          );

          // маленький guard, чтобы не триггерить перерисовку без реальных изменений
          const prevLast = prev[prev.length - 1];
          const nextLast = merged[merged.length - 1];

          if (
            merged.length !== prev.length ||
            prevLast?.id !== nextLast?.id
          ) {
            setMessages(merged);
          }

          lastTimestamp =
            incoming[incoming.length - 1]?.createdAt ?? lastTimestamp;
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[useCircleMessagesPolling] tick failed', error);
        }
      } finally {
        if (!stopped) {
          timeoutId = setTimeout(tick, POLL_INTERVAL_MS);
        }
      }
    };

    // первый запуск
    void tick();

    return () => {
      stopped = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [circleId, setMessages]);

  return { notMember };
}
