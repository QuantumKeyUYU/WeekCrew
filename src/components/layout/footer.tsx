'use client';

import { useTranslation } from '@/i18n/useTranslation';

export const Footer = () => {
  const t = useTranslation();
  return (
    <footer className="mt-12 border-t border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(247,247,255,0.98))] text-neutral-600 shadow-[0_-10px_28px_rgba(15,23,42,0.05)] transition-colors duration-300 dark:border-white/10 dark:bg-slate-950/80 dark:text-neutral-400">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} WeekCrew. {t('footer_tagline')}</p>
        <div className="flex items-center gap-4">
          <a
            href="mailto:hey@weekcrew.app"
            className="text-neutral-600 transition-colors hover:text-brand-foreground dark:text-neutral-400"
          >
            {t('footer_support')}
          </a>
          <a
            href="https://blogs.cornell.edu"
            className="text-neutral-600 transition-colors hover:text-brand-foreground dark:text-neutral-400"
          >
            {t('footer_inspiration')}
          </a>
        </div>
      </div>
    </footer>
  );
};
