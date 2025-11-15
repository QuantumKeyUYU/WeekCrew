'use client';

import { FormEvent, useState } from 'react';
import { sendMessage } from '@/lib/messages';
import type { Circle } from '@/types';
import { useAppStore } from '@/store/useAppStore';

interface Props {
  circle: Circle;
}

export const MessageComposer = ({ circle }: Props) => {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const user = useAppStore((state) => state.user);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!text.trim() || !user) {
      return;
    }
    try {
      setIsSending(true);
      await sendMessage({
        circleId: circle.id,
        authorId: user.id,
        authorAlias: user.nickname || 'Ты',
        content: text.trim(),
        type: 'text'
      });
      setText('');
    } catch (error) {
      console.error('Message send failed', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-950/60 p-4">
      <label className="text-sm font-medium text-slate-200" htmlFor="message">
        Поделиться в кружке
      </label>
      <textarea
        id="message"
        name="message"
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={3}
        placeholder="Расскажи, что радует сегодня..."
        className="w-full rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand"
      />
      <button
        type="submit"
        disabled={isSending || !text.trim()}
        className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-2 text-sm font-medium text-slate-950 transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50"
      >
        {isSending ? 'Отправляем...' : 'Отправить'}
      </button>
    </form>
  );
};
