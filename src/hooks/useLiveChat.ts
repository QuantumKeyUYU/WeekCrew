import { useEffect, useMemo, useRef, useState } from 'react';
import type { CircleMessage, MessageReaction } from '@/types';
import { getCircleChannelName, pusherClient } from '@/lib/realtime';

type TypingIndicator = { deviceId: string | null; nickname?: string | null; expiresAt: number };

interface UseLiveChatOptions {
  initialMessages?: CircleMessage[];
  onMessage?: (message: CircleMessage) => void;
}

export function useLiveChat(circleId: string | null, options?: UseLiveChatOptions) {
  const [messages, setMessages] = useState<CircleMessage[]>(options?.initialMessages ?? []);
  const [typing, setTyping] = useState<TypingIndicator[]>([]);
  const [reactions, setReactions] = useState<Record<string, MessageReaction[]>>({});

  const bufferRef = useRef<CircleMessage[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const channelName = useMemo(
    () => (circleId ? getCircleChannelName(circleId) : null),
    [circleId],
  );

  useEffect(() => {
    setMessages(options?.initialMessages ?? []);
    setReactions({});
    setTyping([]);
    bufferRef.current = options?.initialMessages ?? [];
  }, [channelName, options?.initialMessages]);

  useEffect(() => {
    if (!channelName || !pusherClient) {
      return undefined;
    }

    const channel = pusherClient.subscribe(channelName);

    channel.bind('new-message', (msg) => {
      bufferRef.current = [...bufferRef.current, msg];
      if (bufferRef.current.length > 200) {
        const overflow = bufferRef.current.splice(0, bufferRef.current.length - 200);
        if (typeof window !== 'undefined') {
          const key = `weekcrew:circle:${circleId}:messages:overflow`;
          localStorage.setItem(key, JSON.stringify(overflow));
        }
      }
      if (!flushTimerRef.current) {
        flushTimerRef.current = setTimeout(() => {
          flushTimerRef.current = null;
          setMessages([...bufferRef.current]);
        }, 120);
      }
      options?.onMessage?.(msg);
    });

    channel.bind('typing', (payload) => {
      const now = Date.now();
      const entry: TypingIndicator = {
        deviceId: (payload as { deviceId: string | null }).deviceId ?? null,
        nickname: (payload as { nickname?: string | null }).nickname ?? null,
        expiresAt: now + 2000,
      };
      setTyping((prev) => {
        const filtered = prev.filter((item) => item.deviceId !== entry.deviceId);
        return [...filtered, entry];
      });
    });

    channel.bind('message-reaction', (payload) => {
      const reaction = payload as MessageReaction;
      setReactions((prev) => {
        const current = prev[reaction.messageId] ?? [];
        const next = [...current, reaction].slice(-20);
        return { ...prev, [reaction.messageId]: next };
      });
    });

    return () => {
      channel.unsubscribe();
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
        flushTimerRef.current = null;
      }
    };
  }, [channelName, options?.onMessage]);

  useEffect(() => {
    if (!circleId || typeof window === 'undefined') return;
    const key = `weekcrew:circle:${circleId}:messages:overflow`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CircleMessage[];
        bufferRef.current = [...parsed.slice(-200), ...bufferRef.current];
        setMessages([...bufferRef.current].slice(-200));
      } catch {
        // ignore parsing errors
      }
    }
  }, [circleId]);

  useEffect(() => {
    if (!typing.length) return undefined;
    const interval = setInterval(() => {
      const now = Date.now();
      setTyping((prev) => prev.filter((item) => item.expiresAt > now));
    }, 750);
    return () => clearInterval(interval);
  }, [typing]);

  return { messages, setMessages, typing, reactions } as const;
}
