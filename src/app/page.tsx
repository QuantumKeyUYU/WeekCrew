'use client';

import { LandingHero } from '@/components/shared/hero';
import { FEATURES } from '@/data/features';
import { useTranslation } from '@/i18n/useTranslation';
import { primaryCtaClass } from '@/styles/tokens';
import { useOnboardingModal } from '@/components/shared/onboarding-modal';

const steps = [
  { titleKey: 'home_step_select_interest_title', descriptionKey: 'home_step_select_interest_description' },
  { titleKey: 'home_step_join_circle_title', descriptionKey: 'home_step_join_circle_description' },
  { titleKey: 'home_step_week_of_warmth_title', descriptionKey: 'home_step_week_of_warmth_description' }
] as const;

export default function HomePage() {
  const t = useTranslation();
  const { OnboardingModal, openOnboarding } = useOnboardingModal();
  const panelClass =
    'rounded-3xl border border-slate-200/80 bg-[#fdfcff] p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-colors dark:border-white/10 dark:bg-slate-900/70 sm:p-6';
  const cardClass =
    'rounded-2xl border border-slate-200/70 bg-white/95 p-4 text-slate-700 shadow-[0_8px_22px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-[0_16px_36px_rgba(127,90,240,0.12)] dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200 sm:p-5';
  return (
    <div className="space-y-6 sm:space-y-12">
      <LandingHero onHowItWorks={openOnboarding} />
      <OnboardingModal />

      <section id="how-it-works" className={`grid gap-3 sm:gap-5 ${panelClass}`}>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">{t('home_how_it_works_title')}</h2>
        <div className="grid gap-2.5 sm:gap-4">
          {steps.map((step) => (
            <div key={step.titleKey} className={cardClass}>
              <h3 className="text-base font-semibold text-brand-foreground sm:text-lg">{t(step.titleKey)}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">{t(step.descriptionKey)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">{t('home_why_cozy_title')}</h2>
        <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3.5">
          {FEATURES.map((feature) => (
            <div
              key={feature.titleKey}
              className="rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_12px_32px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-[0_22px_48px_rgba(127,90,240,0.15)] dark:border-white/10 dark:bg-slate-900/60 sm:p-5"
            >
              <h3 className="text-base font-semibold text-brand-foreground sm:text-lg">{t(feature.titleKey)}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 min-h-[5.5rem]">{t(feature.descriptionKey)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-4 text-center shadow-[0_16px_36px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-900/70 sm:p-6">
        <h2 className="text-xl font-semibold text-brand-foreground sm:text-2xl">{t('home_ready_title')}</h2>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{t('home_ready_description')}</p>
        <div className="mt-4">
          <a
            href="/explore"
            className={`${primaryCtaClass} px-7 py-2.5`}
          >
            {t('home_ready_cta')}
          </a>
        </div>
      </section>
    </div>
  );
}
