'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Notice } from '@/components/shared/notice';
import { apiRequest } from '@/lib/api-client';
import type { InboxPayload, MessageDTO, ResponseWithMessageDTO } from '@/types';

const formatter = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' });

const formatDate = (value: string) => {
  try {
    return formatter.format(new Date(value));
  } catch (error) {
    return value;
  }
};

const Block = ({ title, description, children }: { title: string; description: string; children: ReactNode }) => (
  <div className="space-y-3 rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.07)] dark:border-white/10 dark:bg-slate-900/70">
    <div>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</p>
    </div>
    {children}
  </div>
);

const MessageCard = ({ message }: { message: MessageDTO }) => (
  <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-4 text-sm text-slate-800 shadow-[0_12px_30px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200">
    <p>{message.body}</p>
    <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">{formatDate(message.createdAt)}</p>
    {message.replies && message.replies.length > 0 && (
      <div className="mt-3 space-y-2 rounded-2xl border border-slate-200/60 bg-slate-50/80 p-3 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-100">
        {message.replies.map((reply) => (
          <div key={reply.id}>
            <p>{reply.body}</p>
            <p className="mt-1 text-[11px] text-slate-400">{formatDate(reply.createdAt)}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

const RepliedCard = ({ response }: { response: ResponseWithMessageDTO }) => (
  <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-4 text-sm text-slate-800 shadow-[0_12px_30px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200">
    <p className="text-xs uppercase tracking-wide text-slate-400">История</p>
    <p className="text-sm text-slate-700 dark:text-slate-100">{response.message.body}</p>
    <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">Твой ответ</p>
    <p className="text-slate-900 dark:text-white">{response.body}</p>
    <p className="mt-1 text-[11px] text-slate-400">{formatDate(response.createdAt)}</p>
  </div>
);

export default function MyPage() {
  const [inbox, setInbox] = useState<InboxPayload | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;
    apiRequest<InboxPayload>('/api/v2/my')
      .then((data) => {
        if (!active) {
          return;
        }
        setInbox(data);
        setStatus('ready');
      })
      .catch((error) => {
        if (!active) {
          return;
        }
        setErrorMessage(error instanceof Error ? error.message : 'Не удалось загрузить письма.');
        setStatus('error');
      });
    return () => {
      active = false;
    };
  }, []);

  const isEmpty = status === 'ready' && inbox && inbox.received.length === 0 && inbox.replied.length === 0;

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Связи, которые ты создаёшь</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Возвращайся к письмам, которые помогают выдохнуть и немного улыбнуться, и смотри, как твои слова откликаются другим.
        </p>
      </div>

      {status === 'loading' && <p className="text-sm text-slate-500">Загружаем письма…</p>}
      {status === 'error' && <Notice variant="warning">{errorMessage}</Notice>}

      {isEmpty && (
        <div className="rounded-3xl border border-dashed border-slate-200/80 bg-white/70 p-6 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-300">
          <p>Пока здесь пусто. Как только ты поделишься историей или поддержишь кого-то, письма появятся здесь.</p>
        </div>
      )}

      {status === 'ready' && inbox && inbox.received.length > 0 && (
        <Block
          title="Ответы для тебя"
          description="Здесь появятся слова поддержки, которые ты получишь. Как только кто-то ответит на твою мысль, его письмо останется здесь — к нему можно вернуться в любой день."
        >
          <div className="grid gap-3">
            {inbox.received.map((message) => (
              <MessageCard key={message.id} message={message} />
            ))}
          </div>
        </Block>
      )}

      {status === 'ready' && inbox && inbox.replied.length > 0 && (
        <Block
          title="Кому ты уже помог"
          description="Здесь видны истории, на которые ты отвечал. Мы не показываем имён и контактов — только факты: кому-то в этот день стало чуть легче."
        >
          <div className="grid gap-3">
            {inbox.replied.map((response) => (
              <RepliedCard key={response.id} response={response} />
            ))}
          </div>
        </Block>
      )}
    </section>
  );
}
