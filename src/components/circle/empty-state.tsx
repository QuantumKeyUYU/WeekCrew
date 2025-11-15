'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export const CircleEmptyState = () => {
  return (
    <motion.div
      className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-white/20 bg-slate-950/50 p-8 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <h2 className="text-xl font-semibold text-brand-foreground">Ты ещё не в кружке</h2>
      <p className="max-w-sm text-sm text-slate-300">
        Выбери интересы в разделе «Кружки» — и мы подберём уютную компанию. Каждый раз новая
        комбинация людей.
      </p>
      <Link
        href="/explore"
        className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-2 text-sm font-medium text-slate-950 shadow-soft"
      >
        Подобрать кружок
      </Link>
    </motion.div>
  );
};
