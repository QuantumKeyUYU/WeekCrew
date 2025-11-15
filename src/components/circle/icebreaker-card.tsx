'use client';

import { motion } from 'framer-motion';
import type { Circle } from '@/types';
import { getIcebreakerForCircle } from '@/data/icebreakers';

interface Props {
  circle: Circle;
  // eslint-disable-next-line no-unused-vars
  onAnswerClick?: (prompt: string) => void;
}

export const IcebreakerCard = ({ circle, onAnswerClick }: Props) => {
  const icebreaker = getIcebreakerForCircle(circle.id, new Date(), circle.icebreakerSeed);
  return (
    <motion.div
      className="rounded-3xl border border-brand/30 bg-brand/10 p-5 text-left"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <p className="text-xs uppercase tracking-wide text-brand-foreground/80">Айсбрейкер дня</p>
      <h3 className="mt-2 text-lg font-semibold text-brand-foreground">{icebreaker.text}</h3>
      <p className="mt-2 text-sm text-brand-foreground/80">
        Ответь или поделись чем-то созвучным — это помогает всем включиться в разговор.
      </p>
      {onAnswerClick && (
        <button
          type="button"
          onClick={() => onAnswerClick(`Ответ на айсбрейкер: ${icebreaker.text} — `)}
          className="mt-3 inline-flex items-center justify-center rounded-full border border-brand/40 px-4 py-2 text-xs font-semibold text-brand-foreground transition hover:-translate-y-0.5"
        >
          Ответить на вопрос дня
        </button>
      )}
    </motion.div>
  );
};
