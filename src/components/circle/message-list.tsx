'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CircleMessage } from '@/types';
import clsx from 'clsx';
import { useTranslation } from '@/i18n/useTranslation';
import { useAppStore } from '@/store/useAppStore';

interface Props {
  messages: CircleMessage[];
  currentDeviceId?: string | null;
  isLoading?: boolean;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const MessageList = ({ messages, currentDeviceId, isLoading = false }: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastScrollLength = useRef(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewWhileAway, setHasNewWhileAway] = useState(false);
  const t = useTranslation();
  const language = useAppStore((state) => state.settings.language ?? 'ru');
  const locale = language === 'ru' ? 'ru-RU' : 'en-US';

  const dayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'long',
      }),
    [locale],
  );

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
      }),
    [locale],
  );

  const fullTimestampFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [locale],
  );

  const getDayChipLabel = (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((startOfDay.getTime() - today.getTime()) / DAY_IN_MS);
    if (diffDays === 0) {
      return t('messages_day_today');
    }
    if (diffDays === -1) {
      return t('messages_day_yesterday');
    }
    return dayFormatter.format(date);
  };

  useEffect(() => {
    const prevLength = lastScrollLength.current;
    const node = containerRef.current;
    if (messages.length > prevLength && !isAtBottom) {
      setHasNewWhileAway(true);
    }
    if (!node) {
      lastScrollLength.current = messages.length;
      return;
    }
    const last = node.lastElementChild as HTMLElement | null;
    if (isAtBottom && last) {
      const behavior = prevLength > 0 ? 'smooth' : 'auto';
      last.scrollIntoView({ behavior, block: 'end' });
    }
    lastScrollLength.current = messages.length;
  }, [isAtBottom, messages]);

  const handleScroll = useCallback(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }
    const THRESHOLD = 16;
    const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - THRESHOLD;
    setIsAtBottom(atBottom);
    if (atBottom) {
      setHasNewWhileAway(false);
    }
  }, []);

  const handleScrollToBottom = useCallback(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }
    node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
    lastScrollLength.current = messages.length;
    setIsAtBottom(true);
    setHasNewWhileAway(false);
  }, [messages.length]);

  if (isLoading && messages.length === 0) {
    return (
      <div
        className="rounded-2xl border border-dashed border-slate-200/80 bg-white/70 p-6 text-center text-sm text-slate-500 shadow-sm dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300"
        role="status"
        aria-live="polite"
      >
        <p>{t('messages_loading_state')}</p>
        <div className="mt-4 space-y-2">
          <div className="mx-auto h-2.5 w-2/3 rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
          <div className="mx-auto h-2.5 w-1/2 rounded-full bg-slate-200/70 dark:bg-slate-700/60" />
          <div className="mx-auto h-2.5 w-3/4 rounded-full bg-slate-200/60 dark:bg-slate-700/50" />
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 text-center text-sm text-slate-500 shadow-sm dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-300">
        {t('messages_empty_state')}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex max-h-[420px] flex-col gap-4 overflow-y-auto pr-1 sm:pr-2"
      aria-live="polite"
      aria-busy={isLoading}
    >
      {messages.map((message, index) => {
        const isOwn = message.deviceId === currentDeviceId;
        const isSystem = Boolean(message.isSystem);
        const authorLabel = isSystem
          ? t('messages_author_system')
          : isOwn
          ? t('messages_you_label')
          : t('messages_author_unknown');
        const createdAt = new Date(message.createdAt);
        const timeLabel = timeFormatter.format(createdAt);
        const fullTimestamp = fullTimestampFormatter.format(createdAt);
        const previous = messages[index - 1];
        const currentDayKey = createdAt.toDateString();
        const previousDayKey = previous ? new Date(previous.createdAt).toDateString() : null;
        const showDayDivider = currentDayKey !== previousDayKey;

        return (
          <div key={message.id} className="flex flex-col gap-3">
            {showDayDivider && (
              <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                <div className="rounded-full border border-slate-200/80 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-800/70 dark:text-slate-100">
                  {getDayChipLabel(createdAt)}
                </div>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              </div>
            )}

            <div className={clsx('flex transition-opacity duration-200', isOwn ? 'justify-end' : 'justify-start')}>
              <article
                className={clsx(
                  'max-w-[85%] rounded-3xl border px-4 py-3 text-sm shadow-sm backdrop-blur transition-transform duration-200',
                  isSystem
                    ? 'border-slate-200 bg-slate-50/90 text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100'
                    : isOwn
                    ? 'border-brand/70 bg-brand text-white shadow-soft'
                    : 'border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100',
                )}
              >
                <div
                  className={clsx(
                    'flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide',
                    isSystem
                      ? 'text-slate-500 dark:text-slate-200'
                      : isOwn
                      ? 'text-white/80'
                      : 'text-slate-500 dark:text-slate-300',
                  )}
                >
                  <span aria-label={authorLabel}>{authorLabel}</span>
                  <time dateTime={message.createdAt} title={fullTimestamp}>
                    {timeLabel}
                  </time>
                </div>
                <p className="mt-2 whitespace-pre-wrap leading-snug text-base/[1.45] text-current">
                  {message.content}
                </p>
              </article>
            </div>
          </div>
        );
      })}
      {(!isAtBottom || hasNewWhileAway) && (
        <button
          type="button"
          onClick={handleScrollToBottom}
          className="sticky bottom-2 mt-2 inline-flex self-end items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-black/30 backdrop-blur transition hover:bg-slate-900 mr-1 sm:mr-2"
          aria-label={hasNewWhileAway ? t('messages_scroll_new') : t('messages_scroll_bottom')}
        >
          <span>{hasNewWhileAway ? t('messages_scroll_new_short') : t('messages_scroll_bottom_short')}</span>
          <span aria-hidden="true">↓</span>
        </button>
      )}
      {isLoading && messages.length > 0 && (
        <div className="flex justify-center pb-2 text-xs text-slate-400 dark:text-slate-500">
          {t('messages_loading_state')}
        </div>
      )}
    </div>
  );
};
