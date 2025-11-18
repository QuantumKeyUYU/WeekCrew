'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n/useTranslation';
import { primaryCtaClass } from '@/styles/tokens';
import { SafetyRulesModal } from '@/components/modals/safety-rules-modal';
import { useSafetyRules } from '@/hooks/useSafetyRules';
import { useWeekcrewSnapshot } from '@/lib/weekcrewStorage';

export default function HomePage() {
  const router = useRouter();
  const t = useTranslation();
  const { accepted, markAccepted } = useSafetyRules();
  const { currentCircle } = useWeekcrewSnapshot((snapshot) => ({ currentCircle: snapshot.currentCircle }));
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

  const steps = useMemo(
    () => [
      { title: t('landing_step_one_title'), description: t('landing_step_one_description') },
      { title: t('landing_step_two_title'), description: t('landing_step_two_description') },
      { title: t('landing_step_three_title'), description: t('landing_step_three_description') },
    ],
    [t],
  );

  return (
    <>
      <div className="space-y-16 py-10 sm:py-16">
        <section className="flex flex-col items-center gap-3 text-center">
          <span className="text-lg font-semibold text-slate-900 dark:text-white">WeekCrew</span>
          <p className="text-sm text-slate-500 dark:text-slate-300">{t('landing_logo_tagline')}</p>
        </section>

        <section className="rounded-[3rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-brand/20 px-6 py-12 text-center text-white shadow-[0_35px_100px_rgba(5,7,22,0.85)] sm:px-12">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
            <h1 className="text-3xl font-semibold leading-tight sm:text-[2.9rem]">{t('landing_hero_title')}</h1>
            <p className="mt-4 text-base text-white/80">{t('landing_hero_subtitle')}</p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <button type="button" onClick={handleStart} className={primaryCtaClass}>
                {t('landing_hero_cta')}
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-sm font-medium text-white/80 transition hover:text-white"
              >
                {t('landing_more_link')}
              </button>
            </div>
            {currentCircle && (
              <button
                type="button"
                onClick={() => router.push('/circle')}
                className="mt-4 text-sm font-medium text-white/70 underline-offset-4 transition hover:text-white"
              >
                {t('landing_go_to_circle')}
              </button>
            )}
          </motion.div>
        </section>

        <section
          id="how-it-works"
          className="rounded-[2.5rem] border border-slate-200/80 bg-white/95 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] scroll-mt-24 md:scroll-mt-28 dark:border-white/10 dark:bg-slate-900/80"
        >
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{t('landing_how_title')}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">{t('landing_how_subtitle')}</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {steps.map((step) => (
              <article key={step.title} className="rounded-3xl border border-slate-200/70 bg-white/95 p-5 text-left shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-900/70">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{step.description}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <button type="button" onClick={handleStart} className={primaryCtaClass}>
              {t('landing_hero_cta')}
            </button>
          </div>
        </section>
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">{t('landing_test_mode_hint')}</p>
      </div>
      <SafetyRulesModal open={showModal} onAccept={handleAcceptRules} onClose={handleCloseModal} />
    </>
  );
}
