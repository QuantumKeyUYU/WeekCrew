'use client';

import Link from 'next/link';
import { useTranslation } from '@/i18n/useTranslation';

export const Footer = () => {
  const t = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 px-3 pb-8 text-xs text-[var(--text-secondary)] sm:mt-16 sm:px-6 sm:pb-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--border-card)] bg-[var(--surface-subtle)]/95 px-5 py-5 shadow-[0_22px_60px_rgba(15,23,42,0.32)] backdrop-blur-md sm:px-7 sm:py-6">
          {/* Лёгкие градиентные подсветки */}
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(96,165,250,0.16),transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(45,212,191,0.12),transparent_55%)]" />
          </div>

          <div className="relative grid gap-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] sm:items-center">
            {/* Левая часть: бренд + описание */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                WEEKCREW
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                © {year} · {t('footer_tagline')}
              </p>
            </div>

            {/* Правая часть: ссылки */}
            <div className="space-y-2 sm:text-right">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                {t('footer_links_label')}
              </span>

              <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-primary)] sm:justify-end">
                <a
                  href="mailto:hey@weekcrew.app"
                  className="relative after:absolute after:-bottom-[2px] after:left-0 after:h-[1px] after:w-0 after:bg-current after:transition-[width] after:duration-200 hover:after:w-full"
                >
                  {t('footer_support')}
                </a>

                <a
                  href="https://blogs.cornell.edu"
                  target="_blank"
                  rel="noreferrer"
                  className="relative after:absolute after:-bottom-[2px] after:left-0 after:h-[1px] after:w-0 after:bg-current after:transition-[width] after:duration-200 hover:after:w-full"
                >
                  {t('footer_inspiration')}
                </a>

                <Link
                  href="/settings"
                  className="relative after:absolute after:-bottom-[2px] after:left-0 after:h-[1px] after:w-0 after:bg-current after:transition-[width] after:duration-200 hover:after:w-full"
                >
                  {t('nav_settings')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
