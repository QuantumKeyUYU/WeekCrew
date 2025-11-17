'use client';

import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useWeekcrewSnapshot, useWeekcrewStorage } from '@/lib/weekcrewStorage';

const panelClass =
  'rounded-3xl border border-slate-200/80 bg-[#fefcff] p-4 shadow-[0_14px_36px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-950/60 sm:p-6';

const DAYS_FALLBACK = 7;
const DEFAULT_MEMBERS = 6;
const SAFETY_KEY = 'weekcrew:safety-accepted-v2';

export default function CirclePage() {
  const router = useRouter();
  const storage = useWeekcrewStorage();

  const { currentCircle, messages } = useWeekcrewSnapshot((snapshot) => ({
    currentCircle: snapshot.currentCircle,
    messages: snapshot.messages,
  }));

  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [safetyAccepted, setSafetyAccepted] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);

  // читаем флаг согласия с правилами из localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(SAFETY_KEY);
      if (stored === '1') {
        setSafetyAccepted(true);
      }
    } catch {
      // молча игнорируем
    }
  }, []);

  const handleAcceptSafety = () => {
    setSafetyAccepted(true);
    try {
      window.localStorage.setItem(SAFETY_KEY, '1');
    } catch {
      // ок, просто не сохранилось
    }
  };

  // Автоскролл к последнему сообщению
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const remainingDays = useMemo(() => {
    if (!currentCircle?.daysLeft) return DAYS_FALLBACK;
    return currentCircle.daysLeft;
  }, [currentCircle?.daysLeft]);

  const isLastDay = remainingDays <= 1;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim() || !currentCircle || isSending || !safetyAccepted) return;

    setSendError(null);
    setIsSending(true);

    try {
      await storage.sendMessage(currentCircle.id, message);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message', error);
      setSendError('Не получилось отправить сообщение. Попробуй ещё раз.');
    } finally {
      setIsSending(false);
    }
  };

  const handleLeaveCircle = async () => {
    try {
      await storage.leaveCircle();
    } catch (error) {
      console.error('Failed to leave circle', error);
    }
  };

  const handleResetDemo = async () => {
    try {
      await storage.clearAllLocalData();
      router.push('/explore');
    } catch (error) {
      console.error('Failed to clear demo data', error);
    }
  };

  const handleStartNewCircle = () => {
    router.push('/explore');
  };

  if (!currentCircle) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-dashed border-slate-300/80 bg-white/90 p-6 text-center text-slate-700 shadow-[0_12px_34px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200 sm:p-10">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Ты ещё не выбрал кружок
          </h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Загляни в раздел «Интересы», выбери настроение — и мы соберём уютную мини-команду.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => router.push('/explore')}
            className="inline-flex items-center justify-center rounded-full border border-brand bg-brand/10 px-6 py-2.5 text-sm font-semibold text-brand-foreground transition hover:-translate-y-0.5 hover:bg-brand/20"
          >
            Выбрать интерес
          </button>
          <button
            onClick={handleResetDemo}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-transparent px-6 py-2.5 text-sm font-medium text-slate-500 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-700 dark:border-white/10 dark:text-slate-300 dark:hover:border-white/30 dark:hover:text-white"
          >
            Сбросить демо-данные
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Шапка кружка */}
      <section className={panelClass}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-foreground">
              Твой кружок
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              {currentCircle.title}
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {currentCircle.description}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 text-sm text-slate-700 dark:text-slate-200">
            <div className="text-right">
              <div>До конца недели: {remainingDays} дн.</div>
              <div>
                В команде сейчас: {currentCircle.membersCount ?? DEFAULT_MEMBERS} человек
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleLeaveCircle}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-transparent px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-700 dark:border-white/10 dark:text-slate-300 dark:hover:border-white/30 dark:hover:text-white"
              >
                Выйти из кружка
              </button>
              <button
                onClick={handleResetDemo}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-transparent px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-700 dark:border-white/10 dark:text-slate-300 dark:hover:border-white/30 dark:hover:text-white"
              >
                Сбросить демо-данные
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Баннер про безопасность */}
      {!safetyAccepted && (
        <section className="rounded-3xl border border-amber-200/80 bg-amber-50/90 p-4 text-sm text-amber-900 shadow-[0_10px_30px_rgba(251,191,36,0.25)] dark:border-amber-400/40 dark:bg-amber-950/60 dark:text-amber-50 sm:p-5">
          <h2 className="text-sm font-semibold">Безопасное общение</h2>
          <p className="mt-2 text-xs sm:text-sm">
            Этот круг — про поддержку и уважение. Чтобы всем было спокойно, помни о
            простых правилах:
          </p>
          <ul className="mt-2 space-y-1 text-xs sm:text-[13px]">
            <li>• не делись телефоном, ссылками на мессенджеры и личными соцсетями;</li>
            <li>• не рассказывай точный адрес, школу, место учёбы или работы;</li>
            <li>
              • если кто-то пишет то, от чего становится страшно или неприятно — можно
              прекратить разговор и рассказать об этом взрослому;
            </li>
            <li>
              • при реальной угрозе жизни и здоровью обращайся в службы помощи в своём
              городе.
            </li>
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={handleAcceptSafety}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-900"
            >
              Понятно, можно общаться
            </button>
            <span className="text-[11px] text-amber-900/80 dark:text-amber-100/80">
              Кнопка просто сохранит, что ты видел правила, и скроет это сообщение.
            </span>
          </div>
        </section>
      )}

      {/* Баннер про завершение недели */}
      {isLastDay && (
        <section className="rounded-3xl border border-violet-300/70 bg-violet-900/40 p-4 text-sm text-violet-50 shadow-[0_18px_50px_rgba(76,29,149,0.7)] sm:p-5">
          <h2 className="text-sm font-semibold sm:text-base">
            Неделя в этом круге почти закончилась 💫
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-violet-100/90 sm:text-sm">
            Спасибо, что был(а) здесь. Даже если ты писал(а) мало — это всё равно часть
            чьей-то спокойной недели. Можно поделиться в чате тем, что запомнилось, или
            просто тихо завершить этот круг.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-violet-100/80">
            Когда будешь готов(а), можно подобрать следующий круг — с новым настроением
            или тем же интересом.
          </p>
          <div className="mt-3">
            <button
              onClick={handleStartNewCircle}
              className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white shadow-[0_14px_36px_rgba(129,140,248,0.8)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_52px_rgba(129,140,248,0.95)]"
            >
              Подобрать новый круг
            </button>
          </div>
        </section>
      )}

      {/* Чат */}
      <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_14px_36px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-950/60 sm:p-6">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Сообщения
        </h2>

        <div
          ref={listRef}
          className="mt-4 max-h-[55vh] space-y-3 overflow-y-auto pr-2"
        >
          {messages.map((msg) => {
            const isMe = msg.role === 'me';
            const isBot = !isMe && msg.id.startsWith('bot-');

            return (
              <div
                key={msg.id}
                className={clsx('flex', isMe ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={clsx(
                    'max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm',
                    isMe
                      ? 'bg-brand text-white'
                      : isBot
                      ? 'bg-slate-50/80 text-slate-800 border border-dashed border-slate-300 dark:bg-slate-900/60 dark:text-slate-100 dark:border-slate-600'
                      : 'bg-slate-50 text-slate-800 dark:bg-slate-900/70 dark:text-slate-100',
                  )}
                >
                  {isBot && (
                    <p className="mb-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      WeekCrew бот (демо)
                    </p>
                  )}
                  <p>{msg.text}</p>
                  <span
                    className={clsx(
                      'mt-2 block text-[11px]',
                      isMe ? 'text-white/80' : 'text-slate-500',
                    )}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })}

          {messages.length === 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Пока здесь пусто. Напиши что-нибудь, чтобы начать разговор.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-2">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={
                safetyAccepted
                  ? isSending
                    ? 'Отправляем…'
                    : 'Напиши что-нибудь...'
                  : 'Сначала прочитай короткие правила выше'
              }
              className="flex-1 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-white/10 dark:bg-slate-900/80 dark:text-white"
              disabled={isSending || !safetyAccepted}
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-2xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(127,90,240,0.25)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!message.trim() || isSending || !safetyAccepted}
            >
              {isSending ? 'Отправка…' : 'Отправить'}
            </button>
          </div>

          {sendError && (
            <p className="text-xs text-red-500 dark:text-red-400">{sendError}</p>
          )}
        </form>
      </section>

      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        Сейчас это демо-режим: сообщения и настройки живут только на этом устройстве.
      </p>
    </div>
  );
}
