'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import clsx from 'clsx';

import type { CircleMessage } from '@/types';
import { AVATAR_PRESETS, DEFAULT_AVATAR_KEY } from '@/constants/avatars';

type Props = {
  circleId: string | null;
  messages: CircleMessage[];
  currentDeviceId: string | null;
  isLoading: boolean;
  preamble?: ReactNode;
  className?: string;
};

const getAvatarEmoji = (key?: string | null) =>
  AVATAR_PRESETS.find((preset) => preset.key === key)?.emoji ?? '🙂';

const formatTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const MessageList = ({
  circleId,
  messages,
  currentDeviceId,
  isLoading,
  preamble,
  className,
}: Props) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Автоскролл к последнему сообщению
  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    // лёгкая задержка, чтобы браузер успел дорендерить
    const id = window.setTimeout(() => {
      node.scrollTo({
        top: node.scrollHeight,
        behavior: 'smooth',
      });
    }, 40);

    return () => window.clearTimeout(id);
  }, [circleId, messages.length, isLoading]);

  const hasMessages = messages.length > 0;

  return (
    <div
      className={clsx(
        'flex h-full flex-col gap-4',
        // общий фон — чистый, без рамок
        'bg-[var(--surface-subtle)]/80',
        'rounded-3xl',
        className,
      )}
    >
      {preamble && (
        <div className="space-y-3 rounded-3xl bg-[var(--surface-elevated)]/80 p-4 shadow-[var(--shadow-soft)]">
          {preamble}
        </div>
      )}

      <div
        ref={scrollRef}
        className={clsx(
          'min-h-0 flex-1 overflow-y-auto',
          'scroll-smooth rounded-3xl',
          'px-2 py-3 sm:px-3 sm:py-4',
        )}
      >
        {!hasMessages && !isLoading && (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-xs text-slate-500 dark:text-slate-400">
            <span>Пока никто не писал.</span>
            <span>Напиши первое сообщение, чтобы начать разговор ✨</span>
          </div>
        )}

        {messages.map((message, index) => {
          const prev = messages[index - 1];
          const isOwn =
            !!message.deviceId && !!currentDeviceId && message.deviceId === currentDeviceId;

          const isSystem = message.isSystem;
          const showAvatar =
            !isSystem &&
            (!prev ||
              prev.isSystem ||
              prev.deviceId !== message.deviceId ||
              // новый блок через 5 минут
              Math.abs(
                new Date(message.createdAt).getTime() -
                  new Date(prev.createdAt).getTime(),
              ) > 5 * 60 * 1000);

          if (isSystem) {
            return (
              <div
                key={message.id}
                className="my-2 flex items-center justify-center text-[11px] text-slate-400 dark:text-slate-500"
              >
                <span className="inline-flex max-w-[80%] items-center rounded-full bg-slate-900/10 px-3 py-1 text-center text-[11px] font-medium dark:bg-slate-50/5">
                  {message.content}
                </span>
              </div>
            );
          }

          const avatarEmoji = getAvatarEmoji(
            (message.author as any)?.avatarKey ?? DEFAULT_AVATAR_KEY,
          );
          const nickname = (message.author as any)?.nickname ?? null;

          return (
            <div
              key={message.id}
              className={clsx(
                'mb-1 flex w-full gap-2 sm:gap-3',
                isOwn ? 'justify-end' : 'justify-start',
              )}
            >
              {/* Аватар только для собеседников, как в Telegram */}
              {!isOwn && (
                <div className="mt-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900/70 text-sm text-white shadow-sm dark:bg-slate-50/10">
                  <span aria-hidden>{avatarEmoji}</span>
                </div>
              )}

              <div
                className={clsx(
                  'flex max-w-[80%] flex-col',
                  isOwn && 'items-end',
                )}
              >
                {nickname && !isOwn && (
                  <span className="mb-0.5 pl-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {nickname}
                  </span>
                )}

                <div
                  className={clsx(
                    'inline-flex rounded-3xl px-4 py-2 text-sm leading-relaxed shadow-md',
                    'transition-transform duration-150 hover:-translate-y-[1px]',
                    isOwn
                      ? 'rounded-br-md bg-gradient-to-r from-sky-500 to-violet-500 text-white shadow-[0_10px_30px_rgba(56,189,248,0.45)]'
                      : 'rounded-bl-md bg-white/95 text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.15)] dark:bg-slate-900/90 dark:text-slate-50',
                  )}
                >
                  <span className="whitespace-pre-wrap break-words">
                    {message.content}
                  </span>
                </div>

                <span
                  className={clsx(
                    'mt-0.5 text-[10px] text-slate-400 dark:text-slate-500',
                    isOwn ? 'pr-1' : 'pl-1',
                  )}
                >
                  {formatTime(message.createdAt)}
                </span>
              </div>

              {/* “Пустой” слот под аватар для выравнивания своих сообщений */}
              {isOwn && <div className="h-8 w-8 shrink-0" />}
            </div>
          );
        })}

        {/* Лоадер внизу, чтобы не мешаться сообщениям */}
        {isLoading && (
          <div className="mt-4 space-y-2">
            {[0, 1, 2].map((key) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={key}
                className={clsx(
                  'flex w-full gap-2 sm:gap-3',
                  key % 2 === 0 ? 'justify-start' : 'justify-end',
                )}
              >
                <div
                  className={clsx(
                    'h-8 w-8 shrink-0 rounded-full bg-slate-900/10 dark:bg-slate-50/10',
                    key % 2 === 0 ? 'block' : 'hidden sm:block',
                  )}
                />
                <div className="flex max-w-[70%] flex-col gap-1">
                  <div className="h-4 rounded-2xl bg-slate-900/5 dark:bg-slate-50/10" />
                  <div className="h-3 w-10 rounded-full bg-slate-900/5 dark:bg-slate-50/10" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
