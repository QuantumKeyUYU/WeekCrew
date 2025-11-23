'use client';

import { useEffect, useState } from 'react';
import { getCircleMessages } from '@/lib/api/circles';
import { useAppStore } from '@/store/useAppStore';

const POLL_INTERVAL_MS = 4000; // 4 секунды – можно потом подкрутить

type UseCircleMessagesPollingResult = {
  notMember: boolean;
};

export function useCircleMessagesPolling(
  circleId: string | null,
): UseCircleMessagesPollingResult {
  const setMessages = useAppStore((state) => state.setMessages);
  const getState = useAppStore; // чтобы доставать текущие messages через getState()
  const [notMember, setNotMember] = useState(false);

  useEffect(() => {
    if (!circleId) {
      setNotMember(false);
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let lastTimestamp: string | null = null;

    const tick = async () => {
      if (cancelled) return;

      // Не дёргаем сеть, пока таб скрыт – меньше лагов на десктопе
      if (typeof document !== 'undefined' && document.hidden) {
        timeoutId = setTimeout(tick, POLL_INTERVAL_MS);
        return;
      }

      try {
        const response = await getCircleMessages({
          circleId,
          since: lastTimestamp ?? undefined,
        });

        if (cancelled) return;

        if (response.notMember) {
          setNotMember(true);
          return;
        }

        const incoming = response.messages ?? [];

        if (incoming.length > 0) {
          // Берём текущие сообщения из стора
          const prev = getState.getState().messages;

          // Мапой по id, чтобы не было дублей
          const byId = new Map<string, (typeof prev)[number]>();
          for (const msg of prev) {
            byId.set(msg.id, msg);
          }
          for (const msg of incoming) {
            byId.set(msg.id, msg);
          }

          const merged = Array.from(byId.values()).sort(
            (a, b) =>
              new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime(),
          );

          setMessages(merged);

          lastTimestamp =
            incoming[incoming.length - 1]?.createdAt ?? lastTimestamp;
        }
      } catch (error) {
        // тихо логируем – не хотим спамить консоль при временных ошибках
        console.warn('[useCircleMessagesPolling] tick failed', error);
      } finally {
        if (!cancelled) {
          timeoutId = setTimeout(tick, POLL_INTERVAL_MS);
        }
      }
    };

    // первый запуск
    void tick();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [circleId, getState, setMessages]);

  return { notMember };
}
