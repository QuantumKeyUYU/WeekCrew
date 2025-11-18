'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const SAFETY_KEY = 'weekcrew:safety-accepted-v2';

export default function SafetyPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const donts = [
    'Не делимся телефонами, логинами в мессенджерах и личными соцсетями.',
    'Не указываем точный адрес, школу, номер группы или место работы.',
    'Не давим и не запугиваем: можно пропустить тему или выйти из беседы.',
  ];
  const okPoints = [
    'Можно отвечать в своём ритме — неделя не требует 24/7 онлайна.',
    'Если стало тревожно, вежливо останавливаем разговор.',
    'Просим помощи офлайн у взрослого, которому доверяем.',
  ];

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = window.localStorage.getItem(SAFETY_KEY);
      if (stored === '1') {
        router.replace('/explore');
        return;
      }
    } catch {
      // если localStorage отвалился — просто покажем экран
    }

    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Загружаем экран безопасности...
        </div>
      </main>
    );
  }

  const handleAccept = () => {
    try {
      window.localStorage.setItem(SAFETY_KEY, '1');
    } catch {
      // ок, не сохранилось, но жить можно
    }
    router.push('/explore');
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <section className="w-full max-w-2xl space-y-5 rounded-[2.75rem] border border-white/10 bg-slate-950/80 p-6 text-sm text-slate-50 shadow-[0_35px_110px_rgba(3,5,20,0.95)] backdrop-blur-xl sm:p-9">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand/70">WeekCrew safety</p>
          <h1 className="text-xl font-semibold sm:text-2xl">Перед стартом — договариваемся о правилах</h1>
          <p className="text-xs leading-relaxed text-slate-200/90 sm:text-sm">
            Неделя проходит в маленьком круге, поэтому нам важно общее чувство безопасности. Вот что помогает всем чувствовать себя спокойно.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-200">Не делаем</p>
            <ul className="mt-2 space-y-2 text-xs leading-relaxed text-slate-100 sm:text-[13px]">
              {donts.map((point) => (
                <li key={point}>• {point}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-200">Что нормально</p>
            <ul className="mt-2 space-y-2 text-xs leading-relaxed text-slate-100 sm:text-[13px]">
              {okPoints.map((point) => (
                <li key={point}>• {point}</li>
              ))}
            </ul>
          </article>
        </div>

        <div className="rounded-2xl border border-white/10 bg-brand/10 p-4 text-xs text-slate-100">
          WeekCrew не заменяет врачей и службы помощи. Если есть риск для жизни или здоровья, обращайся в местные экстренные службы или к взрослым, которым доверяешь.
        </div>

        <p className="text-[11px] leading-relaxed text-slate-400">
          Нажимая кнопку, ты подтверждаешь, что прочитал(а) правила и готов(а) общаться бережно — и к себе, и к другим.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleAccept}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-brand px-5 py-2 text-xs font-semibold text-white shadow-[0_18px_50px_rgba(129,140,248,0.85)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_26px_60px_rgba(129,140,248,0.95)] sm:flex-none"
          >
            Понял(а), можно к интересам
          </button>
          <button
            onClick={handleBack}
            className="inline-flex items-center justify-center rounded-full border border-white/30 px-4 py-2 text-xs font-medium text-slate-100 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-white/60"
          >
            Вернуться на главную
          </button>
        </div>
      </section>
    </main>
  );
}
