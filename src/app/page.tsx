'use client';

import { LandingHero } from '@/components/shared/hero';
import { primaryCtaClass } from '@/styles/tokens';

const actions = [
  {
    title: 'Поделиться',
    description: 'Напиши честную мысль о том, как тебе сейчас. Без имени и контактов — только текст.'
  },
  {
    title: 'Поддержать кого-то',
    description: 'Выбери одну историю и ответь на неё так, как поддержал бы друга.'
  },
  {
    title: 'Ответы для тебя',
    description: 'Здесь остаются письма, которые ты получил и отправил. К ним всегда можно вернуться.'
  }
];

export default function HomePage() {
  const panelClass =
    'rounded-3xl border border-slate-200/80 bg-[#fdfcff] p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-colors dark:border-white/10 dark:bg-slate-900/70 sm:p-6';

  return (
    <div className="space-y-8 sm:space-y-12">
      <LandingHero />

      <section id="how-it-works" className={panelClass}>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">Два действия вместо ленты</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {actions.map((action) => (
            <div
              key={action.title}
              className="rounded-2xl border border-slate-200/70 bg-white/95 p-4 text-slate-700 shadow-[0_8px_22px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-[0_16px_36px_rgba(127,90,240,0.12)] dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200 sm:p-5"
            >
              <h3 className="text-base font-semibold text-brand-foreground sm:text-lg">{action.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">{action.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={panelClass}>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Поделиться тем, что внутри</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Напиши записку от 10 до 280 символов, опиши настроение и нажми «Отправить». Мы сохранём историю, запустим AI-модерацию
              и дадим ей статус. Как только история будет опубликована, кто-то из мира сможет ответить.
            </p>
            <a className={primaryCtaClass + ' inline-flex w-full justify-center sm:w-auto'} href="/write">
              Написать историю
            </a>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Поддержать кого-то</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Лента подбирает одну историю, на которую ты ещё не отвечал с этого устройства. Прочитай, выдохни и напиши несколько
              тёплых фраз — как близкому человеку.
            </p>
            <a className={primaryCtaClass + ' inline-flex w-full justify-center sm:w-auto'} href="/support">
              Перейти к историям
            </a>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 text-slate-800 shadow-[0_16px_36px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-900/70">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">Интернет без шума создаём вместе</h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Традиционные соцсети учат говорить громко и собирать реакции. UYAN.chat устроен наоборот: здесь нет лайков, подписчиков и
          бесконечной ленты. Есть только два действия: поделиться тем, что внутри, и поддержать другого. Такой интернет мы хотим
          видеть в 2026 году — тише, честнее и человечнее.
        </p>
      </section>
    </div>
  );
}
