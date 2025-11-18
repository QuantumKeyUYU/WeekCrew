'use client';

import { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/useTranslation';
import { useWeekcrewSnapshot } from '@/lib/weekcrewStorage';

export default function HomePage() {
  const t = useTranslation();
  const { currentCircle } = useWeekcrewSnapshot((snapshot) => ({
    currentCircle: snapshot.currentCircle,
  }));

  const hasCircle = Boolean(currentCircle);
  const primaryCtaHref = hasCircle ? '/circle' : '/explore';

  const handleScrollToHow = useCallback(() => {
    const target = document.getElementById('how-it-works');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const steps = useMemo(
    () => [
      {
        title: t('home_step_select_interest_title'),
        description: t('home_step_select_interest_description'),
      },
      {
        title: t('home_step_join_circle_title'),
        description: t('home_step_join_circle_description'),
      },
      {
        title: t('home_step_week_of_warmth_title'),
        description: t('home_step_week_of_warmth_description'),
      },
    ],
    [t],
  );

  const features = useMemo(
    () => [
      { title: t('feature_week_length_title'), description: t('feature_week_length_description') },
      { title: t('feature_small_group_title'), description: t('feature_small_group_description') },
      { title: t('feature_daily_icebreaker_title'), description: t('feature_daily_icebreaker_description') },
      { title: t('feature_no_likes_title'), description: t('feature_no_likes_description') },
      { title: t('feature_one_circle_title'), description: t('feature_one_circle_description') },
    ],
    [t],
  );

  const primaryCtaClass =
    'inline-flex items-center justify-center rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_36px_rgba(129,140,248,0.45)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_0_46px_rgba(129,140,248,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent';

  return (
    <main className="px-4 py-12 sm:py-16">
      <section className="relative mx-auto flex max-w-4xl flex-col gap-6 rounded-[2.75rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.25),_transparent),_rgba(15,23,42,0.92)] p-6 text-slate-100 shadow-[0_30px_80px_rgba(15,23,42,0.8)] dark:border-white/10 sm:p-10">
        <div className="pointer-events-none absolute -top-12 right-0 h-48 w-48 rounded-full bg-brand/30 blur-3xl" aria-hidden />
        <header className="flex flex-col gap-4">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-100/80">
            {t('hero_intro_label')}
          </span>
          <h1 className="text-[2rem] font-semibold leading-tight sm:text-4xl">{t('hero_title')}</h1>
          <p className="max-w-3xl text-sm text-slate-100/85 sm:text-base">{t('hero_description')}</p>
        </header>

        <div className="flex flex-wrap gap-3">
          <Link href={primaryCtaHref} className={primaryCtaClass}>
            {t('hero_primary_cta')}
          </Link>
          <button
            type="button"
            onClick={handleScrollToHow}
            className="inline-flex items-center justify-center rounded-full border border-white/30 bg-transparent px-5 py-2.5 text-sm font-medium text-white/90 transition-all duration-150 hover:-translate-y-0.5 hover:border-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            {t('hero_secondary_cta')}
          </button>
        </div>
      </section>

      <section
        id="how-it-works"
        className="mx-auto mt-14 flex max-w-4xl flex-col gap-6 rounded-[2.75rem] border border-slate-200/70 bg-white/90 p-6 text-sm text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100 sm:mt-16 sm:p-8"
      >
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 sm:text-lg">{t('home_how_it_works_title')}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-3xl border border-slate-200/80 bg-white/90 p-4 text-xs text-slate-600 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition-transform transition-shadow duration-150 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200 sm:text-sm"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand/80">{`0${index + 1}`}</p>
              <p className="mt-2 font-medium text-slate-900 dark:text-white">{step.title}</p>
              <p className="mt-1 text-slate-500 dark:text-slate-300">{step.description}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-6 text-base font-semibold text-slate-900 dark:text-slate-50 sm:mt-8 sm:text-lg">{t('home_why_cozy_title')}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-slate-200/80 bg-white/90 p-4 text-xs text-slate-600 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition-transform transition-shadow duration-150 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200 sm:text-sm"
            >
              <p className="font-medium text-slate-900 dark:text-white">{feature.title}</p>
              <p className="mt-1 text-slate-500 dark:text-slate-300">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200/80 bg-gradient-to-r from-brand/10 via-white to-brand/10 p-5 text-center text-sm text-slate-700 shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:from-brand/20 dark:via-slate-900/40 dark:to-brand/20 dark:text-slate-200 sm:mt-8">
          <p className="text-base font-semibold text-slate-900 dark:text-white">{t('home_ready_title')}</p>
          <p className="mt-1 text-slate-600 dark:text-slate-200">{t('home_ready_description')}</p>
          <div className="mt-3">
            <Link href={primaryCtaHref} className={primaryCtaClass}>
              {t('home_ready_cta')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
