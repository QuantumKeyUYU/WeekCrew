'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { Message } from '@/types';
import clsx from 'clsx';

interface Props {
  messages: Message[];
  currentUserId?: string;
}

export const MessageList = ({ messages, currentUserId }: Props) => {
  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {messages.map((message) => {
          const isOwn = message.authorId === currentUserId;
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
                  {message.authorAlias}
                </div>
                <p className="mt-1 whitespace-pre-wrap leading-snug">{message.content}</p>
                <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-200/60">
                  {(() => {
                    const timestamp = message.createdAt ? new Date(message.createdAt) : new Date();
                    if (Number.isNaN(timestamp.getTime())) {
                      return '—';
                    }
                    return timestamp.toLocaleString('ru-RU', {
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
