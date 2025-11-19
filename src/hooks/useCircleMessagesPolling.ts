'use client';

import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/api-client';
import { getCircleMessages } from '@/lib/api/circles';
import { mergeMessages } from '@/lib/messages';
import { useAppStore } from '@/store/useAppStore';

const POLL_INTERVAL_MS = 5000;

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
      return undefined;
    }

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const poll = async () => {
      if (cancelled) {
        return;
      }

      try {
        const currentMessages = useAppStore.getState().messages;
        const last = currentMessages[currentMessages.length - 1];
        const { messages: incoming, quota, memberCount } = await getCircleMessages({
          circleId,
          since: last?.createdAt,
        });

        if (!cancelled) {
          setQuotaFromApi(quota ?? null);
          if (typeof memberCount === 'number') {
            updateCircle((prev) => {
              if (!prev || prev.id !== circleId) {
                return prev;
              }
              return { ...prev, memberCount };
            });
          }
        }

        if (cancelled || incoming.length === 0) {
          return;
        }

        const merged = mergeMessages(useAppStore.getState().messages, incoming);
        setMessages(merged);
      } catch (error) {
        if (error instanceof ApiError && error.status === 403) {
          const details = (error.data as { error?: string } | null) ?? null;
          if (details?.error === 'not_member') {
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

    intervalId = setInterval(poll, POLL_INTERVAL_MS);
    poll();

    return () => {
      cancelled = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [circleId, setMessages, setQuotaFromApi, updateCircle]);

  return { notMember };
};
