'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { CircleMessage } from '@/types';
import clsx from 'clsx';
import { useTranslation } from '@/i18n/useTranslation';
import { useAppStore } from '@/store/useAppStore';

interface Props {
  messages: CircleMessage[];
  currentDeviceId?: string;
}

export const MessageList = ({ messages, currentDeviceId }: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const t = useTranslation();
  const language = useAppStore((state) => state.settings.language ?? 'ru');
  const locale = language === 'ru' ? 'ru-RU' : 'en-US';

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const last = containerRef.current.lastElementChild as HTMLElement | null;
    if (last) {
      last.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
        {t('messages_empty_state')}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {messages.map((message) => {
          const isOwn = message.authorDeviceId === currentDeviceId;
          return (
            <motion.div
              key={message.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={clsx('flex', isOwn ? 'justify-end' : 'justify-start')}
            >
              <div
                className={clsx(
                  'max-w-[80%] rounded-2xl border px-4 py-3 text-sm shadow-lg shadow-black/20 backdrop-blur',
                  isOwn
                    ? 'border-brand/50 bg-brand/90 text-slate-950'
                    : 'border-white/10 bg-slate-900/70 text-slate-100'
                )}
              >
                <div className="text-xs uppercase tracking-wide text-slate-200/70">
                  {message.authorAlias ?? t('messages_author_unknown')}
                </div>
                <p className="mt-1 whitespace-pre-wrap leading-snug">{message.text}</p>
                <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-200/60">
                  {(() => {
                    const date = message.createdAt?.toDate?.();
                    if (!date) {
                      return '—';
                    }
                    return date.toLocaleString(locale, {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: 'short'
                    });
                  })()}
                </p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
