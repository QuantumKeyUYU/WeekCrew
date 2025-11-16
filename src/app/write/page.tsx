'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Notice } from '@/components/shared/notice';
import { apiRequest } from '@/lib/api-client';

const MIN_LENGTH = 10;
const MAX_LENGTH = 280;

export default function WritePage() {
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error' | 'rejected'>('idle');
  const [serverMessage, setServerMessage] = useState('');

  const remaining = useMemo(() => MAX_LENGTH - text.length, [text.length]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!text.trim()) {
      return;
    }
    setStatus('submitting');
    setServerMessage('');
    try {
      const response = await apiRequest<{ status: string; message: string }>('/api/v2/messages/create', {
        method: 'POST',
        json: { body: text }
      });
      setStatus(response.status === 'rejected' ? 'rejected' : 'success');
      setServerMessage(response.message);
      if (response.status !== 'rejected') {
        setText('');
      }
    } catch (error) {
      setStatus('error');
      setServerMessage(error instanceof Error ? error.message : 'Неизвестная ошибка.');
    }
  };

  const disabled = text.trim().length < MIN_LENGTH || text.trim().length > MAX_LENGTH || status === 'submitting';

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Напиши маленькую записку о том, как тебе сейчас — от 10 до 280 символов. Всё анонимно и без регистрации.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value.slice(0, MAX_LENGTH))}
          placeholder="Расскажи, что чувствуешь прямо сейчас. Не обязательно красиво — главное честно."
          className="min-h-[220px] w-full rounded-3xl border border-slate-200/80 bg-white/90 p-4 text-base text-slate-900 shadow-[0_12px_32px_rgba(15,23,42,0.08)] outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/40 dark:border-white/10 dark:bg-slate-900/50 dark:text-white"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">Лучше один-два честных абзаца, чем большое эссе.</p>
          <span className={remaining < 0 ? 'text-sm font-semibold text-rose-500' : 'text-sm text-slate-500'}>
            {remaining} символов
          </span>
        </div>
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#6f5be9] via-[#7864ef] to-[#8b78ff] px-6 py-3 text-base font-semibold text-white shadow-[0_12px_30px_rgba(111,91,233,0.28)] ring-1 ring-inset ring-white/40 transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {status === 'submitting' ? 'Отправляем…' : 'Отправить историю'}
        </button>
      </form>
      {status !== 'idle' && serverMessage && (
        <Notice variant={status === 'rejected' || status === 'error' ? 'warning' : 'info'}>{serverMessage}</Notice>
      )}
    </section>
  );
}
