'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n/useTranslation';
import { primaryCtaClass } from '@/styles/tokens';
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
    { title: t('landing_step_one_title'), description: t('landing_step_one_description') },
    { title: t('landing_step_two_title'), description: t('landing_step_two_description') },
    { title: t('landing_step_three_title'), description: t('landing_step_three_description') },
  ];

  return (
    <>
      <div className="space-y-10 py-8 sm:space-y-16 sm:py-14">
        {/* Верхняя карточка-бренд */}
        <section className="app-panel relative p-6 sm:p-8">
          <div className="relative flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <span className="app-chip inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                WeekCrew
              </span>
              <p className="max-w-xl text-sm text-slate-600 dark:text-slate-300">
                {t('landing_logo_tagline')}
              </p>
            </div>
          </div>
        </section>

        {/* Hero-блок */}
        <section className="app-hero relative px-5 py-12 text-center text-white sm:px-12 sm:py-14">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-brand/10" />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative mx-auto max-w-3xl space-y-7"
          >
            <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80 backdrop-blur">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
              {t('landing_more_link')}
            </div>

            <h1 className="text-[2.05rem] font-semibold leading-tight sm:text-[2.9rem]">
              {t('landing_hero_title')}
            </h1>

            <p className="text-base text-white/80 sm:text-lg">
              {t('landing_hero_subtitle')}
            </p>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <button
                type="button"
                onClick={() =>
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="order-2 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-2.5 text-sm font-medium text-white/90 transition duration-200 hover:border-white/40 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:order-1"
              >
                {t('landing_more_link')}
                <span aria-hidden className="text-lg leading-none">↗</span>
              </button>
              <button
                type="button"
                onClick={handleStart}
                className={`${primaryCtaClass} order-1 sm:order-2`}
              >
                {t('landing_hero_cta')}
              </button>
            </div>

            {currentCircle && (
              <button
                type="button"
                onClick={() => router.push('/circle')}
                className="text-sm font-medium text-white/75 underline-offset-4 transition hover:text-white"
              >
                {t('landing_go_to_circle')}
              </button>
            )}
          </motion.div>
        </section>

        {/* Как устроен проект */}
        <section
          id="how-it-works"
          className="app-panel relative scroll-mt-24 p-7 md:scroll-mt-28"
        >
          <div className="relative space-y-3 text-center">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              {t('landing_how_title')}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t('landing_how_subtitle')}
            </p>
          </div>

          <div className="relative mt-10 grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="group relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-5 shadow-[var(--shadow-soft)] transition duration-300 hover:-translate-y-1 hover:border-brand/30"
              >
                <div className="relative flex flex-col gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-300">
                    Step {index + 1}
                  </p>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {step.description}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="relative mt-12 flex justify-center">
            <button type="button" onClick={handleStart} className={primaryCtaClass}>
              {t('landing_hero_cta')}
            </button>
          </div>
        </section>

        <TestModeHint />
      </div>

      <SafetyRulesModal open={showModal} onAccept={handleAcceptRules} onClose={handleCloseModal} />
    </>
  );
}
