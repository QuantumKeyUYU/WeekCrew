'use client';

import clsx from 'clsx';
import { motion, type Variants } from 'framer-motion';
import type { InterestId } from '@/types';

type InterestCard = { id: InterestId; label: string; emoji: string };

type StepInterestProps = {
  t: (key: string, options?: Record<string, unknown>) => string;
  variants: Variants;
  custom: number;
  interests: InterestCard[];
  selectedInterest: InterestId | null;
  randomInterest: boolean;
  onSelect: (interest: InterestId) => void;
  onRandomToggle: () => void;
  isLanguageMood: boolean;
};

const glowPalette = [
  'shadow-[0_0_30px_rgba(79,70,229,0.45)] border-indigo-200/60',
  'shadow-[0_0_30px_rgba(14,165,233,0.4)] border-cyan-200/60',
  'shadow-[0_0_30px_rgba(16,185,129,0.35)] border-emerald-200/60',
  'shadow-[0_0_30px_rgba(236,72,153,0.45)] border-pink-200/60',
  'shadow-[0_0_30px_rgba(234,179,8,0.35)] border-amber-200/70',
  'shadow-[0_0_30px_rgba(59,130,246,0.4)] border-blue-200/70',
];

export default function StepInterest({
  t,
  variants,
  custom,
  interests,
  selectedInterest,
  randomInterest,
  onSelect,
  onRandomToggle,
  isLanguageMood,
}: StepInterestProps) {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={variants}
      custom={custom}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_25px_rgba(124,58,237,0.2)] backdrop-blur-xl sm:p-8"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(59,130,246,0.12),transparent_40%),radial-gradient(circle_at_10%_90%,rgba(244,114,182,0.12),transparent_35%)]" aria-hidden />
      <div className="relative space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">{t('explore_step_two_title')}</p>
            <h2 className="mt-2 text-3xl font-semibold leading-tight text-white">{t('explore_step_two_heading')}</h2>
            <p className="mt-1 text-base text-white/70">{t('explore_step_two_description')}</p>
          </div>
          <span className="hidden rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 sm:inline-flex">
            {t('explore_step_two_badge')}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-2">
          {interests.map((card, index) => {
            const active = selectedInterest === card.id;
            const glowClass = glowPalette[index % glowPalette.length];
            return (
              <motion.button
                key={card.id}
                type="button"
                whileHover={{ scale: 1.02, rotate: 1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(card.id)}
                className={clsx(
                  'relative flex h-full flex-col items-start gap-3 rounded-2xl border px-4 py-4 text-left text-white transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                  active
                    ? `bg-gradient-to-br from-violet-500/60 to-fuchsia-400/40 ${glowClass}`
                    : 'bg-white/5 border-white/15 text-white/80 hover:-translate-y-1 hover:border-white/30 hover:shadow-[0_0_25px_rgba(94,92,241,0.25)]',
                )}
                aria-pressed={active}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl" aria-hidden>
                    {card.emoji}
                  </span>
                  <span className="text-lg font-semibold leading-tight">{card.label}</span>
                </div>
                <p className="text-xs text-white/60">{isLanguageMood ? t('explore_sync_hint') : t('explore_ready_description')}</p>
              </motion.button>
            );
          })}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onRandomToggle}
            className={clsx(
              'flex items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-3 text-sm font-semibold transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
              randomInterest
                ? 'border-white/70 bg-gradient-to-r from-indigo-500/40 to-fuchsia-500/30 text-white shadow-[0_0_25px_rgba(139,92,246,0.35)]'
                : 'border-white/20 bg-white/5 text-white/75 hover:-translate-y-0.5 hover:border-white/40 hover:text-white',
            )}
          >
            🎲 {t('explore_random_button')}
          </button>
          <p className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/65 shadow-inner shadow-white/5">
            <span aria-hidden>💡</span>
            <span>{t('explore_interest_hint')}</span>
          </p>
        </div>
      </div>
    </motion.section>
  );
}
