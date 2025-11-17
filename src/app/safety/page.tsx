'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const SAFETY_KEY = 'weekcrew:safety-accepted-v2';

export default function SafetyPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

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
      <section className="w-full max-w-2xl rounded-3xl border border-brand/70 bg-slate-900/95 p-6 text-sm text-slate-50 shadow-[0_28px_90px_rgba(15,23,42,0.95)] ring-1 ring-brand/40 backdrop-blur-xl sm:p-8">
        <h1 className="text-lg font-semibold sm:text-xl">
          Перед стартом — договоримся, как общаться безопасно
        </h1>

        <p className="mt-3 text-xs leading-relaxed text-slate-200/95 sm:text-sm">
          WeekCrew — это небольшие кружки по интересам, а не бесконечная соцсеть. Здесь
          можно делиться мыслями и чувствами, но мы заботимся о безопасности участников.
          Поэтому есть несколько простых правил.
        </p>

        {/* Что нельзя */}
        <div className="mt-4 rounded-2xl bg-slate-950/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            Что мы здесь не делаем
          </p>
          <ul className="mt-2 space-y-2 text-xs leading-relaxed text-slate-200 sm:text-[13px]">
            <li>
              • <b>Не даём личные контакты:</b> не отправляем номер телефона, логины в
              мессенджерах, ссылки на личные соцсети и e-mail.
            </li>
            <li>
              • <b>Не раскрываем точное место:</b> можно написать город, но без адреса,
              школы, номера класса, учебной группы и места работы.
            </li>
            <li>
              • <b>Не нападаем:</b> без оскорблений, травли, шантажа и угроз. Можно не
              поддерживать тему и спокойно выйти из чата.
            </li>
          </ul>
        </div>

        {/* Что окей */}
        <div className="mt-4 rounded-2xl bg-slate-950/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            Что здесь нормально и ок
          </p>
          <ul className="mt-2 space-y-2 text-xs leading-relaxed text-slate-200 sm:text-[13px]">
            <li>
              • <b>Делать паузы:</b> не обязательно отвечать сразу и быть онлайн всё
              время.
            </li>
            <li>
              • <b>Говорить «мне некомфортно»:</b> можно мягко остановить тему или
              закончить разговор.
            </li>
            <li>
              • <b>Просить о помощи офлайн:</b> если переписка сильно тревожит, лучше
              поговорить с взрослым, которому доверяешь.
            </li>
          </ul>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-slate-300/90">
          WeekCrew помогает находить поддержку и общаться, но не заменяет врачей и службы
          помощи. При тяжёлых или повторяющихся переживаниях лучше обращаться к
          специалистам в своём городе.
        </p>

        <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
          Дальше будет выбор интереса и кружков. Нажимая кнопку, ты соглашаешься
          придерживаться этих правил и общаться бережно — и к себе, и к другим.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={handleAccept}
            className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-2 text-xs font-semibold text-white shadow-[0_18px_40px_rgba(129,140,248,0.8)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(129,140,248,0.95)]"
          >
            Понял(а), можно перейти к выбору интереса
          </button>
          <button
            onClick={handleBack}
            className="inline-flex items-center justify-center rounded-full border border-slate-500/70 bg-transparent px-4 py-2 text-xs font-medium text-slate-200 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-white"
          >
            Вернуться на главную
          </button>
        </div>
      </section>
    </main>
  );
}
