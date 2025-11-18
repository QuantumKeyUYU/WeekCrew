'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useTranslation } from '@/i18n/useTranslation';
import { primaryCtaClass, secondaryCtaClass } from '@/styles/tokens';

type CircleEmptyStateProps = {
  onReset: () => void;
};

export const CircleEmptyState = ({ onReset }: CircleEmptyStateProps) => {
  const t = useTranslation();
  return (
    <motion.div
      className="flex flex-col items-center gap-6 rounded-[2.75rem] border border-white/15 bg-[radial-gradient(circle_at_top,_rgba(119,94,241,0.35),_transparent),_rgba(6,9,26,0.96)] p-8 text-center text-slate-100 shadow-[0_30px_80px_rgba(5,7,22,0.85)] sm:p-10"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">WeekCrew</p>
        <h2 className="text-2xl font-semibold text-white">{t('circle_empty_title')}</h2>
        <p className="mx-auto max-w-md text-sm text-white/80">{t('circle_empty_description')}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/explore" className={primaryCtaClass}>
          {t('circle_empty_cta')}
        </Link>
        <button type="button" onClick={onReset} className={clsx(secondaryCtaClass, 'text-white/80 hover:text-white')}>
          {t('circle_empty_reset_cta')}
        </button>
      </div>
    </motion.div>
  );
};
