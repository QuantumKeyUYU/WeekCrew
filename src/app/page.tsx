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
    { title: t('landing_step_one_title'), description: t('landing_step_one_description') },
    { title: t('landing_step_two_title'), description: t('landing_step_two_description') },
    { title: t('landing_step_three_title'), description: t('landing_step_three_description') },
  ];

  return (
    <>
      <div className="space-y-8 py-6 sm:space-y-14 sm:py-10">
        {/* Верхняя карточка-бренд */}
        <section className="flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-4 py-3 shadow-[var(--shadow-soft)] sm:px-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <span className="app-chip inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-[var(--text-primary)]">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              WeekCrew · {t('landing_logo_tagline')}
            </span>
            <p className="text-xs text-[var(--text-secondary)] sm:text-sm">{t('landing_hero_subtitle')}</p>
          </div>
          {currentCircle && (
            <button
              type="button"
              onClick={() => router.push('/circle')}
              className="text-sm font-semibold text-[var(--text-secondary)] underline-offset-4 transition hover:text-[var(--text-primary)]"
            >
              {t('landing_go_to_circle')}
            </button>
          )}
        </section>

        {/* Hero-блок */}
        <section className="app-hero relative px-5 py-10 text-center text-white sm:px-10 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative mx-auto max-w-3xl space-y-6"
          >
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
              WeekCrew · {t('landing_logo_tagline')}
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
                onClick={handleStart}
                className={`${primaryCtaClass} order-1 sm:order-2`}
              >
                {t('landing_hero_cta')}
              </button>
              <button
                type="button"
                onClick={() =>
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
                }
                className={`${secondaryCtaClass} order-2 sm:order-1 text-white`}
              >
                {t('landing_more_link')} ↗
              </button>
            </div>
          </motion.div>
        </section>

        {/* Как устроен проект */}
        <section
          id="how-it-works"
          className="app-panel relative scroll-mt-24 p-6 md:scroll-mt-28"
        >
          <div className="relative space-y-3 text-center">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
              {t('landing_how_title')}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">{t('landing_how_subtitle')}</p>
          </div>

          <div className="relative mt-8 grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-4 text-left shadow-[var(--shadow-soft)]"
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
                  Шаг {index + 1}
                </div>
                <h3 className="mt-3 text-base font-semibold text-[var(--text-primary)]">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{step.description}</p>
              </article>
            ))}
          </div>

          <div className="relative mt-10 flex justify-center">
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
