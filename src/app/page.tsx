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
        <section className="relative overflow-hidden rounded-[32px] border border-slate-200/50 bg-white/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_18%_30%,rgba(14,165,233,0.12),transparent_36%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.12),transparent_35%)]" />
          <div className="relative flex flex-col items-center gap-2 text-center">
            <span className="app-chip inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-white/70 backdrop-blur-md dark:text-white">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-brand to-indigo-400 shadow-[0_0_0_8px_rgba(59,130,246,0.2)]" />
              WeekCrew
            </span>
            <p className="text-sm text-slate-500 dark:text-slate-300">{t('landing_logo_tagline')}</p>
          </div>
        </section>

        <section className="app-hero relative overflow-hidden px-6 py-16 text-center text-white sm:px-12">
          <div className="pointer-events-none absolute inset-0 opacity-90">
            <div className="absolute inset-x-6 -top-28 h-72 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.18),transparent_52%)] blur-3xl" />
            <div className="absolute -left-10 top-8 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(94,234,212,0.3),transparent_55%)] blur-3xl" />
            <div className="absolute -right-24 bottom-0 h-72 w-80 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.32),transparent_60%)] blur-3xl" />
            <div className="absolute inset-x-10 bottom-6 h-px bg-gradient-to-r from-white/0 via-white/40 to-white/0" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative mx-auto max-w-3xl space-y-7"
          >
            <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80 shadow-inner shadow-white/10 backdrop-blur">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_0_8px_rgba(16,185,129,0.24)]" />
              {t('landing_more_link')}
            </div>
            <h1 className="text-3xl font-semibold leading-tight sm:text-[2.9rem]">{t('landing_hero_title')}</h1>
            <p className="text-base text-white/80 sm:text-lg">{t('landing_hero_subtitle')}</p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <button
                type="button"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="order-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-medium text-white/90 transition duration-200 hover:border-white/35 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:order-1"
              >
                {t('landing_more_link')}
                <span aria-hidden className="text-lg leading-none">↗</span>
              </button>
              <button type="button" onClick={handleStart} className={`${primaryCtaClass} order-1 shadow-[0_12px_35px_rgba(16,185,129,0.35)] sm:order-2`}>
                {t('landing_hero_cta')}
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
        </section>

        <section id="how-it-works" className="app-panel relative overflow-hidden scroll-mt-24 p-7 md:scroll-mt-28">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_24%,rgba(59,130,246,0.08),transparent_38%),radial-gradient(circle_at_82%_6%,rgba(16,185,129,0.08),transparent_34%)]" />
          <div className="relative space-y-4 text-center">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{t('landing_how_title')}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">{t('landing_how_subtitle')}</p>
          </div>
          <div className="relative mt-10 grid gap-5 sm:grid-cols-3">
            {steps.map((step) => (
              <article
                key={step.title}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white/85 via-white/65 to-white/40 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_28px_70px_rgba(15,23,42,0.12)] dark:border-white/10 dark:from-white/10 dark:via-white/5 dark:to-white/0"
              >
                <div className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
                  <div className="absolute -left-12 top-0 h-40 w-40 rounded-full bg-gradient-to-br from-brand/40 via-indigo-400/20 to-transparent blur-3xl" />
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
