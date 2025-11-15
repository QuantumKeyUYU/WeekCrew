'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export const LandingHero = () => {
  return (
    <section className="space-y-6">
      <motion.h1
        className="text-3xl font-semibold leading-tight sm:text-4xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        WeekCrew — кружок недели. Каждые 7 дней новая ламповая команда единомышленников.
      </motion.h1>
      <motion.p
        className="text-base text-slate-300 sm:text-lg"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
      >
        Войди в тёплый кружок интересов: без бесконечных лент, лайков и токсичности. Семь дней на
        обмен эмоциями, мемами и любимыми находками — потом новый кружок и свежие люди.
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
          Войти в кружок недели
        </Link>
        <Link
          href="#how-it-works"
          className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-base font-medium text-slate-100 transition-colors hover:border-brand"
        >
          Как это работает
        </Link>
      </motion.div>
    </section>
  );
};
