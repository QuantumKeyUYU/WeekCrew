'use client';

import { motion } from 'framer-motion';
import type { Circle } from '@/types';

interface Props {
  circle: Circle;
}

export const IcebreakerCard = ({ circle }: Props) => {
  const current = circle.icebreakers?.[circle.currentIcebreakerIndex] ?? 'Скинь любимый трек недели';
  return (
    <motion.div
      className="rounded-3xl border border-brand/30 bg-brand/10 p-5 text-left"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <p className="text-xs uppercase tracking-wide text-brand-foreground/80">Айсбрейкер дня</p>
      <h3 className="mt-2 text-lg font-semibold text-brand-foreground">{current}</h3>
      <p className="mt-2 text-sm text-brand-foreground/80">
        Ответь или поделись чем-то созвучным — это помогает всем включиться в разговор.
      </p>
    </motion.div>
  );
};
