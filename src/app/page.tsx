'use client';

import { useState, useCallback, useMemo } from 'react';
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

  const handleScrollToHow = useCallback(() => {
    const target = document.getElementById('how-it-works');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleStart = useCallback(() => {
    if (accepted) {
      router.push('/explore');
      return;
    }
    setShowModal(true);
  }, [accepted, router]);

  const handleAcceptRules = useCallback(() => {
    markAccepted();
    setShowModal(false);
    router.push('/explore');
  }, [markAccepted, router]);

  const handleCloseModal = useCallback(() => setShowModal(false), []);

  const stepTitles = useMemo(
    () => [
      t('landing_step_one_title'),
      t('landing_step_two_title'),
      t('landing_step_three_title'),
    ],
    [t],
  );

  const stepDescriptions = useMemo(
    () => [
      t('landing_step_one_description'),
      t('landing_step_two_description'),
      t('landing_step_three_description'),
    ],
    [t],
  );

  return (
    <>
      <main className="app-shell space-y-10 sm:space-y-16">
        {/* Hero-секция */}
        <section className="space-y-6 sm:space-y-8">
          <div className="flex justify-center">
            <div className="tagline-pill inline-flex items-center gap-2">
              <span className="tagline-dot" />
              <span className="tagline-text">
                WeekCrew · {t('landing_logo_tagline')}
              </span>
            </div>
          </div>

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="app-hero relative overflow-hidden px-6 py-8 text-left sm:px-10 sm:py-12"
          >
            <div className="pointer-events-none absolute inset-0 opacity-70">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(129,140,248,0.22),transparent_45%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_10%,rgba(45,212,191,0.18),transparent_45%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.5),transparent_40%,rgba(255,255,255,0.35))]" />
            </div>

            <div className="relative mx-auto flex max-w-4xl flex-col gap-6 sm:gap-8">
              <div className="space-y-3 sm:space-y-4">
                {/* Чуть меньше заголовок на мобиле */}
                <h1 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--text-primary)] sm:text-5xl">
                  {t('landing_hero_title')}
                </h1>
                <p className="max-w-2xl text-base text-[var(--text-secondary)] sm:text-lg">
                  {t('landing_hero_subtitle')}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <button
                  type="button"
                  onClick={handleStart}
                  className={primaryCtaClass}
                >
                  {t('landing_hero_cta')}
                </button>
                <button
                  type="button"
                  onClick={handleScrollToHow}
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
            <h2
              id="how-title"
              className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]"
            >
              {t('landing_how_title')}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {t('landing_how_subtitle')}
            </p>
          </div>

          <ol className="steps-list">
            {stepTitles.map((title, index) => (
              <li
                key={title}
                className="group relative overflow-hidden rounded-3xl border border-[var(--border-card)] bg-[var(--surface-elevated)]/96 p-4 shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-card-strong)] sm:p-5"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(79,70,229,0.08),transparent_35%),radial-gradient(circle_at_90%_40%,rgba(34,197,94,0.08),transparent_32%)]" />
                </div>

                <div className="relative flex items-start gap-3 sm:gap-4">
                  <span className="step-index transition-transform duration-200 group-hover:scale-[1.05] group-hover:shadow-[0_18px_42px_rgba(79,70,229,0.5)]">
                    {index + 1}
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
                      {title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                      {stepDescriptions[index]}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="relative flex justify-center pt-2">
            <button
              type="button"
              onClick={handleStart}
              className={primaryCtaClass}
            >
              {t('landing_hero_cta')}
            </button>
          </div>
        </section>

        <TestModeHint />
      </main>

      <SafetyRulesModal
        open={showModal}
        onAccept={handleAcceptRules}
        onClose={handleCloseModal}
      />
    </>
  );
}
