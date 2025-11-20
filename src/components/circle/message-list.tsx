'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { AVATAR_PRESETS } from '@/constants/avatars';
import { useTranslation } from '@/i18n/useTranslation';
import { blockUser, sendReport } from '@/lib/api/moderation';
import { useAppStore } from '@/store/useAppStore';
import type { CircleMessage } from '@/types';

interface Props {
  messages: CircleMessage[];
  currentDeviceId?: string | null;
  isLoading?: boolean;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const getAvatarEmoji = (key?: string | null) =>
  AVATAR_PRESETS.find((preset) => preset.key === key)?.emoji ?? '🙂';

export const MessageList = ({ messages, currentDeviceId, isLoading = false }: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastScrollLength = useRef(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewWhileAway, setHasNewWhileAway] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [moderationBusy, setModerationBusy] = useState(false);
  const t = useTranslation();
  const language = useAppStore((state) => state.settings.language ?? 'ru');
  const locale = language === 'ru' ? 'ru-RU' : 'en-US';
  const removeMessagesByUser = useAppStore((state) => state.removeMessagesByUser);
  const user = useAppStore((state) => state.user);
  const blockedUserIds = useAppStore((state) => state.blockedUserIds);
  const blockUserLocally = useAppStore((state) => state.blockUserLocally);

  const dayFormatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
  });

  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const fullTimestampFormatter = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

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
    if (visibleMessages.length > prevLength && !isAtBottom) {
      setHasNewWhileAway(true);
    }
    if (!node) {
      lastScrollLength.current = visibleMessages.length;
      return;
    }
    const last = node.lastElementChild as HTMLElement | null;
    if (isAtBottom && last) {
      const behavior = prevLength > 0 ? 'smooth' : 'auto';
      last.scrollIntoView({ behavior, block: 'end' });
    }
    lastScrollLength.current = visibleMessages.length;
    setMenuFor(null);
  }, [isAtBottom, visibleMessages]);

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
    lastScrollLength.current = visibleMessages.length;
    setIsAtBottom(true);
    setHasNewWhileAway(false);
  }, [visibleMessages.length]);

  const handleReport = async (message: CircleMessage) => {
    if (moderationBusy) return;
    const targetId = message.author?.id;
    if (!targetId || message.isSystem || user?.id === targetId) {
      return;
    }
    setModerationBusy(true);
    setActionFeedback(null);
    try {
      await sendReport({ targetUserId: targetId, circleId: message.circleId, messageId: message.id });
      setActionFeedback('Жалоба отправлена. Спасибо, что помогаете сохранять уют');
    } catch (error) {
      console.error(error);
      setActionFeedback('Не удалось отправить жалобу');
    } finally {
      setModerationBusy(false);
      setMenuFor(null);
    }
  };

  const handleBlock = async (message: CircleMessage) => {
    if (moderationBusy) return;
    const targetId = message.author?.id;
    if (!targetId || message.isSystem || user?.id === targetId) {
      return;
    }
    setModerationBusy(true);
    setActionFeedback(null);
    try {
      await blockUser({ targetUserId: targetId });
      blockUserLocally(targetId);
      removeMessagesByUser(targetId);
      setActionFeedback('Пользователь скрыт, его сообщения больше не будут показываться');
    } catch (error) {
      console.error(error);
      setActionFeedback('Не удалось выполнить действие');
    } finally {
      setModerationBusy(false);
      setMenuFor(null);
    }
  };

  const visibleMessages = useMemo(
    () =>
      messages.filter((message) => {
        const authorId = message.author?.id;
        if (!authorId) return true;
        return !blockedUserIds.includes(authorId);
      }),
    [blockedUserIds, messages],
  );

  if (isLoading && visibleMessages.length === 0) {
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

  if (visibleMessages.length === 0) {
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
      className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1 sm:max-h-[520px] sm:pr-2"
      aria-live="polite"
      aria-busy={isLoading}
    >
      {visibleMessages.map((message, index) => {
        const isOwn = message.deviceId === currentDeviceId;
        const isSystem = Boolean(message.isSystem);
        const authorName = isSystem
          ? t('messages_author_system')
          : message.author?.nickname
          ? message.author.nickname
          : isOwn
          ? t('messages_you_label')
          : 'Участник';
        const createdAt = new Date(message.createdAt);
        const timeLabel = timeFormatter.format(createdAt);
        const fullTimestamp = fullTimestampFormatter.format(createdAt);
        const previous = visibleMessages[index - 1];
        const currentDayKey = createdAt.toDateString();
        const previousDayKey = previous ? new Date(previous.createdAt).toDateString() : null;
        const showDayDivider = currentDayKey !== previousDayKey;
        const canModerate = Boolean(message.author?.id && !isOwn && !isSystem);
        const avatarEmoji = getAvatarEmoji(message.author?.avatarKey);

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

            <div className={clsx('flex', isOwn ? 'justify-end' : 'justify-start')}>
              <article
                className={clsx(
                  'relative max-w-[85%] rounded-3xl border px-4 py-3 text-sm shadow-sm backdrop-blur',
                  isSystem
                    ? 'border-slate-200 bg-slate-50/90 text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100'
                    : isOwn
                    ? 'border-brand/70 bg-brand text-white shadow-soft'
                    : 'border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100',
                )}
              >
                {isSystem ? (
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
                    <span aria-label={authorName}>{authorName}</span>
                    <time dateTime={message.createdAt} title={fullTimestamp}>
                      {timeLabel}
                    </time>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/40 text-lg shadow-inner shadow-black/5 dark:bg-white/10">
                        {avatarEmoji}
                      </span>
                      <div className="leading-tight">
                        <p
                          className={clsx(
                            'text-sm font-semibold',
                            isOwn ? 'text-white' : 'text-slate-700 dark:text-slate-100',
                          )}
                        >
                          {authorName}
                        </p>
                        <time
                          dateTime={message.createdAt}
                          title={fullTimestamp}
                          className={clsx(
                            'text-xs',
                            isOwn ? 'text-white/70' : 'text-slate-500 dark:text-slate-400',
                          )}
                        >
                          {timeLabel}
                        </time>
                      </div>
                    </div>
                    {canModerate && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setMenuFor((prev) => (prev === message.id ? null : message.id))}
                          className="rounded-full bg-white/50 px-2 py-1 text-xs font-semibold text-slate-600 shadow hover:bg-white/90 dark:bg-slate-800/60 dark:text-slate-200"
                          aria-label="Действия"
                        >
                          ⋯
                        </button>
                        {menuFor === message.id && (
                          <div className="absolute right-0 top-8 z-10 w-44 rounded-2xl border border-slate-200/80 bg-white/95 p-2 text-left text-sm shadow-xl dark:border-white/10 dark:bg-slate-900/95">
                            <button
                              type="button"
                              onClick={() => handleReport(message)}
                              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-slate-700 transition hover:bg-slate-100 disabled:opacity-60 dark:text-slate-100 dark:hover:bg-slate-800/70"
                              disabled={moderationBusy}
                            >
                              <span>Пожаловаться</span>
                              <span aria-hidden>⚠️</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleBlock(message)}
                              className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-rose-700 transition hover:bg-rose-50 disabled:opacity-60 dark:text-rose-200 dark:hover:bg-rose-500/10"
                              disabled={moderationBusy}
                            >
                              <span>Скрыть пользователя</span>
                              <span aria-hidden>🚫</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <p className="mt-3 whitespace-pre-wrap leading-snug text-base/[1.45] text-current">
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
      {isLoading && visibleMessages.length > 0 && (
        <div className="flex justify-center pb-2 text-xs text-slate-400 dark:text-slate-500">
          {t('messages_loading_state')}
        </div>
      )}
      {actionFeedback && (
        <div className="sticky bottom-2 flex justify-start text-xs text-slate-500 dark:text-slate-300">
          <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm dark:bg-slate-800/70">{actionFeedback}</span>
        </div>
      )}
    </div>
  );
};
