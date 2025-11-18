'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n/useTranslation';
import { primaryCtaClass } from '@/styles/tokens';

type CircleEmptyStateProps = {
  onReset: () => void;
};

export const CircleEmptyState = ({ onReset }: CircleEmptyStateProps) => {
  const t = useTranslation();
  return (
    <motion.div
      className="flex flex-col items-center gap-5 rounded-[2.5rem] border border-dashed border-slate-300/80 bg-white/95 p-8 text-center text-slate-700 shadow-[0_22px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand/70">WeekCrew</p>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{t('circle_empty_title')}</h2>
        <p className="mx-auto max-w-md text-sm text-slate-600 dark:text-slate-300">{t('circle_empty_description')}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/explore" className={`${primaryCtaClass} px-7 py-2.5 text-sm`}>
          {t('circle_empty_cta')}
        </Link>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-500 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-400 hover:text-slate-800 dark:border-white/20 dark:text-slate-200 dark:hover:border-white/40 dark:hover:text-white"
        >
          {t('circle_empty_reset_cta')}
        </button>
      </div>
    </motion.div>
  );
};
