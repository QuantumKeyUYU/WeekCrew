'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n/useTranslation';
import { primaryCtaClass } from '@/styles/tokens';

export const CircleEmptyState = () => {
  const t = useTranslation();
  return (
    <motion.div
      className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-slate-300/80 bg-[#fefcff] p-6 text-center shadow-[0_16px_40px_rgba(15,23,42,0.07)] dark:border-white/20 dark:bg-slate-950/50 sm:p-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <h2 className="text-xl font-semibold text-brand-foreground">{t('circle_empty_title')}</h2>
      <p className="max-w-sm text-sm text-slate-700 dark:text-slate-300">{t('circle_empty_description')}</p>
      <Link href="/explore" className={`${primaryCtaClass} px-6 py-2.5 text-sm`}>
        {t('circle_empty_cta')}
      </Link>
    </motion.div>
  );
};
