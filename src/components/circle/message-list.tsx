'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import clsx from 'clsx';

import type { CircleMessage } from '@/types';

interface MessageListProps {
  circleId: string | null;
  messages: CircleMessage[];
  currentDeviceId: string | null;
  isLoading: boolean;
  preamble?: ReactNode;
  className?: string;
}

// простая утилита: один label на день
const formatDateLabel = (iso: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  if (typeof window !== 'undefined' && 'Intl' in window) {
    const today = new Date();
    const diffDays = Math.floor(
      (today.setHours(0, 0, 0, 0) - date.setHours(0, 0, 0, 0)) /
        (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';

    const locale = navigator.language || 'ru-RU';
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
    });
  }

  return date.toISOString().slice(0, 10);
};

const isSameDay = (a: string, b: string) => {
  if (!a || !b) return false;
  const da = new Date(a);
  const db = new Date(b);
  if (Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) return false;
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};

export const MessageList = ({
  circleId,
  messages,
  currentDeviceId,
  isLoading,
  preamble,
  className,
}: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lastCircleRef = useRef<string | null>(circleId);

  // автоскролл в самый низ при загрузке сообщений
  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    // если новый круг — всегда в самый низ
    if (lastCircleRef.current !== circleId) {
      lastCircleRef.current = circleId;
      node.scrollTop = node.scrollHeight;
      return;
    }

    // просто новые сообщения — тоже скроллим (поведение Telegram/WhatsApp)
    node.scrollTop = node.scrollHeight;
  }, [circleId, messages.length]);

  const enhancedMessages = useMemo(() => {
    if (!messages.length) return [];

    return messages
      .slice()
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
  }, [messages]);

  const renderSkeleton = () => (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-2">
          <div className="h-8 w-8 rounded-full bg-slate-200/60 dark:bg-slate-700/70" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/2 rounded-full bg-slate-200/70 dark:bg-slate-700/80" />
            <div className="h-3 w-3/4 rounded-full bg-slate-200/70 dark:bg-slate-700/80" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div
      ref={scrollRef}
      className={clsx(
        'flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain',
        'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-600/40 dark:scrollbar-thumb-slate-500/60',
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 pb-4">
        {/* верхняя подсказка / системный блок */}
        {preamble && (
          <div className="px-1 text-xs text-slate-500 dark:text-slate-300">
            {preamble}
          </div>
        )}

        {isLoading && !enhancedMessages.length && (
          <div className="px-1">{renderSkeleton()}</div>
        )}

        {!isLoading && !enhancedMessages.length && !preamble && (
          <div className="px-1 pt-8 text-center text-xs text-slate-500 dark:text-slate-300">
            Пока сообщений нет — напишите первое ✨
          </div>
        )}

        {/* сами сообщения */}
        <div className="flex flex-col gap-2 px-1 pb-2">
          {enhancedMessages.map((message, index) => {
            const previous = enhancedMessages[index - 1];
            const showDateDivider =
              !previous ||
              !isSameDay(previous.createdAt, message.createdAt);

            const isSelf =
              !!currentDeviceId && message.deviceId === currentDeviceId;
            const isSystem = message.isSystem;

            const createdAt = new Date(message.createdAt);
            const timeLabel =
              !Number.isNaN(createdAt.getTime()) &&
              createdAt.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              });

            return (
              <div key={message.id}>
                {showDateDivider && (
                  <div className="my-3 flex justify-center">
                    <span className="rounded-full bg-slate-900/5 px-3 py-1 text-[11px] font-medium text-slate-500 dark:bg-slate-900/70 dark:text-slate-300">
                      {formatDateLabel(message.createdAt)}
                    </span>
                  </div>
                )}

                {isSystem ? (
                  <div className="mb-1 flex justify-center px-2">
                    <div className="max-w-[80%] rounded-2xl bg-slate-900/5 px-3 py-1.5 text-center text-[11px] text-slate-500 dark:bg-slate-900/60 dark:text-slate-300">
                      {message.content}
                    </div>
                  </div>
                ) : (
                  <div
                    className={clsx(
                      'mb-1 flex w-full gap-2 px-1',
                      isSelf ? 'justify-end' : 'justify-start',
                    )}
                  >
                    {!isSelf && (
                      <div className="mt-5 h-7 w-7 flex-shrink-0 overflow-hidden rounded-full bg-slate-900/10 text-center text-sm leading-[28px] text-slate-500 dark:bg-slate-800 dark:text-slate-200">
                        {message.author?.nickname?.[0]?.toUpperCase() ?? '🙂'}
                      </div>
                    )}

                    <div
                      className={clsx(
                        'max-w-[78%] rounded-3xl px-3 py-2 text-sm leading-relaxed shadow-sm',
                        isSelf
                          ? 'rounded-br-sm bg-gradient-to-br from-indigo-500 to-violet-500 text-white dark:from-indigo-400 dark:to-violet-400'
                          : 'rounded-bl-sm bg-slate-900/5 text-slate-900 dark:bg-slate-800 dark:text-slate-50',
                      )}
                    >
                      {!isSelf && message.author?.nickname && (
                        <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-300">
                          {message.author.nickname}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      {timeLabel && (
                        <p
                          className={clsx(
                            'mt-1 text-[10px]',
                            isSelf
                              ? 'text-white/70'
                              : 'text-slate-400 dark:text-slate-400',
                          )}
                        >
                          {timeLabel}
                        </p>
                      )}
                    </div>

                    {isSelf && (
                      <div className="mt-5 h-7 w-7 flex-shrink-0 overflow-hidden rounded-full bg-indigo-500/80 text-center text-xs font-semibold leading-[28px] text-white dark:bg-indigo-400">
                        Я
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
