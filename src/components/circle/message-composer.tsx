'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { sendMessage } from '@/lib/messages';
import type { Circle } from '@/types';
import { useAppStore } from '@/store/useAppStore';

interface Props {
  circle: Circle;
  disabled?: boolean;
  disabledReason?: string;
  prefill?: string;
  onPrefillConsumed?: () => void;
}

export const MessageComposer = ({ circle, disabled, disabledReason, prefill, onPrefillConsumed }: Props) => {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const user = useAppStore((state) => state.user);
  const device = useAppStore((state) => state.device);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (prefill) {
      setText(prefill);
      requestAnimationFrame(() => textareaRef.current?.focus());
      onPrefillConsumed?.();
    }
  }, [prefill, onPrefillConsumed]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!text.trim() || !device) {
      return;
    }
    try {
      setIsSending(true);
      setSendError(null);
      await sendMessage({
        circleId: circle.id,
        authorDeviceId: device.deviceId,
        text: text.trim(),
        authorAlias: user?.nickname ?? 'Участник'
      });
      setText('');
    } catch (error) {
      console.error('Message send failed', error);
      const message = error instanceof Error ? error.message : 'Не удалось отправить сообщение.';
      setSendError(message);
    } finally {
      setIsSending(false);
    }
  };

  const isSubmitDisabled = disabled || isSending || !text.trim();

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-950/60 p-4">
      <label className="text-sm font-medium text-slate-200" htmlFor="message">
        Поделиться в кружке
      </label>
      <textarea
        id="message"
        name="message"
        ref={textareaRef}
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={3}
        placeholder={disabled ? disabledReason : 'Расскажи, что радует сегодня...'}
        disabled={disabled}
        className="w-full rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-slate-900/30"
      />
      <button
        type="submit"
        disabled={isSubmitDisabled}
        className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-2 text-sm font-medium text-slate-950 transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50"
      >
        {isSending ? 'Отправляем...' : 'Отправить'}
      </button>
      {sendError && <p className="text-xs text-red-300">{sendError}</p>}
      {disabled && disabledReason && (
        <p className="text-xs text-slate-400">{disabledReason}</p>
      )}
    </form>
  );
};
