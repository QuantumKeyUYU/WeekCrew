'use client';

import { LandingHero } from '@/components/shared/hero';
import { FEATURES } from '@/data/features';
import { useTranslation } from '@/i18n/useTranslation';

const steps = [
  { titleKey: 'home_step_select_interest_title', descriptionKey: 'home_step_select_interest_description' },
  { titleKey: 'home_step_join_circle_title', descriptionKey: 'home_step_join_circle_description' },
  { titleKey: 'home_step_week_of_warmth_title', descriptionKey: 'home_step_week_of_warmth_description' }
] as const;

export default function HomePage() {
  const t = useTranslation();
  return (
    <div className="space-y-16">
      <LandingHero />

      <section id="how-it-works" className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h2 className="text-xl font-semibold text-slate-100">{t('home_how_it_works_title')}</h2>
        <div className="grid gap-4">
          {steps.map((step) => (
            <div key={step.titleKey} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <h3 className="text-lg font-medium text-brand-foreground">{t(step.titleKey)}</h3>
              <p className="text-sm text-slate-300">{t(step.descriptionKey)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <h2 className="text-xl font-semibold text-slate-100">{t('home_why_cozy_title')}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div
              key={feature.titleKey}
              className="rounded-3xl border border-white/10 bg-slate-950/30 p-5 shadow-lg shadow-brand/5"
            >
              <h3 className="text-lg font-medium text-brand-foreground">{t(feature.titleKey)}</h3>
              <p className="text-sm text-slate-300">{t(feature.descriptionKey)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-brand/30 bg-brand/10 p-6 text-center">
        <h2 className="text-2xl font-semibold text-brand-foreground">{t('home_ready_title')}</h2>
        <p className="mt-2 text-sm text-slate-300">{t('home_ready_description')}</p>
        <div className="mt-4">
          <a
            href="/explore"
            className="inline-flex items-center justify-center rounded-full bg-brand px-8 py-3 text-base font-medium text-slate-950 shadow-soft transition-transform hover:-translate-y-0.5"
          >
            {t('home_ready_cta')}
          </a>
        </div>
      </section>
    </div>
  );
}
