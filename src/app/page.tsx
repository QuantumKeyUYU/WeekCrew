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
      <div className="space-y-12 py-10 sm:space-y-16 sm:py-16">
        {/* Верхняя карточка-бренд */}
        <section className="relative overflow-hidden rounded-[32px] border border-slate-200/60 bg-gradient-to-r from-slate-50/90 via-white/90 to-slate-50/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-md dark:border-white/10 dark:from-slate-900/70 dark:via-slate-900/55 dark:to-slate-900/80">
          <div className="pointer-events-none absolute inset-0 rounded-[30px] bg-[radial-gradient(circle_at_0%_0%,rgba(56,189,248,0.16),transparent_55%),radial-gradient(circle_at_100%_0%,rgba(129,140,248,0.16),transparent_55%)] opacity-70 dark:opacity-90" />
          <div className="relative flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-1.5 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200/80 backdrop-blur dark:bg-slate-900/80 dark:text-white dark:ring-white/15">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.35)]" />
                WeekCrew
              </span>
              <p className="max-w-xl text-sm text-slate-600 dark:text-slate-300">
                {t('landing_logo_tagline')}
              </p>
            </div>
          </div>
        </section>

        {/* Hero-блок */}
        <section className="app-hero relative overflow-hidden px-6 py-16 text-center text-white sm:px-12">
          {/* Мягкий фон без «шишек» */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -inset-x-10 -top-40 h-72 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.18),transparent_60%)] opacity-80 blur-[80px]" />
            <div className="absolute -left-40 bottom-[-80px] h-72 w-80 bg-[radial-gradient(circle_at_20%_70%,rgba(45,212,191,0.3),transparent_60%)] opacity-70 blur-[96px]" />
            <div className="absolute -right-40 top-10 h-80 w-96 bg-[radial-gradient(circle_at_80%_20%,rgba(129,140,248,0.32),transparent_65%)] opacity-80 blur-[110px]" />
            <div className="absolute inset-x-10 bottom-8 h-px bg-gradient-to-r from-white/0 via-white/45 to-white/0 opacity-80" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative mx-auto max-w-3xl space-y-7"
          >
            <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-white/22 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80 shadow-inner shadow-white/10 backdrop-blur">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_0_8px_rgba(16,185,129,0.28)]" />
              {t('landing_more_link')}
            </div>

            <h1 className="text-3xl font-semibold leading-tight sm:text-[2.9rem]">
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
                className="order-2 inline-flex items-center gap-2 rounded-full border border-white/22 bg-white/5 px-6 py-2.5 text-sm font-medium text-white/90 transition duration-200 hover:border-white/40 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:order-1"
              >
                {t('landing_more_link')}
                <span aria-hidden className="text-lg leading-none">↗</span>
              </button>
              <button
                type="button"
                onClick={handleStart}
                className={`${primaryCtaClass} order-1 shadow-[0_16px_40px_rgba(16,185,129,0.45)] sm:order-2`}
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
          className="app-panel relative overflow-hidden scroll-mt-24 p-7 md:scroll-mt-28"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_24%,rgba(59,130,246,0.08),transparent_40%),radial-gradient(circle_at_82%_10%,rgba(16,185,129,0.08),transparent_38%)] dark:bg-[radial-gradient(circle_at_22%_24%,rgba(59,130,246,0.16),transparent_45%),radial-gradient(circle_at_82%_10%,rgba(16,185,129,0.16),transparent_45%)]" />

          <div className="relative space-y-3 text-center">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              {t('landing_how_title')}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t('landing_how_subtitle')}
            </p>
          </div>

          <div className="relative mt-10 grid gap-5 sm:grid-cols-3">
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white/90 via-white/80 to-slate-50/80 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-brand/45 hover:shadow-[0_26px_70px_rgba(15,23,42,0.12)] dark:border-white/10 dark:from-slate-900/80 dark:via-slate-900/70 dark:to-slate-900/60"
              >
                <div className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
                  <div className="absolute -left-16 top-0 h-40 w-40 rounded-full bg-gradient-to-br from-brand/45 via-indigo-400/25 to-transparent blur-3xl" />
                </div>

                <div className="relative flex flex-col gap-3">
                  <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-100">
                      {index + 1}
                    </span>
                    {t('landing_how_title')}
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
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
