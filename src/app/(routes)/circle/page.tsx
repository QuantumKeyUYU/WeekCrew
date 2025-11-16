'use client';

import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { INTERESTS } from '@/constants/interests';
import { useWeekcrewStore } from '@/store/weekcrew';
import { useTranslation } from '@/i18n/useTranslation';
import { useAppStore } from '@/store/useAppStore';
import { Notice } from '@/components/shared/notice';

const panelClass =
  'rounded-3xl border border-slate-200/80 bg-[#fefcff] p-4 shadow-[0_14px_36px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-950/60 sm:p-6';

const skeletonLines = [0, 1, 2];

export default function CirclePage() {
  const router = useRouter();
  const t = useTranslation();
  const locale = useAppStore((state) => state.settings.language ?? 'ru');
  const mode = useWeekcrewStore((state) => state.mode);
  const selectedInterest = useWeekcrewStore((state) => state.selectedInterest);
  const membersCount = useWeekcrewStore((state) => state.membersCount);
  const endsAt = useWeekcrewStore((state) => state.endsAt);
  const messages = useWeekcrewStore((state) => state.messages);
  const finishMatching = useWeekcrewStore((state) => state.finishMatching);
  const postMessage = useWeekcrewStore((state) => state.postMessage);
  const [message, setMessage] = useState('');
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mode !== 'matching') {
      return;
    }
    const timeout = window.setTimeout(() => {
      finishMatching();
    }, 3500);
    return () => window.clearTimeout(timeout);
  }, [mode, finishMatching]);

  useEffect(() => {
    if (!listRef.current) {
      return;
    }
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const interestDefinition = useMemo(
    () => INTERESTS.find((interest) => interest.id === selectedInterest),
    [selectedInterest]
  );

  const remainingDays = useMemo(() => {
    if (!endsAt) {
      return DAYS_FALLBACK;
    }
    const diff = new Date(endsAt).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(days, 0);
  }, [endsAt]);

  const interestTitle = interestDefinition ? t(interestDefinition.labelKey) : t('circle_header_default_title');

  const formatDays = (value: number) => {
    const safeValue = Math.max(value, 0);
    if (locale === 'ru') {
      const mod10 = safeValue % 10;
      const mod100 = safeValue % 100;
      let suffix = 'дней';
      if (mod10 === 1 && mod100 !== 11) {
        suffix = 'день';
      } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
        suffix = 'дня';
      }
      return `${safeValue} ${suffix}`;
    }
    return safeValue === 1 ? `${safeValue} day` : `${safeValue} days`;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim()) {
      return;
    }
    postMessage(message);
    setMessage('');
  };

  if (mode === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-dashed border-slate-300/80 bg-white/90 p-6 text-center text-slate-700 shadow-[0_12px_34px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200 sm:p-10">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{t('circle_empty_title')}</h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{t('circle_empty_description')}</p>
        </div>
        <button
          onClick={() => router.push('/explore')}
          className="inline-flex items-center justify-center rounded-full border border-brand bg-brand/10 px-6 py-2.5 text-sm font-semibold text-brand-foreground transition hover:-translate-y-0.5 hover:bg-brand/20"
        >
          {t('circle_empty_cta')}
        </button>
      </div>
    );
  }

  if (mode === 'matching') {
    return (
      <section className={panelClass} aria-live="polite">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-foreground">{t('circle_matching_label')}</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{t('circle_matching_title')}</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t('circle_matching_description')}</p>
        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-slate-200/60 dark:bg-slate-800/60">
          <div className="h-full w-1/2 animate-[pulse_1.5s_ease-in-out_infinite] rounded-full bg-brand" aria-hidden="true" />
        </div>
        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('circle_matching_progress')}</p>
        <div className="mt-4 space-y-3" aria-hidden="true">
          {skeletonLines.map((line) => (
            <div key={line} className="h-4 w-full animate-pulse rounded-full bg-slate-200/70 dark:bg-slate-800/70" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className={panelClass}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-foreground">{t('circle_header_active_label')}</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{interestTitle}</h1>
          </div>
          <div className="flex flex-col gap-1 text-sm text-slate-700 dark:text-slate-200">
            <span>{t('circle_header_time_left', { value: formatDays(remainingDays) })}</span>
            <span>{t('circle_header_members', { count: membersCount || DEFAULT_MEMBERS })}</span>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_14px_36px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-950/60 sm:p-6">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t('circle_feed_title')}</h2>
        <div ref={listRef} className="mt-4 max-h-[55vh] space-y-3 overflow-y-auto pr-1">
          {messages.map((msg) => (
            <div key={msg.id} className={clsx('flex', msg.author === 'me' ? 'justify-end' : 'justify-start')}>
              <div
                className={clsx(
                  'max-w-[85%] rounded-2xl border px-4 py-3 text-sm shadow-sm sm:max-w-[75%]',
                  msg.author === 'me'
                    ? 'border-brand/50 bg-brand/90 text-white'
                    : 'border-slate-200/70 bg-slate-50 text-slate-800 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100'
                )}
              >
                <p>{msg.text}</p>
                <span className={clsx('mt-2 block text-[11px]', msg.author === 'me' ? 'text-white/80' : 'text-slate-500')}>
                  {new Date(msg.createdAt).toLocaleTimeString(locale === 'ru' ? 'ru-RU' : 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
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
            aria-label={t('composer_label')}
            placeholder={t('composer_placeholder')}
            className="flex-1 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-white/10 dark:bg-slate-900/80 dark:text-white"
          />
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(127,90,240,0.25)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            disabled={!message.trim()}
          >
            {t('composer_submit')}
          </button>
        </form>
      </section>

      <Notice>
        <p className="text-sm text-slate-700 dark:text-slate-100">{t('circle_demo_hint')}</p>
      </Notice>
    </div>
  );
}

const DAYS_FALLBACK = 7;
const DEFAULT_MEMBERS = 6;
