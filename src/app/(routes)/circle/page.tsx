'use client';

import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useWeekcrewSnapshot, useWeekcrewStorage } from '@/lib/weekcrewStorage';
import { CircleEmptyState } from '@/components/circle/empty-state';
import { motionTimingClass, primaryCtaClass } from '@/styles/tokens';
import { useTranslation } from '@/i18n/useTranslation';

const panelClass =
  'rounded-[2.5rem] border border-white/10 bg-slate-950/70 p-5 text-slate-50 shadow-[0_28px_80px_rgba(3,5,20,0.85)] sm:p-7';

const DAYS_FALLBACK = 7;
const DEFAULT_MEMBERS = 6;
const SAFETY_KEY = 'weekcrew:safety-accepted-v2';

export default function CirclePage() {
  const router = useRouter();
  const storage = useWeekcrewStorage();
  const t = useTranslation();

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
    return <CircleEmptyState onReset={handleResetDemo} />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Шапка кружка */}
      <section className={panelClass}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand/80">{t('circle_header_topic_label')}</p>
            <h1 className="text-2xl font-semibold text-white">{currentCircle.title}</h1>
            <p className="text-sm text-white/70">{currentCircle.description}</p>
          </div>
          <div className="flex flex-col gap-3 text-xs text-white/70">
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 font-medium text-white">
                {remainingDays} дн. до финала
              </span>
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 font-medium text-white/90">
                {currentCircle.membersCount ?? DEFAULT_MEMBERS} участников
              </span>
            </div>
            <p>{t('circle_header_hint')}</p>
            <div className="flex flex-wrap gap-2 text-sm text-white/80">
              <button
                onClick={handleLeaveCircle}
                className={clsx(
                  'inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-1.5',
                  motionTimingClass,
                  'hover:-translate-y-0.5 hover:border-white/40',
                )}
              >
                Выйти из круга
              </button>
              <button
                onClick={handleStartNewCircle}
                className={clsx(
                  'inline-flex items-center justify-center rounded-full border border-brand/50 px-4 py-1.5 text-brand-foreground',
                  motionTimingClass,
                  'hover:-translate-y-0.5 hover:border-brand hover:text-white',
                )}
              >
                Сменить настроение
              </button>
              <button
                onClick={handleResetDemo}
                className={clsx(
                  'inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-1.5 text-white/70',
                  motionTimingClass,
                  'hover:-translate-y-0.5 hover:text-white',
                )}
              >
                Сбросить демо
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
        <section className="rounded-3xl border border-violet-400/40 bg-gradient-to-br from-violet-900/60 to-slate-900/60 p-5 text-sm text-white shadow-[0_22px_60px_rgba(59,7,100,0.65)]">
          <h2 className="text-base font-semibold">{t('circle_last_week_title')}</h2>
          <p className="mt-2 text-sm text-white/80">{t('circle_last_week_description')}</p>
          <p className="mt-2 text-sm text-white/70">{t('circle_last_week_hint')}</p>
          <div className="mt-4">
            <button onClick={handleStartNewCircle} className={primaryCtaClass}>
              {t('circle_last_week_cta')}
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
