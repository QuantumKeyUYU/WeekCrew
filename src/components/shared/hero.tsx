'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from '@/i18n/useTranslation';

export const LandingHero = () => {
  const t = useTranslation();
  return (
    <section className="space-y-6">
      <motion.h1
        className="text-3xl font-semibold leading-tight sm:text-4xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {t('hero_title')}
      </motion.h1>
      <motion.p
        className="text-base text-slate-300 sm:text-lg"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
      >
        {t('hero_description')}
      </motion.p>
      <motion.div
        className="flex flex-col gap-3 sm:flex-row"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
      >
        <Link
          href="/explore"
          className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-base font-medium text-slate-950 shadow-soft transition-transform hover:-translate-y-0.5"
        >
          {t('hero_primary_cta')}
        </Link>
        <Link
          href="#how-it-works"
          className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-base font-medium text-slate-100 transition-colors hover:border-brand"
        >
          {t('hero_secondary_cta')}
        </Link>
      </motion.div>
    </section>
  );
};
