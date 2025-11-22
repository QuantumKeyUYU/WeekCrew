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
      <div className="space-y-16 py-10 sm:py-16">
        <section className="flex flex-col items-center gap-2 text-center">
          <span className="app-chip inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-white/50 backdrop-blur-md dark:text-white">
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-brand to-indigo-400" />
            WeekCrew
          </span>
          <p className="text-sm text-slate-500 dark:text-slate-300">{t('landing_logo_tagline')}</p>
        </section>

        <section className="app-hero relative overflow-hidden px-6 py-14 text-center text-white sm:px-14">
          <div className="pointer-events-none absolute inset-0 opacity-80">
            <div className="absolute inset-x-10 -top-24 h-72 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.12),transparent_55%)] blur-3xl" />
            <div className="absolute -left-10 top-12 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.18),transparent_55%)] blur-3xl" />
            <div className="absolute -right-24 bottom-0 h-64 w-72 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(116,181,255,0.2),transparent_55%)] blur-3xl" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative mx-auto max-w-3xl space-y-6"
          >
            <div className="mx-auto flex max-w-xs items-center justify-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/80 shadow-inner shadow-white/10 backdrop-blur">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_0_6px_rgba(16,185,129,0.25)]" />
              {t('landing_more_link')}
            </div>
            <h1 className="text-3xl font-semibold leading-tight sm:text-[2.9rem]">{t('landing_hero_title')}</h1>
            <p className="text-base text-white/80 sm:text-lg">{t('landing_hero_subtitle')}</p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-3">
              <button type="button" onClick={handleStart} className={primaryCtaClass}>
                {t('landing_hero_cta')}
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-medium text-white/90 transition hover:border-white/35 hover:text-white/100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                {t('landing_more_link')}
              </button>
            </div>
            {currentCircle && (
              <button
                type="button"
                onClick={() => router.push('/circle')}
                className="text-sm font-medium text-white/70 underline-offset-4 transition hover:text-white"
              >
                {t('landing_go_to_circle')}
              </button>
            )}
          </motion.div>
          <div className="pointer-events-none absolute inset-x-6 bottom-10 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </section>

        <section id="how-it-works" className="app-panel relative overflow-hidden scroll-mt-24 p-7 md:scroll-mt-28">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.06),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.05),transparent_35%)]" />
          <div className="relative space-y-4 text-center">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{t('landing_how_title')}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">{t('landing_how_subtitle')}</p>
          </div>
          <div className="relative mt-10 grid gap-5 sm:grid-cols-3">
            {steps.map((step) => (
              <article
                key={step.title}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-lg transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(15,23,42,0.15)] dark:border-white/10 dark:bg-white/5"
              >
                <div className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
                  <div className="absolute -left-10 top-0 h-40 w-40 bg-gradient-to-br from-brand/30 via-indigo-400/15 to-transparent blur-3xl" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{step.description}</p>
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
