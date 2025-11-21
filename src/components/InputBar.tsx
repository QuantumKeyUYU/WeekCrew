'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { KeyboardEvent, RefObject } from 'react';

interface InputBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  isSending?: boolean;
  supportingText?: string | null;
  errorText?: string | null;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  textareaRef?: RefObject<HTMLTextAreaElement>;
}

export function InputBar({
  value,
  onChange,
  onSubmit,
  placeholder,
  disabled,
  isSending,
  supportingText,
  errorText,
  onKeyDown,
  textareaRef,
}: InputBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.3)] backdrop-blur"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={1}
          className={clsx(
            'flex-1 min-h-[96px] resize-none rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-white shadow-inner shadow-black/40 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-300/40 disabled:opacity-60',
          )}
          disabled={disabled}
          aria-label={placeholder}
          onKeyDown={onKeyDown}
          ref={textareaRef}
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_46px_rgba(99,102,241,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(99,102,241,0.5)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span aria-hidden>{isSending ? '⌛' : '🚀'}</span>
          <span>{isSending ? 'Sending…' : 'Send'}</span>
        </button>
      </div>
      {supportingText && !errorText && (
        <p className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <span className="text-sm" aria-hidden>
            •
          </span>
          <span>{supportingText}</span>
        </p>
      )}
      {errorText && (
        <p
          className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-red-500/10 px-3 py-2 text-xs text-red-100 ring-1 ring-red-500/40"
          role="status"
        >
          <span aria-hidden>⚠️</span>
          <span>{errorText}</span>
        </p>
      )}
    </motion.div>
  );
}
