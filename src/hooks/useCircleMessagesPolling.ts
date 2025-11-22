'use client';

import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/api-client';
import { getCircleMessages } from '@/lib/api/circles';
import { useAppStore } from '@/store/useAppStore';
import type { CircleMessage } from '@/types';

const POLL_INTERVAL_MS = 5000;

const mergeMessages = (
  existing: CircleMessage[],
  incoming: CircleMessage[],
) => {
  if (!incoming.length) {
    return existing;
  }

  const byId = new Map(existing.map((message) => [message.id, message]));
  incoming.forEach((message) => {
    byId.set(message.id, message);
  });

  return Array.from(byId.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
};

export const useCircleMessagesPolling = (circleId: string | null | undefined) => {
  const setMessages = useAppStore((state) => state.setMessages);
  const setQuotaFromApi = useAppStore((state) => state.setQuotaFromApi);
  const updateCircle = useAppStore((state) => state.updateCircle);
  const [notMember, setNotMember] = useState(false);

  useEffect(() => {
    setNotMember(false);
  }, [circleId]);

  useEffect(() => {
    if (!circleId) {
      setMessages([]);
      return undefined;
    }

    setMessages([]);
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const poll = async (reset = false) => {
      if (cancelled || !circleId) {
        return;
      }

      const state = useAppStore.getState();
      if (state.circle?.id !== circleId) {
        return;
      }

      const previousMessages = reset ? [] : state.messages;
      const lastTimestamp = reset
        ? undefined
        : previousMessages[previousMessages.length - 1]?.createdAt;

      try {
        const response = await getCircleMessages({
          circleId,
          ...(lastTimestamp ? { since: lastTimestamp } : {}),
        });
        console.debug('Fetched circle messages', response);

        if (response.ok === false || !Array.isArray(response.messages)) {
          return;
        }

        const { messages: incoming, quota, memberCount } = response;

        if (cancelled) {
          return;
        }

        setQuotaFromApi(quota ?? null);
        if (typeof memberCount === 'number') {
          updateCircle((prev) => {
            if (!prev || prev.id !== circleId) {
              return prev;
            }
            return { ...prev, memberCount };
          });
        }

        const nextMessages = reset
          ? incoming
          : mergeMessages(previousMessages, incoming);

        setMessages(nextMessages);
      } catch (error) {
        if (error instanceof ApiError && error.status === 403) {
          const details = (error.data as { error?: string } | null) ?? null;
          if (details?.error === 'NOT_MEMBER' || details?.error === 'not_member') {
            if (!cancelled) {
              setNotMember(true);
            }
            cancelled = true;
            if (intervalId) {
              clearInterval(intervalId);
            }
            return;
          }
        }

        if (!cancelled) {
          console.warn('Message polling failed', error);
        }
      }
    };

    intervalId = setInterval(() => poll(false), POLL_INTERVAL_MS);
    void poll(true);

    return () => {
      cancelled = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [circleId, setMessages, setQuotaFromApi, updateCircle]);

  return { notMember };
};
