'use client';

import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useWeekcrewSnapshot, useWeekcrewStorage } from '@/lib/weekcrewStorage';

const panelClass =
  'rounded-3xl border border-slate-200/80 bg-[#fefcff] p-4 shadow-[0_14px_36px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-950/60 sm:p-6';

export default function CirclePage() {
  const router = useRouter();
  const storage = useWeekcrewStorage();
  const { currentCircle, messages } = useWeekcrewSnapshot((snapshot) => ({
    currentCircle: snapshot.currentCircle,
    messages: snapshot.messages
  }));
  const [message, setMessage] = useState('');
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!listRef.current) {
      return;
    }
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const remainingDays = useMemo(() => {
    if (!currentCircle?.daysLeft) {
      return DAYS_FALLBACK;
    }
    return currentCircle.daysLeft;
  }, [currentCircle?.daysLeft]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim() || !currentCircle) {
      return;
    }
    await storage.sendMessage(currentCircle.id, message);
    setMessage('');
  };

  if (!currentCircle) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-dashed border-slate-300/80 bg-white/90 p-6 text-center text-slate-700 shadow-[0_12px_34px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200 sm:p-10">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Ты ещё не выбрал кружок</h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Загляни в раздел «Интересы», выбери настроение — и мы соберём уютную мини-команду.
          </p>
        </div>
        <button
          onClick={() => router.push('/explore')}
          className="inline-flex items-center justify-center rounded-full border border-brand bg-brand/10 px-6 py-2.5 text-sm font-semibold text-brand-foreground transition hover:-translate-y-0.5 hover:bg-brand/20"
        >
          Выбрать интерес
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className={panelClass}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-foreground">Твой кружок</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{currentCircle.title}</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{currentCircle.description}</p>
          </div>
          <div className="flex flex-col gap-1 text-sm text-slate-700 dark:text-slate-200">
            <span>До конца недели: {remainingDays} дн.</span>
            <span>В команде сейчас: {currentCircle.membersCount ?? DEFAULT_MEMBERS} человек</span>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_14px_36px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-950/60 sm:p-6">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Сообщения</h2>
        <div ref={listRef} className="mt-4 max-h-[55vh] space-y-3 overflow-y-auto pr-2">
          {messages.map((msg) => (
            <div key={msg.id} className={clsx('flex', msg.role === 'me' ? 'justify-end' : 'justify-start')}>
              <div
                className={clsx(
                  'max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm',
                  msg.role === 'me'
                    ? 'bg-brand text-white'
                    : 'bg-slate-50 text-slate-800 dark:bg-slate-900/70 dark:text-slate-100'
                )}
              >
                <p>{msg.text}</p>
                <span className={clsx('mt-2 block text-[11px]', msg.role === 'me' ? 'text-white/80' : 'text-slate-500')}>
                  {new Date(msg.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Напиши что-нибудь..."
            className="flex-1 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-white/10 dark:bg-slate-900/80 dark:text-white"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-2xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(127,90,240,0.25)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!message.trim()}
          >
            Отправить
          </button>
        </form>
      </section>

      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        Сейчас это демо-режим: сообщения хранятся только на этом устройстве.
      </p>
    </div>
  );
}

const DAYS_FALLBACK = 7;
const DEFAULT_MEMBERS = 6;
