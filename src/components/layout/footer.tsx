'use client';

import { useTranslation } from '@/i18n/useTranslation';

export const Footer = () => {
  const t = useTranslation();
  return (
    <footer className="mt-16 px-4 pb-10 text-sm text-[var(--text-secondary)]">
      <div className="mx-auto w-full max-w-5xl">
        <div className="grid gap-5 rounded-3xl border border-[var(--border-card)] bg-[var(--surface-subtle)]/90 px-5 py-5 shadow-[0_-10px_38px_rgba(15,23,42,0.08)] backdrop-blur sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">WeekCrew</p>
            <p className="text-sm text-[var(--text-secondary)]">© 2025 · {t('footer_tagline')}</p>
          </div>
          <div className="flex flex-col gap-2 text-sm sm:items-end">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              {t('footer_links_label')}
            </span>
            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-primary)] sm:justify-end">
              <a
                href="mailto:hey@weekcrew.app"
                className="transition hover:text-indigo-600 hover:underline hover:underline-offset-4 dark:hover:text-emerald-200"
              >
                {t('footer_support')}
              </a>
              <a
                href="https://blogs.cornell.edu"
                className="transition hover:text-indigo-600 hover:underline hover:underline-offset-4 dark:hover:text-emerald-200"
              >
                {t('footer_inspiration')}
              </a>
              <a
                href="/settings"
                className="transition hover:text-indigo-600 hover:underline hover:underline-offset-4 dark:hover:text-emerald-200"
              >
                {t('nav_settings')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
