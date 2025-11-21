'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { CircleMessage, MessageReaction } from '@/types';

interface MessageBubbleProps {
  message: CircleMessage;
  isOwn?: boolean;
  reactions?: MessageReaction[];
  onReact?: (messageId: string, emoji: string) => void;
}

export function MessageBubble({ message, isOwn, reactions, onReact }: MessageBubbleProps) {
  const initials = message.author?.nickname?.slice(0, 1)?.toUpperCase() ?? '👤';
  const sender = message.author?.nickname ?? 'Ghost';
  const timestamp = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const reactionCounts = (reactions ?? []).reduce<Record<string, number>>((acc, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] ?? 0) + 1;
    return acc;
  }, {});

  const availableEmojis = ['👍', '🔥', '😊'];

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={clsx('group flex gap-3', isOwn ? 'flex-row-reverse' : 'flex-row')}
    >
      <div
        className={clsx(
          'grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-sm font-semibold text-white shadow-lg shadow-black/30 ring-1 ring-white/10',
          isOwn && 'bg-purple-500 text-white ring-purple-300/60',
        )}
        aria-hidden
      >
        {initials}
      </div>
      <div className={clsx('space-y-2', isOwn ? 'items-end text-right' : 'items-start text-left')}>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-400">
          <span className="font-semibold text-white/80">{sender}</span>
          <span className="text-slate-500">•</span>
          <time className="text-[11px] text-slate-400" dateTime={message.createdAt}>
            {timestamp}
          </time>
        </div>
        <div
          className={clsx(
            'max-w-xl rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-2xl shadow-black/25 ring-1 ring-white/5 backdrop-blur',
            isOwn
              ? 'bg-gradient-to-r from-purple-500 via-indigo-500 to-sky-500 text-white'
              : 'bg-white/5 text-slate-100',
          )}
        >
          {message.content}
        </div>
        <div className={clsx('flex flex-wrap items-center gap-2', isOwn ? 'justify-end' : 'justify-start')}>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[11px] text-slate-400 ring-1 ring-white/10">
            <span aria-hidden>⌚</span>
            <time className="text-[11px]" dateTime={message.createdAt}>
              {timestamp}
            </time>
          </div>
          {Object.entries(reactionCounts).map(([emoji, count]) => (
            <span
              key={`${message.id}-${emoji}`}
              className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[11px] text-white ring-1 ring-white/15"
            >
              <span aria-hidden>{emoji}</span>
              <span>{count}</span>
            </span>
          ))}
        </div>
        {onReact && (
          <div className={clsx('flex items-center gap-2 text-xs text-slate-500', isOwn ? 'justify-end' : 'justify-start')}>
            {availableEmojis.map((emoji) => (
              <button
                type="button"
                key={`${message.id}-${emoji}`}
                onClick={() => onReact(message.id, emoji)}
                className="rounded-full bg-white/5 px-2 py-1 text-[12px] text-slate-200 transition hover:bg-white/10"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.li>
  );
}
