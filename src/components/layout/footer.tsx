'use client';

import { useTranslation } from '@/i18n/useTranslation';

export const Footer = () => {
  const t = useTranslation();
  return (
    <footer className="mt-16 px-4 pb-10 text-sm text-slate-600 dark:text-slate-300">
      <div className="mx-auto w-full max-w-5xl">
        <div className="app-panel flex flex-col gap-3 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-300">© 2025 WeekCrew. {t('footer_tagline')}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <a href="mailto:hey@weekcrew.app" className="transition hover:text-brand-foreground">
              {t('footer_support')}
            </a>
            <a href="https://blogs.cornell.edu" className="transition hover:text-brand-foreground">
              {t('footer_inspiration')}
            </a>
            <a href="/settings" className="transition hover:text-brand-foreground">
              {t('nav_settings')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
