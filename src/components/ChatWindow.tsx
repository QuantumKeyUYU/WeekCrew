'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import type { FormEvent, KeyboardEvent, RefObject } from 'react';
import type { CircleMessage, MessageReaction } from '@/types';
import { MessageBubble } from './MessageBubble';
import { InputBar } from './InputBar';

interface ChatWindowProps {
  messages: CircleMessage[];
  reactions?: Record<string, MessageReaction[]>;
  typing?: { nickname?: string | null; deviceId: string | null }[];
  currentDeviceId: string | null;
  composerValue: string;
  onComposerChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSendClick: () => void;
  placeholder: string;
  isSending: boolean;
  disabled: boolean;
  loading?: boolean;
  headerLabel?: string;
  supportingText?: string | null;
  errorText?: string | null;
  preamble?: string | null;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  textareaRef?: RefObject<HTMLTextAreaElement>;
  onReact?: (messageId: string, emoji: string) => void;
}

export function ChatWindow({
  messages,
  reactions,
  typing,
  currentDeviceId,
  composerValue,
  onComposerChange,
  onSubmit,
  onSendClick,
  placeholder,
  isSending,
  disabled,
  loading,
  headerLabel,
  supportingText,
  errorText,
  preamble,
  onKeyDown,
  textareaRef,
  onReact,
}: ChatWindowProps) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="relative flex flex-1 min-h-0 flex-col gap-4 rounded-[32px] border border-white/10 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-5 text-white shadow-[0_28px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/5">
      <div className="flex items-center justify-between gap-3 rounded-3xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Live circle</p>
          <p className="text-lg font-semibold text-white">{headerLabel ?? 'WeekCrew Circle'}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-purple-100 ring-1 ring-purple-300/50">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(74,222,128,0.18)]" aria-hidden />
          Live
        </div>
      </div>

      <div className="relative flex-1 min-h-0 overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-b from-white/5 via-slate-900/40 to-slate-950/60 p-4 ring-1 ring-white/10">
        <div ref={listRef} className="absolute inset-0 overflow-y-auto px-1 pb-16">
          {preamble && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className="mb-4 rounded-3xl bg-white/5 px-4 py-3 text-sm text-slate-200 ring-1 ring-white/10"
            >
              {preamble}
            </motion.div>
          )}
          <ul className="space-y-4">
            {loading && (
              <div className="animate-pulse space-y-3 rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="h-4 rounded-full bg-white/10" />
                <div className="h-4 w-3/4 rounded-full bg-white/10" />
              </div>
            )}
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.deviceId && currentDeviceId ? message.deviceId === currentDeviceId : false}
                  reactions={reactions?.[message.id]}
                  onReact={onReact}
                />
              ))}
            </AnimatePresence>
            {typing && typing.length > 0 && (
              <motion.li
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 text-xs text-slate-200 ring-1 ring-white/10"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(74,222,128,0.18)]" aria-hidden />
                <span className="animate-pulse">{typing[typing.length - 1]?.nickname ?? 'Участник'} печатает…</span>
              </motion.li>
            )}
          </ul>
        </div>
      </div>

      <form onSubmit={onSubmit} className="sticky bottom-0">
        <InputBar
          value={composerValue}
          onChange={onComposerChange}
          onSubmit={onSendClick}
          placeholder={placeholder}
          disabled={disabled}
          isSending={isSending}
          supportingText={supportingText}
          errorText={errorText}
          onKeyDown={onKeyDown}
          textareaRef={textareaRef}
        />
      </form>
    </div>
  );
}
