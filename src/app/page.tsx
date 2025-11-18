'use client';

import { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useTranslation } from '@/i18n/useTranslation';
import { useWeekcrewSnapshot } from '@/lib/weekcrewStorage';
import { motionTimingClass, primaryCtaClass, secondaryCtaClass } from '@/styles/tokens';

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

  const timeline = useMemo(
    () => [
      {
        label: t('home_week_story_stage_one_label'),
        title: t('home_week_story_stage_one_title'),
        description: t('home_week_story_stage_one_description'),
      },
      {
        label: t('home_week_story_stage_two_label'),
        title: t('home_week_story_stage_two_title'),
        description: t('home_week_story_stage_two_description'),
      },
      {
        label: t('home_week_story_stage_three_label'),
        title: t('home_week_story_stage_three_title'),
        description: t('home_week_story_stage_three_description'),
      },
    ],
    [t],
  );

  const features = useMemo(
    () => [
      { title: t('feature_one_circle_title'), description: t('feature_one_circle_description'), accent: true },
      { title: t('feature_week_length_title'), description: t('feature_week_length_description') },
      { title: t('feature_small_group_title'), description: t('feature_small_group_description') },
      { title: t('feature_daily_icebreaker_title'), description: t('feature_daily_icebreaker_description') },
      { title: t('feature_no_likes_title'), description: t('feature_no_likes_description') },
    ],
    [t],
  );

  const stats = useMemo(
    () => [
      { label: t('hero_stat_circle_label'), description: t('hero_stat_circle_description') },
      { label: t('hero_stat_size_label'), description: t('hero_stat_size_description') },
      { label: t('hero_stat_feed_label'), description: t('hero_stat_feed_description') },
    ],
    [t],
  );

  return (
    <main className="px-4 py-12 sm:py-16">
      <div className="mx-auto flex max-w-5xl flex-col space-y-10 sm:space-y-16">
        <motion.section
          initial={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="rounded-[2.75rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.35),_transparent),_rgba(6,9,26,0.98)] px-6 py-8 text-slate-100 shadow-[0_35px_100px_rgba(5,7,22,0.75)] dark:border-white/10 sm:px-10 sm:py-12"
        >
          <div className="space-y-8">
            <header className="space-y-4">
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                {t('hero_intro_label')}
              </span>
              <div className="space-y-4">
                <h1 className="text-[2.2rem] font-semibold leading-tight sm:text-4xl">{t('hero_title')}</h1>
                <p className="max-w-3xl text-sm text-white/85 sm:text-base">{t('hero_description')}</p>
              </div>
            </header>

            <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/80 shadow-[0_16px_45px_rgba(4,6,20,0.5)] sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">{t('hero_story_title')}</p>
                <p className="mt-2 text-base text-white">{t('hero_story_description')}</p>
              </div>
              <div className="grid gap-3 text-left text-sm text-white/80 sm:grid-cols-3 sm:text-[13px]">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_10px_40px_rgba(4,6,20,0.35)]">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">{stat.label}</p>
                    <p className="mt-1 text-base font-semibold text-white">{stat.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href={primaryCtaHref} className={primaryCtaClass}>
                {t('hero_primary_cta')}
              </Link>
              <button type="button" onClick={handleScrollToHow} className={secondaryCtaClass}>
                {t('hero_secondary_cta')}
              </button>
            </div>
          </div>
        </motion.section>

        <section className="rounded-[2.75rem] border border-slate-200/80 bg-white/95 px-6 py-8 text-sm text-slate-900 shadow-[0_25px_80px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-50 sm:px-10">
          <div className="flex flex-col gap-8">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-white/60">
                {t('home_week_story_title')}
              </p>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{t('home_week_story_description')}</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {timeline.map((scene) => (
                <article
                  key={scene.label}
                  className="rounded-3xl border border-slate-200/70 bg-white/95 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.09)] dark:border-white/10 dark:bg-slate-900/70"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{scene.label}</p>
                  <h3 className="mt-2 text-base font-semibold text-slate-900 dark:text-white">{scene.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{scene.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="rounded-[2.75rem] border border-slate-200/70 bg-white/95 px-6 py-8 text-sm text-slate-900 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-50 sm:px-10"
        >
          <div>
            <h2 className="text-base font-semibold sm:text-lg">{t('home_how_it_works_title')}</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-500 dark:text-slate-300">{t('home_how_it_works_description')}</p>
            <div className="relative mt-6">
              <span className="absolute left-4 right-4 top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-brand/30 to-transparent sm:block" aria-hidden />
              <ol className="grid gap-5 sm:grid-cols-3">
                {steps.map((step, index) => (
                  <li
                    key={step.title}
                    className="relative rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(15,23,42,0.16)] dark:border-white/10 dark:bg-slate-900/70"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-brand/40 bg-brand/10 text-base font-semibold text-brand">
                        {`0${index + 1}`}
                      </span>
                      <p className="text-base font-semibold text-slate-900 dark:text-white">{step.title}</p>
                    </div>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{step.description}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="rounded-[2.75rem] border border-slate-200/70 bg-white/95 px-6 py-8 text-sm text-slate-900 shadow-[0_25px_80px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-50 sm:px-10">
          <h2 className="text-base font-semibold sm:text-lg">{t('home_why_cozy_title')}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={clsx(
                  'rounded-3xl border border-slate-200/70 bg-white/95 p-5 shadow-[0_12px_36px_rgba(15,23,42,0.08)]',
                  motionTimingClass,
                  'hover:-translate-y-0.5 hover:shadow-[0_18px_46px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-slate-900/70',
                )}
              >
                <p className={feature.accent ? 'text-base font-semibold text-brand-foreground' : 'text-base font-semibold text-slate-900 dark:text-white'}>
                  {feature.title}
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/70 bg-gradient-to-r from-brand/10 via-white to-brand/10 p-6 text-center text-sm text-slate-700 shadow-[0_22px_55px_rgba(15,23,42,0.12)] dark:border-white/10 dark:from-brand/20 dark:via-slate-900/60 dark:to-brand/20 dark:text-slate-200">
          <p className="text-base font-semibold text-slate-900 dark:text-white">{t('home_ready_title')}</p>
          <p className="mt-1 text-slate-600 dark:text-slate-200">{t('home_ready_description')}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link href={primaryCtaHref} className={primaryCtaClass}>
              {t('home_ready_cta')}
            </Link>
            <button
              type="button"
              onClick={handleScrollToHow}
              className="inline-flex items-center justify-center rounded-full border border-slate-300/70 bg-transparent px-6 py-2.5 text-sm font-medium text-slate-700 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-brand/40 hover:text-brand-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:border-white/30 dark:text-slate-200"
            >
              {t('hero_secondary_cta')}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
