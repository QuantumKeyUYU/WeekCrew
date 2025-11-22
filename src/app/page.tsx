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
  ];

  return (
    <>
      <div className="app-shell space-y-12 pb-12 pt-6 sm:space-y-16 sm:pb-16 sm:pt-10 lg:space-y-24 lg:pb-20">
        <section className="app-hero relative overflow-hidden px-4 py-9 text-white shadow-[0_30px_140px_rgba(6,5,27,0.65)] sm:px-8 sm:py-12 lg:px-12 lg:py-16">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 mix-blend-screen dark:bg-grid-dark" />
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute -left-10 top-6 h-64 w-64 rounded-full bg-white/10 blur-3xl sm:-left-16 sm:h-80 sm:w-80" />
            <div className="absolute bottom-[-14%] right-[-6%] h-80 w-80 rounded-full bg-fuchsia-400/35 blur-[110px] sm:h-96 sm:w-96" />
            <div className="absolute inset-y-10 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-white/5 via-white/30 to-white/5 md:block" />
            <div className="absolute inset-x-6 top-1/2 hidden h-[1px] -translate-y-1/2 bg-gradient-to-r from-white/0 via-white/40 to-white/0 lg:block" />
          </div>

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-[0.6rem] text-[clamp(0.65rem,0.12vw+0.63rem,0.72rem)] font-semibold uppercase tracking-[0.16em] text-white/80 shadow-[0_16px_60px_rgba(3,5,20,0.35)]">
                {t('hero_intro_label')}
              </div>
              <div className="space-y-3 text-left md:max-w-2xl">
                <h1 className="text-[clamp(2.25rem,3vw+1.45rem,3.6rem)] font-semibold leading-[1.05]">
                  {t('hero_title')}
                </h1>
                <p className="text-[clamp(1rem,0.7vw+0.95rem,1.2rem)] leading-[1.6] text-white/90">{t('hero_description')}</p>
              </div>

              <div className="-mx-1 flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 scroll-smooth scroll-snap-x [--sb-size:0px] sm:-mx-2 sm:gap-3">
                {vibes.map((vibe) => (
                  <span
                    key={vibe}
                    className="app-chip scroll-snap-align-start border-white/25 bg-white/10 px-4 py-2 text-[clamp(0.82rem,0.18vw+0.78rem,0.96rem)] font-semibold text-white/90 shadow-[0_18px_45px_rgba(3,5,20,0.35)] whitespace-nowrap"
                  >
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

            <div className="space-y-5">
              <div className="app-panel-muted relative grid gap-4 rounded-[26px] border border-white/20 bg-white/10 p-6 shadow-[0_22px_85px_rgba(3,5,20,0.5)] backdrop-blur-xl sm:rounded-[30px] sm:p-8 lg:p-10">
                <div className="pointer-events-none absolute inset-0 rounded-[24px] border border-white/10" />
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-[clamp(0.8rem,0.16vw+0.77rem,0.92rem)] font-semibold uppercase tracking-[0.15em] text-white/70">{t('hero_story_title')}</p>
                    <p className="text-[clamp(0.98rem,0.2vw+0.95rem,1.1rem)] text-white/85 leading-relaxed">{t('hero_story_description')}</p>
                  </div>
                  <div className="app-chip bg-white/15 px-4 py-2 text-[clamp(0.82rem,0.18vw+0.78rem,0.96rem)] font-semibold text-white/85">{t('hero_stat_circle_label')}</div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {highlights.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/12 via-white/5 to-white/10 px-4 py-3 text-left shadow-[0_16px_40px_rgba(3,5,20,0.35)]"
                    >
                      <p className="text-[clamp(0.78rem,0.15vw+0.75rem,0.9rem)] font-semibold uppercase tracking-[0.1em] text-white/70">{item.label}</p>
                      <p className="mt-2 text-[clamp(0.95rem,0.22vw+0.9rem,1.08rem)] text-white leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        <section id="how-it-works" className="space-y-8 rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-[0_22px_90px_rgba(15,23,42,0.06)] backdrop-blur sm:p-8 md:rounded-[30px] md:p-10 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="space-y-3 text-left md:text-center">
            <p className="text-[clamp(0.78rem,0.14vw+0.75rem,0.9rem)] font-semibold uppercase tracking-[0.2em] text-brand">{t('home_how_it_works_label')}</p>
            <h2 className="text-[clamp(1.95rem,0.9vw+1.6rem,2.4rem)] font-semibold text-slate-900 dark:text-white leading-[1.1]">{t('home_how_it_works_title')}</h2>
            <p className="text-[clamp(0.98rem,0.3vw+0.92rem,1.08rem)] leading-relaxed text-slate-600 dark:text-slate-300">{t('home_how_it_works_description')}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <article key={step.title} className="app-panel-muted relative flex h-full flex-col gap-3 rounded-3xl border border-slate-200/80 bg-slate-50/80 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.07)] dark:border-slate-800/70 dark:bg-slate-900/70">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-[clamp(0.9rem,0.12vw+0.88rem,1rem)] font-semibold text-white shadow-[0_18px_45px_rgba(124,58,237,0.4)]">
                  {step.badge}
                </span>
                <h3 className="text-[clamp(1.1rem,0.3vw+1.05rem,1.25rem)] font-semibold text-slate-900 dark:text-white leading-tight">{step.title}</h3>
                <p className="text-[clamp(0.96rem,0.2vw+0.92rem,1.05rem)] text-slate-600 dark:text-slate-300 leading-relaxed">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="why-calm"
          className="space-y-6 rounded-[28px] border border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-violet-50 p-6 shadow-[0_26px_110px_rgba(15,23,42,0.05)] sm:p-8 md:rounded-[30px] md:p-10 dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950/40"
        >
          <div className="space-y-3 text-left md:text-center">
            <p className="text-[clamp(0.78rem,0.14vw+0.75rem,0.9rem)] font-semibold uppercase tracking-[0.2em] text-brand">{t('home_why_cozy_label')}</p>
            <h2 className="text-[clamp(1.95rem,0.9vw+1.6rem,2.4rem)] font-semibold text-slate-900 dark:text-white leading-[1.1]">{t('home_why_cozy_title')}</h2>
            <p className="text-[clamp(0.98rem,0.3vw+0.92rem,1.08rem)] leading-relaxed text-slate-600 dark:text-slate-300">{t('home_why_cozy_description')}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cozyFeatures.map((feature) => (
              <div key={feature.title} className="rounded-3xl border border-slate-200/80 bg-white/70 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.07)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-slate-900/70">
                <h3 className="text-[clamp(1.05rem,0.22vw+1rem,1.2rem)] font-semibold text-slate-900 dark:text-white leading-tight">{feature.title}</h3>
                <p className="mt-2 text-[clamp(0.96rem,0.2vw+0.92rem,1.05rem)] text-slate-600 dark:text-slate-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="app-panel-muted flex flex-col gap-4 rounded-[26px] border border-slate-200/70 bg-white/75 p-6 text-center shadow-[0_22px_90px_rgba(15,23,42,0.06)] sm:p-8 md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-900/70">
          <div className="space-y-2 text-left md:text-center">
            <h3 className="text-[clamp(1.35rem,0.4vw+1.28rem,1.6rem)] font-semibold text-slate-900 dark:text-white">{t('home_ready_title')}</h3>
            <p className="text-[clamp(0.98rem,0.26vw+0.93rem,1.06rem)] text-slate-600 dark:text-slate-300 leading-relaxed">{t('home_ready_description')}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <button type="button" onClick={handleStart} className={primaryCtaClass}>
              {t('home_ready_cta')}
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-[clamp(0.98rem,0.2vw+0.94rem,1.08rem)] font-semibold text-slate-800 underline-offset-4 transition hover:text-indigo-600 dark:text-white dark:hover:text-indigo-200"
            >
              {t('landing_more_link')}
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('why-calm')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-[clamp(0.98rem,0.2vw+0.94rem,1.08rem)] font-semibold text-slate-800 underline-offset-4 transition hover:text-indigo-600 dark:text-white dark:hover:text-indigo-200"
            >
              {t('hero_secondary_cta')}
            </button>
          </div>
        </section>
        <TestModeHint />
      </div>
      <SafetyRulesModal open={showModal} onAccept={handleAcceptRules} onClose={handleCloseModal} />
    </>
  );
}
