'use client';

import { motion } from 'framer-motion';
import type { Circle } from '@/types';
import { useCountdown } from '@/hooks/useCountdown';

interface Props {
  circle: Circle;
}

export const CircleHeader = ({ circle }: Props) => {
  const countdown = useCountdown(circle.expiresAt);
  return (
    <motion.div
      className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="flex flex-col gap-2">
        <div className="text-xs uppercase tracking-wide text-slate-400">Тема недели</div>
        <h1 className="text-2xl font-semibold text-brand-foreground">{circle.title}</h1>
        <p className="text-sm text-slate-300">{circle.description || "Уютный круг по интересу"}</p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-300">
        <span className="rounded-full border border-white/10 px-3 py-1 text-slate-200/80">
          Участников: {circle.participantCount}/{circle.participantLimit}
        </span>
        <span className="rounded-full border border-white/10 px-3 py-1 text-slate-200/80">
          До конца недели: {countdown}
        </span>
        <span className="rounded-full border border-white/10 px-3 py-1 text-slate-200/80">
          Старт: {new Date(circle.weekStart).toLocaleDateString('ru-RU')}
        </span>
      </div>
    </motion.div>
  );
};
