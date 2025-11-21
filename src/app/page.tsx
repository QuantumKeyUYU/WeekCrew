'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n/useTranslation';
import { primaryCtaClass, secondaryCtaClass } from '@/styles/tokens';
import { SafetyRulesModal } from '@/components/modals/safety-rules-modal';
import { useSafetyRules } from '@/hooks/useSafetyRules';
import { useAppStore } from '@/store/useAppStore';
import { TestModeHint } from '@/components/shared/test-mode-hint';

export default function HomePage() {
  const router = useRouter();
  const t = useTranslation();
  const { accepted, markAccepted } = useSafetyRules();
  const currentCircle = useAppStore((state) => state.circle);
  const [showModal, setShowModal] = useState(false);

  const handleStart = () => {
    if (accepted) {
      router.push('/explore');
      return;
    }
    setShowModal(true);
  };

  const handleAcceptRules = () => {
    markAccepted();
    setShowModal(false);
    router.push('/explore');
  };

  const handleCloseModal = () => setShowModal(false);

  const steps = [
    { title: t('home_step_select_interest_title'), description: t('home_step_select_interest_description'), badge: '01' },
    { title: t('home_step_join_circle_title'), description: t('home_step_join_circle_description'), badge: '02' },
    { title: t('home_step_week_of_warmth_title'), description: t('home_step_week_of_warmth_description'), badge: '03' },
  ];

  const highlights = [
    { label: t('hero_stat_circle_label'), description: t('hero_stat_circle_description') },
    { label: t('hero_stat_size_label'), description: t('hero_stat_size_description') },
    { label: t('hero_stat_feed_label'), description: t('hero_stat_feed_description') },
  ];

  const essentials = [
    {
      title: t('home_essentials_single_circle_title'),
      description: t('home_essentials_single_circle_description'),
      icon: '🎛️'
    },
    {
      title: t('home_essentials_fresh_mood_title'),
      description: t('home_essentials_fresh_mood_description'),
      icon: '✨'
    },
    {
      title: t('home_essentials_soft_finish_title'),
      description: t('home_essentials_soft_finish_description'),
      icon: '🌙'
    },
  ];

  const vibes = [
    t('explore_mood_chip_calm'),
    t('explore_mood_chip_support'),
    t('explore_mood_chip_inspired'),
    t('explore_mood_chip_hobby'),
    t('explore_mood_chip_languages'),
  ];

  const cozyFeatures = [
    { title: t('feature_week_length_title'), description: t('feature_week_length_description') },
    { title: t('feature_small_group_title'), description: t('feature_small_group_description') },
    { title: t('feature_daily_icebreaker_title'), description: t('feature_daily_icebreaker_description') },
    { title: t('feature_no_likes_title'), description: t('feature_no_likes_description') },
    { title: t('feature_one_circle_title'), description: t('feature_one_circle_description') },
  ];

  return (
    <>
      <div className="space-y-14 py-8 sm:space-y-20 sm:py-12">
        <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 px-5 py-10 text-white shadow-[0_30px_140px_rgba(6,5,27,0.65)] sm:px-12 sm:py-14">
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl sm:h-80 sm:w-80" />
            <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-fuchsia-400/30 blur-3xl sm:h-96 sm:w-96" />
            <div className="absolute inset-y-10 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-white/5 via-white/30 to-white/5 md:block" />
          </div>

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.95fr]">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }} className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/80">
                {t('hero_intro_label')}
              </div>
              <div className="space-y-3 text-left">
                <h1 className="text-3xl font-semibold leading-tight sm:text-[2.8rem] sm:leading-[1.05]">
                  {t('hero_title')}
                </h1>
                <p className="text-sm leading-relaxed text-white/85 sm:text-base">{t('hero_description')}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {vibes.map((vibe) => (
                  <span key={vibe} className="app-chip border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white/90 shadow-[0_18px_45px_rgba(3,5,20,0.35)]">
                    {vibe}
                  </span>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button type="button" onClick={handleStart} className={primaryCtaClass}>
                  {t('hero_primary_cta')}
                </button>
                <button
                  type="button"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className={secondaryCtaClass}
                >
                  {t('hero_secondary_cta')}
                </button>
              </div>

              {currentCircle && (
                <button
                  type="button"
                  onClick={() => router.push('/circle')}
                  className="text-sm font-medium text-white/80 underline-offset-4 transition hover:text-white"
                >
                  {t('landing_go_to_circle')}
                </button>
              )}
            </motion.div>

            <div className="space-y-4">
              <div className="app-panel-muted grid gap-4 rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/70">{t('hero_story_title')}</p>
                    <p className="text-base text-white/85">{t('hero_story_description')}</p>
                  </div>
                  <div className="app-chip bg-white/15 px-4 py-2 text-xs font-semibold text-white/85">{t('hero_stat_circle_label')}</div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {highlights.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-left shadow-[0_16px_40px_rgba(3,5,20,0.35)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/70">{item.label}</p>
                      <p className="mt-2 text-sm text-white">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 rounded-[24px] border border-white/10 bg-white/5 p-4 shadow-[0_18px_65px_rgba(3,5,20,0.35)] backdrop-blur-lg sm:grid-cols-3">
                {steps.map((step) => (
                  <div key={`${step.badge}-${step.title}`} className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 shadow-inner shadow-white/5">
                    <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/80">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-400/80 to-indigo-400/80 text-xs font-semibold text-white shadow-[0_12px_30px_rgba(124,58,237,0.4)]">
                        {step.badge}
                      </span>
                      {t('home_how_it_works_label')}
                    </div>
                    <p className="text-sm font-semibold text-white">{step.title}</p>
                    <p className="text-xs text-white/80">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="app-panel bg-white/70 p-6 shadow-[0_24px_90px_rgba(8,7,20,0.06)] backdrop-blur lg:p-10 dark:bg-slate-900/60">
          <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.95fr]">
            <div className="space-y-3 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">{t('home_essentials_label')}</p>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{t('home_essentials_title')}</h2>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t('home_essentials_description')}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {vibes.map((vibe) => (
                <span key={vibe} className="app-chip px-4 py-2 text-xs font-semibold text-slate-800 shadow-[0_14px_35px_rgba(15,23,42,0.1)] dark:text-white">
                  {vibe}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 rounded-[28px] border border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-purple-50/50 p-4 shadow-[0_18px_70px_rgba(15,23,42,0.06)] dark:border-slate-800/70 dark:from-slate-900/50 dark:via-slate-900 dark:to-indigo-950/40">
            <div className="hidden items-center justify-between rounded-2xl border border-slate-200/80 bg-white/70 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 shadow-[0_12px_40px_rgba(15,23,42,0.07)] md:flex dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
              <span>{t('home_step_select_interest_title')}</span>
              <span className="h-px w-16 rounded-full bg-gradient-to-r from-indigo-400 to-fuchsia-400" />
              <span>{t('home_step_join_circle_title')}</span>
              <span className="h-px w-16 rounded-full bg-gradient-to-r from-indigo-400 to-fuchsia-400" />
              <span>{t('home_step_week_of_warmth_title')}</span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {essentials.map((item) => (
                <div key={item.title} className="app-panel-muted flex h-full flex-col gap-3 rounded-3xl p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)] dark:border-slate-800/70 dark:bg-slate-900/60">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-lg shadow-[0_12px_30px_rgba(15,23,42,0.16)] dark:bg-slate-800">{item.icon}</span>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="space-y-8 rounded-[30px] border border-slate-200/70 bg-white/80 p-6 shadow-[0_22px_90px_rgba(15,23,42,0.06)] backdrop-blur md:p-10 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="space-y-3 text-left md:text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{t('home_how_it_works_label')}</p>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{t('home_how_it_works_title')}</h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t('home_how_it_works_description')}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <article key={step.title} className="app-panel-muted relative flex h-full flex-col gap-3 rounded-3xl border border-slate-200/80 bg-slate-50/80 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.07)] dark:border-slate-800/70 dark:bg-slate-900/70">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(124,58,237,0.4)]">
                  {step.badge}
                </span>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-6 rounded-[30px] border border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-violet-50 p-6 shadow-[0_26px_110px_rgba(15,23,42,0.05)] md:p-10 dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950/40">
          <div className="space-y-3 text-left md:text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{t('home_why_cozy_label')}</p>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{t('home_why_cozy_title')}</h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t('home_why_cozy_description')}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cozyFeatures.map((feature) => (
              <div key={feature.title} className="rounded-3xl border border-slate-200/80 bg-white/70 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.07)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-slate-900/70">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="app-panel-muted flex flex-col gap-4 rounded-[26px] border border-slate-200/70 bg-white/75 p-6 text-center shadow-[0_22px_90px_rgba(15,23,42,0.06)] md:flex-row md:items-center md:justify-between md:p-8 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="space-y-2 text-left md:text-center">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{t('home_ready_title')}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">{t('home_ready_description')}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <button type="button" onClick={handleStart} className={primaryCtaClass}>
              {t('home_ready_cta')}
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm font-semibold text-slate-800 underline-offset-4 transition hover:text-indigo-600 dark:text-white dark:hover:text-indigo-200"
            >
              {t('landing_more_link')}
            </button>
            <div className="flex flex-wrap justify-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600 shadow-[0_16px_50px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200">
              {vibes.slice(0, 3).map((vibe) => (
                <span key={`cta-${vibe}`} className="rounded-full bg-gradient-to-r from-indigo-500/15 to-fuchsia-500/15 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-white">
                  {vibe}
                </span>
              ))}
            </div>
          </div>
        </section>
        <TestModeHint />
      </div>
      <SafetyRulesModal open={showModal} onAccept={handleAcceptRules} onClose={handleCloseModal} />
    </>
  );
}
