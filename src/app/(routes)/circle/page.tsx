'use client';

import { useEffect, useState } from 'react';
import { CircleHeader } from '@/components/circle/circle-header';
import { IcebreakerCard } from '@/components/circle/icebreaker-card';
import { MessageList } from '@/components/circle/message-list';
import { MessageComposer } from '@/components/circle/message-composer';
import { CircleEmptyState } from '@/components/circle/empty-state';
import { useAppStore } from '@/store/useAppStore';
import { getCircleById } from '@/lib/circles';
import { listenToCircleMessages } from '@/lib/messages';

export default function CirclePage() {
  const user = useAppStore((state) => state.user);
  const circle = useAppStore((state) => state.circle);
  const setCircle = useAppStore((state) => state.setCircle);
  const updateUser = useAppStore((state) => state.updateUser);
  const messages = useAppStore((state) => state.messages);
  const setMessages = useAppStore((state) => state.setMessages);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const circleId = user?.currentCircleId;
    if (!circleId || (circle && circle.id === circleId)) {
      return;
    }
    setLoading(true);
    getCircleById(circleId)
      .then((data) => {
        setCircle(data);
        if (!data) {
          updateUser((prev) => (prev ? { ...prev, currentCircleId: null } : prev));
        }
      })
      .catch((error) => {
        console.error('Failed to fetch circle', error);
      })
      .finally(() => setLoading(false));
  }, [user?.currentCircleId, circle, setCircle, updateUser]);

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

  if (!user?.currentCircleId || !circle) {
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

  const isArchived = !circle.isActive;

  return (
    <div className="space-y-6">
      <CircleHeader circle={circle} />
      <IcebreakerCard circle={circle} />
      <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
        <h2 className="text-sm font-semibold text-slate-100">Лента недели</h2>
        <div className="mt-4 max-h-[50vh] space-y-4 overflow-y-auto pr-2">
          <MessageList messages={messages} currentUserId={user.id} />
        </div>
        {isArchived ? (
          <p className="mt-4 text-sm text-slate-400">
            Неделя завершилась. Сообщения доступны только для чтения. Готов(-а) к новому кругу?
          </p>
        ) : (
          <MessageComposer circle={circle} />
        )}
      </section>
    </div>
  );
}
