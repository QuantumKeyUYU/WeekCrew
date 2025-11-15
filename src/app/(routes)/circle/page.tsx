'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CircleHeader } from '@/components/circle/circle-header';
import { IcebreakerCard } from '@/components/circle/icebreaker-card';
import { MessageList } from '@/components/circle/message-list';
import { MessageComposer } from '@/components/circle/message-composer';
import { CircleEmptyState } from '@/components/circle/empty-state';
import { useCountdown } from '@/hooks/useCountdown';
import { useAppStore } from '@/store/useAppStore';
import { getCircleById, isCircleExpired } from '@/lib/circles';
import { getAuthorMessageCountInLast24h, listenToCircleMessages } from '@/lib/messages';
import { MAX_MESSAGES_PER_DAY } from '@/constants/limits';

export default function CirclePage() {
  const user = useAppStore((state) => state.user);
  const device = useAppStore((state) => state.device);
  const circle = useAppStore((state) => state.circle);
  const setCircle = useAppStore((state) => state.setCircle);
  const updateUser = useAppStore((state) => state.updateUser);
  const messages = useAppStore((state) => state.messages);
  const setMessages = useAppStore((state) => state.setMessages);
  const [loading, setLoading] = useState(false);
  const [prefill, setPrefill] = useState<string | undefined>();
  const [dailyCount, setDailyCount] = useState(0);
  const [limitLoading, setLimitLoading] = useState(false);

  useEffect(() => {
    const circleId = user?.currentCircleId;
    if (!circleId || (circle && circle.id === circleId)) {
      return;
    }
    setLoading(true);
    getCircleById(circleId)
      .then((data) => {
        if (data && device && !data.memberIds.includes(device.deviceId)) {
          setCircle(null);
          updateUser((prev) => (prev ? { ...prev, currentCircleId: null } : prev));
          return;
        }
        setCircle(data);
        if (!data) {
          updateUser((prev) => (prev ? { ...prev, currentCircleId: null } : prev));
        }
      })
      .catch((error) => {
        console.error('Failed to fetch circle', error);
      })
      .finally(() => setLoading(false));
  }, [user?.currentCircleId, circle, setCircle, updateUser, device]);

  useEffect(() => {
    if (!circle) {
      return;
    }
    const unsubscribe = listenToCircleMessages(circle.id, setMessages);
    return () => unsubscribe();
  }, [circle, setMessages]);

  useEffect(() => {
    return () => setMessages([]);
  }, [setMessages]);

  useEffect(() => {
    if (!circle || !device) {
      setDailyCount(0);
      return;
    }
    setLimitLoading(true);
    getAuthorMessageCountInLast24h(circle.id, device.deviceId)
      .then((count) => setDailyCount(count))
      .catch((error) => console.error('Failed to fetch daily message count', error))
      .finally(() => setLimitLoading(false));
  }, [circle, device]);

  useEffect(() => {
    if (!device) {
      return;
    }
    const since = Date.now() - 24 * 60 * 60 * 1000;
    const count = messages.filter((message) => {
      if (message.authorDeviceId !== device.deviceId) {
        return false;
      }
      const createdAt = message.createdAt?.toMillis?.();
      return typeof createdAt === 'number' && createdAt >= since;
    }).length;
    setDailyCount(count);
  }, [messages, device]);

  useEffect(() => {
    if (!prefill || !circle) {
      return;
    }
    if (isCircleExpired(circle)) {
      setPrefill(undefined);
    }
  }, [circle, prefill]);

  const countdown = useCountdown(circle?.expiresAt);
  const hasCircle = circle && device && circle.memberIds.includes(device.deviceId);
  const readOnly = !!circle && (countdown.isExpired || circle.status === 'archived');
  const limitReached = hasCircle && !readOnly && dailyCount >= MAX_MESSAGES_PER_DAY;

  if (!user?.currentCircleId || !hasCircle) {
    if (loading) {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-brand" />
          <p className="text-sm text-slate-300">Загружаем твой кружок недели...</p>
        </div>
      );
    }
    return <CircleEmptyState />;
  }

  return (
    <div className="space-y-6">
      <CircleHeader circle={circle} />
      <IcebreakerCard circle={circle} onAnswerClick={(text) => setPrefill(text)} />
      <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
        <h2 className="text-sm font-semibold text-slate-100">Лента недели</h2>
        <div className="mt-4 max-h-[50vh] space-y-4 overflow-y-auto pr-2">
          <MessageList messages={messages} currentDeviceId={device.deviceId} />
        </div>
        {readOnly ? (
          <div className="mt-4 flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-900/50 p-4 text-sm text-slate-300">
            <p>Неделя этого кружка закончилась. Можно перечитать, но писать уже нельзя.</p>
            <Link
              href="/explore"
              className="inline-flex w-fit items-center justify-center rounded-full border border-white/20 px-4 py-2 text-xs font-medium text-slate-100 transition hover:-translate-y-0.5"
            >
              Найти новый кружок
            </Link>
          </div>
        ) : (
          <MessageComposer
            circle={circle}
            disabled={limitReached || limitLoading}
            disabledReason={
              limitReached
                ? 'Ты написал сегодня много. Дай слово другим — завтра лимит обновится ✨'
                : limitLoading
                ? 'Проверяем твой лимит сообщений...'
                : undefined
            }
            prefill={prefill}
            onPrefillConsumed={() => setPrefill(undefined)}
          />
        )}
      </section>
    </div>
  );
}
