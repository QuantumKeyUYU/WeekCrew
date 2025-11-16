'use client';

import { useTranslation } from '@/i18n/useTranslation';

export const Footer = () => {
  const t = useTranslation();
  return (
    <footer className="border-t border-white/10 bg-slate-950/80">
      <div className="mx-auto flex max-w-3xl flex-col gap-2 px-4 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} WeekCrew. {t('footer_tagline')}</p>
        <div className="flex items-center gap-3">
          <a
            href="mailto:hey@weekcrew.app"
            className="transition-colors hover:text-brand-foreground"
          >
            {t('footer_support')}
          </a>
          <a href="https://blogs.cornell.edu" className="transition-colors hover:text-brand-foreground">
            {t('footer_inspiration')}
          </a>
        </div>
      </div>
    </footer>
  );
};
