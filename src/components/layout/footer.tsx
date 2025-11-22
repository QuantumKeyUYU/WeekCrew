'use client';

import { useTranslation } from '@/i18n/useTranslation';

export const Footer = () => {
  const t = useTranslation();
  return (
    <footer className="mt-16 px-4 pb-10 text-sm text-slate-600 dark:text-slate-300">
      <div className="mx-auto w-full max-w-5xl">
        <div className="grid gap-6 rounded-3xl border border-slate-200/90 bg-white/70 px-6 py-6 shadow-[0_-2px_12px_rgba(0,0,0,0.04)] backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:shadow-[0_-2px_18px_rgba(0,0,0,0.35)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">WeekCrew</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">© 2025 · {t('footer_tagline')}</p>
          </div>
          <div className="flex flex-col gap-2 text-sm sm:items-end">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t('footer_links_label')}
            </span>
            <div className="flex flex-wrap items-center gap-4 text-sm text-indigo-600 sm:justify-end">
              <a href="mailto:hey@weekcrew.app" className="transition hover:text-indigo-700 dark:hover:text-brand-foreground">
                {t('footer_support')}
              </a>
              <a href="https://blogs.cornell.edu" className="transition hover:text-indigo-700 dark:hover:text-brand-foreground">
                {t('footer_inspiration')}
              </a>
              <a href="/settings" className="transition hover:text-indigo-700 dark:hover:text-brand-foreground">
                {t('nav_settings')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
