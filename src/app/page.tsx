'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n/useTranslation';
import { primaryCtaClass, secondaryCtaClass } from '@/styles/tokens';
import { SafetyRulesModal } from '@/components/modals/safety-rules-modal';
import { useSafetyRules } from '@/hooks/useSafetyRules';
import { TestModeHint } from '@/components/shared/test-mode-hint';

export default function HomePage() {
  const router = useRouter();
  const t = useTranslation();
  const { accepted, markAccepted } = useSafetyRules();
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

  const stepTitles = [
    t('landing_step_one_title'),
    t('landing_step_two_title'),
    t('landing_step_three_title'),
  ];

  const stepDescriptions = [
    t('landing_step_one_description'),
    t('landing_step_two_description'),
    t('landing_step_three_description'),
  ];

  return (
    <>
      <div className="space-y-10 py-8 sm:space-y-16 sm:py-12">
        {/* Hero-блок */}
        <section className="space-y-4">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[12px] font-semibold text-white/90 shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_0_4px_rgba(34,197,94,0.25)]" />
              <span className="tracking-wide">WeekCrew · {t('landing_logo_tagline')}</span>
            </div>
          </div>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="app-hero relative overflow-hidden px-6 py-10 text-left text-[var(--text-primary)] sm:px-10 sm:py-14"
          >
            <div className="pointer-events-none absolute inset-0 opacity-90">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(124,136,255,0.22),transparent_40%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_14%,rgba(34,197,94,0.18),transparent_42%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_26%,rgba(255,255,255,0.08))]" />
            </div>

            <div className="relative mx-auto flex max-w-4xl flex-col gap-6 sm:gap-8">
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-4xl font-semibold leading-tight tracking-tight text-[var(--text-primary)] sm:text-5xl">
                  {t('landing_hero_title')}
                </h1>
                <p className="max-w-2xl text-base text-[var(--text-secondary)] sm:text-lg">
                  {t('landing_hero_subtitle')}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <button type="button" onClick={handleStart} className={primaryCtaClass}>
                  {t('landing_hero_cta')}
                </button>
                <button
                  type="button"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className={secondaryCtaClass}
                >
                  {t('landing_more_link')} →
                </button>
              </div>
            </div>
          </motion.section>
        </section>

        {/* Как устроен проект */}
        <section
          id="how-it-works"
          className="app-panel relative space-y-8 scroll-mt-24 p-6 md:scroll-mt-28 md:p-8"
          aria-labelledby="how-title"
        >
          <div className="space-y-2 text-center">
            <h2 id="how-title" className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              {t('landing_how_title')}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">{t('landing_how_subtitle')}</p>
          </div>

          <ol className="steps-list">
            {stepTitles.map((title, index) => (
              <li
                key={title}
                className="group relative overflow-hidden rounded-3xl border border-[var(--border-card)] bg-[var(--surface-elevated)]/95 p-4 shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-card-strong)] sm:p-5"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(79,70,229,0.08),transparent_35%),radial-gradient(circle_at_90%_40%,rgba(34,197,94,0.08),transparent_32%)]" />
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <span className="step-index text-base leading-none transition-transform duration-200 group-hover:scale-[1.05] group-hover:shadow-[0_12px_28px_rgba(79,70,229,0.25)]">
                    {index + 1}
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">{title}</h3>
                    <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{stepDescriptions[index]}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="relative flex justify-center">
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
