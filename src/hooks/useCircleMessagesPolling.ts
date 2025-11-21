'use client';

import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/api-client';
import { getCircleMessages } from '@/lib/api/circles';
import { useAppStore } from '@/store/useAppStore';
import type { CircleMessage } from '@/types';

const POLL_INTERVAL_MS = 5000;

export const useCircleMessagesPolling = (circleId: string | null | undefined) => {
  const setMessages = useAppStore((state) => state.setMessages);
  const setQuotaFromApi = useAppStore((state) => state.setQuotaFromApi);
  const updateCircle = useAppStore((state) => state.updateCircle);
  const [notMember, setNotMember] = useState(false);

  const haveMessagesChanged = (
    prev: CircleMessage[],
    next: CircleMessage[],
  ) => {
    if (prev.length !== next.length) return true;
    if (prev.length === 0 && next.length === 0) return false;

    for (let index = 0; index < next.length; index += 1) {
      const current = next[index];
      const previous = prev[index];

      if (current.id !== previous.id) return true;
      if (current.content !== previous.content) return true;
      if (current.createdAt !== previous.createdAt) return true;
      if (current.isSystem !== previous.isSystem) return true;
      if (current.deviceId !== previous.deviceId) return true;

      const currentAuthor = current.author ?? null;
      const previousAuthor = previous.author ?? null;

      if (Boolean(currentAuthor) !== Boolean(previousAuthor)) return true;
      if (currentAuthor && previousAuthor) {
        if (currentAuthor.id !== previousAuthor.id) return true;
        if (currentAuthor.nickname !== previousAuthor.nickname) return true;
        if (currentAuthor.avatarKey !== previousAuthor.avatarKey) return true;
      }
    }

    return false;
  };

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
      if (cancelled || !circleId) {
        return;
      }

      try {
        const response = await getCircleMessages({
          circleId,
        });
        console.debug('Fetched circle messages', response);

        if (response.ok === false || !Array.isArray(response.messages)) {
          return;
        }

        const { messages: incoming, quota, memberCount } = response;

        const state = useAppStore.getState();
        if (state.circle?.id !== circleId || cancelled) {
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

        const prevMessages = state.messages;

        if (haveMessagesChanged(prevMessages, incoming)) {
          setMessages(incoming);
        }
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
