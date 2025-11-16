'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Notice } from '@/components/shared/notice';
import { apiRequest } from '@/lib/api-client';
import type { MessageDTO } from '@/types';

const MIN_LENGTH = 20;
const MAX_LENGTH = 400;

export default function SupportPage() {
  const [message, setMessage] = useState<MessageDTO | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'empty' | 'ready' | 'sent'>('loading');
  const [responseText, setResponseText] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackVariant, setFeedbackVariant] = useState<'info' | 'warning'>('info');
  const [submitting, setSubmitting] = useState(false);

  const fetchMessage = useCallback(async () => {
    setStatus('loading');
    setFeedback('');
    setResponseText('');
    try {
      const data = await apiRequest<{ message: MessageDTO | null }>('/api/v2/messages/random');
      if (!data.message) {
        setMessage(null);
        setStatus('empty');
        return;
      }
      setMessage(data.message);
      setStatus('ready');
    } catch (error) {
      setStatus('error');
      setMessage(null);
      setFeedback(error instanceof Error ? error.message : 'Неизвестная ошибка.');
      setFeedbackVariant('warning');
    }
  }, []);

  useEffect(() => {
    fetchMessage();
  }, [fetchMessage]);

  const remaining = useMemo(() => MAX_LENGTH - responseText.length, [responseText.length]);

  const handleSubmit = async () => {
    if (!message || submitting) {
      return;
    }
    setSubmitting(true);
    setFeedback('');
    try {
      const response = await apiRequest<{ message: string }>('/api/v2/responses/create', {
        method: 'POST',
        json: { body: responseText, messageId: message.id }
      });
      setFeedback(response.message);
      setFeedbackVariant('info');
      setStatus('sent');
      await fetchMessage();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Неизвестная ошибка.');
      setFeedbackVariant('warning');
    } finally {
      setSubmitting(false);
    }
  };

  const disabled = responseText.trim().length < MIN_LENGTH || responseText.trim().length > MAX_LENGTH || submitting;

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Поддержать</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Здесь появляются истории людей, у которых день вышел сложнее, чем хотелось бы. Выбери одну историю и ответь на неё
          несколькими тёплыми фразами.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Не нужно быть психологом — достаточно быть внимательным человеком. Представь, что это написал знакомый, и ответь так, как
          написал бы ему.
        </p>
      </div>

      {status === 'error' && (
        <Notice variant="warning">
          Сейчас не получается загрузить истории. Возможно, сервер недоступен. Попробуй обновить страницу чуть позже.
        </Notice>
      )}

      {status === 'empty' && (
        <Notice variant="info">Похоже, сейчас новых историй нет. Можно вернуться чуть позже или написать свою.</Notice>
      )}

      {(status === 'ready' || status === 'sent' || status === 'loading') && message && (
        <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.07)] dark:border-white/10 dark:bg-slate-900/70">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-400">История</p>
            <p className="mt-2 text-base text-slate-900 dark:text-slate-50">{message.body}</p>
          </div>
          <div className="space-y-3">
            <textarea
              value={responseText}
              onChange={(event) => setResponseText(event.target.value.slice(0, MAX_LENGTH))}
              placeholder="Напиши тёплые слова поддержки..."
              className="min-h-[180px] w-full rounded-2xl border border-slate-200/70 bg-white/80 p-4 text-sm text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/40 dark:border-white/10 dark:bg-slate-900/50 dark:text-white"
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-slate-500">Один ответ на историю с одного устройства.</span>
              <span className={remaining < 0 ? 'text-sm font-semibold text-rose-500' : 'text-sm text-slate-500'}>
                {remaining} символов
              </span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={disabled}
                className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#0EA5E9] to-[#6366F1] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(79,70,229,0.35)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {submitting ? 'Отправляем…' : 'Отправить письмо поддержки'}
              </button>
              <button type="button" onClick={fetchMessage} className="text-sm font-medium text-slate-500 underline-offset-4 hover:text-slate-900 dark:text-slate-300">
                Показать другую историю
              </button>
            </div>
          </div>
        </div>
      )}

      {feedback && <Notice variant={feedbackVariant}>{feedback}</Notice>}
    </section>
  );
}
