'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from '@/i18n/useTranslation';
import { primaryCtaClass } from '@/styles/tokens';

export const LandingHero = () => {
  const t = useTranslation();
  return (
    <section className="space-y-4 sm:space-y-6">
      <motion.h1
        className="text-[2rem] font-semibold leading-tight text-slate-900 dark:text-slate-50 sm:text-4xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {t('hero_title')}
      </motion.h1>
      <motion.p
        className="text-base text-slate-600 dark:text-slate-300 sm:text-lg"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
      >
        {t('hero_description')}
      </motion.p>
      <motion.div
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
      >
        <Link
          href="/explore"
          className={primaryCtaClass}
        >
          {t('hero_primary_cta')}
        </Link>
        <Link
          href="#how-it-works"
          className="inline-flex items-center justify-center rounded-full border border-slate-200/80 bg-white/80 px-6 py-3 text-base font-medium text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:border-white/20 dark:bg-transparent dark:text-slate-100"
        >
          {t('hero_secondary_cta')}
        </Link>
      </motion.div>
    </section>
  );
};
