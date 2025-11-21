'use client';

import clsx from 'clsx';
import { motion, type Variants } from 'framer-motion';
import { MOOD_OPTIONS, type MoodKey } from '@/constants/moods';

type StepMoodProps = {
  t: (key: string, options?: Record<string, unknown>) => string;
  variants: Variants;
  custom: number;
  selectedMood: MoodKey | null;
  onSelect: (mood: MoodKey) => void;
  moodLabel: string | null;
};

export default function StepMood({ t, variants, custom, selectedMood, onSelect, moodLabel }: StepMoodProps) {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={variants}
      custom={custom}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_25px_rgba(124,58,237,0.2)] backdrop-blur-xl sm:p-8"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(99,102,241,0.12),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(236,72,153,0.12),transparent_40%)]" aria-hidden />
      <div className="relative space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">{t('explore_step_one_title')}</p>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-semibold leading-tight text-white">{t('explore_step_one_heading')}</h2>
            <p className="mt-1 text-base text-white/70">{t('explore_step_one_description')}</p>
          </div>
          <span className="hidden rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 sm:inline-flex">Step 1</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {MOOD_OPTIONS.map((mood) => {
            const active = selectedMood === mood.key;
            return (
              <motion.button
                key={mood.key}
                type="button"
                whileHover={{ scale: active ? 1.01 : 1.04, rotate: active ? 0 : 1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(mood.key)}
                className={clsx(
                  'min-h-[44px] rounded-full px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                  active
                    ? 'border border-white/60 bg-gradient-to-r from-indigo-500/50 via-violet-500/40 to-fuchsia-500/40 text-white shadow-[0_15px_50px_rgba(124,58,237,0.55)] backdrop-blur'
                    : 'border border-white/10 bg-white/5 text-white/80 hover:-translate-y-0.5 hover:border-white/30 hover:text-white',
                )}
                aria-pressed={active}
              >
                {t(mood.labelKey)}
              </motion.button>
            );
          })}
        </div>
        {moodLabel && (
          <p className="text-sm text-white/70">{t('explore_mood_selected_label', { mood: moodLabel })}</p>
        )}
        <p className="flex items-center gap-2 text-xs text-white/60">
          <span aria-hidden>💡</span>
          <span>{t('explore_sync_hint')}</span>
        </p>
      </div>
    </motion.section>
  );
}
