'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n/useTranslation';
import { primaryCtaClass } from '@/styles/tokens';
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

  const steps = [
    { title: t('landing_step_one_title'), description: t('landing_step_one_description') },
    { title: t('landing_step_two_title'), description: t('landing_step_two_description') },
    { title: t('landing_step_three_title'), description: t('landing_step_three_description') },
  ];

  return (
    <>
      <div className="space-y-8 py-6 sm:space-y-14 sm:py-10">
        {/* Hero-блок */}
        <section className="app-hero relative px-5 py-10 text-center text-white sm:px-10 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative mx-auto max-w-3xl space-y-6"
          >
            <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white/85">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-300" />
              WeekCrew · {t('landing_logo_tagline')}
            </div>

            <h1 className="text-[2.05rem] font-semibold leading-tight sm:text-[2.9rem]">
              {t('landing_hero_title')}
            </h1>

            <p className="text-base text-white/80 sm:text-lg">
              {t('landing_hero_subtitle')}
            </p>

            <div className="flex flex-col items-center justify-center gap-2 sm:gap-3">
              <button type="button" onClick={handleStart} className={primaryCtaClass}>
                {t('landing_hero_cta')}
              </button>
              <button
                type="button"
                onClick={() =>
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="text-sm font-semibold text-white/80 underline-offset-4 transition hover:text-white"
              >
                {t('landing_more_link')} →
              </button>
            </div>
          </motion.div>
        </section>

        {/* Как устроен проект */}
        <section id="how-it-works" className="app-panel relative space-y-8 scroll-mt-24 p-6 md:scroll-mt-28 md:p-8">
          <div className="relative space-y-3 text-center">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
              {t('landing_how_title')}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">{t('landing_how_subtitle')}</p>
          </div>

          <ol className="space-y-4">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="flex items-start gap-3 border-b border-[var(--border-subtle)] pb-4 last:border-b-0 last:pb-0"
              >
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-subtle)] text-sm font-semibold text-[var(--text-primary)]">
                  {index + 1}
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-[var(--text-primary)]">Шаг {index + 1}</div>
                  <p className="text-base font-semibold text-[var(--text-primary)]">{step.title}</p>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{step.description}</p>
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
