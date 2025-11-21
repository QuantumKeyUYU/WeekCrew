'use client';

import clsx from 'clsx';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { primaryCtaClass } from '@/styles/tokens';

type StepStartProps = {
  t: (key: string, options?: Record<string, unknown>) => string;
  variants: Variants;
  custom: number;
  canStart: boolean;
  joining: boolean;
  accepted: boolean | undefined;
  showAssembling: boolean;
  error: string | null;
  errorHint: string | null;
  onStart: () => void;
};

export default function StepStart({
  t,
  variants,
  custom,
  canStart,
  joining,
  accepted,
  showAssembling,
  error,
  errorHint,
  onStart,
}: StepStartProps) {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={variants}
      custom={custom}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-fuchsia-500/30 via-violet-600/30 to-indigo-700/40 p-6 shadow-[0_0_30px_rgba(124,58,237,0.25)] backdrop-blur-2xl sm:p-8"
    >
      <div className="absolute inset-0 opacity-50 mix-blend-screen">
        <div className="absolute -left-12 -top-10 h-32 w-32 rounded-full bg-white/25 blur-3xl" aria-hidden />
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-indigo-400/25 blur-3xl" aria-hidden />
        <div className="absolute -bottom-10 left-10 h-32 w-32 rounded-full bg-fuchsia-400/20 blur-3xl" aria-hidden />
      </div>
      <div className="relative space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">{t('explore_ready_title')}</p>
            <h3 className="mt-2 text-2xl font-semibold leading-tight text-white">{t('explore_ready_description')}</h3>
          </div>
          <span className="hidden rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 sm:inline-flex">Start</span>
        </div>

        <AnimatePresence>
          {showAssembling && (
            <motion.div
              key="assembling"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(124,58,237,0.35)]"
            >
              <span aria-hidden>✨</span>
              <span>✨ Круг собирается... ✨</span>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="rounded-2xl border border-red-200/30 bg-white/10 px-4 py-3 text-xs text-red-50 shadow-inner shadow-red-500/20">
            <p className="font-semibold">{error}</p>
            {errorHint && <p className="mt-1 text-red-100/80">{errorHint}</p>}
          </div>
        )}

        <button
          type="button"
          disabled={!canStart || joining}
          onClick={onStart}
          className={clsx(
            primaryCtaClass,
            'group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-indigo-600 py-4 text-base font-semibold shadow-[0_24px_70px_rgba(109,40,217,0.6)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-60',
            joining && 'cursor-wait',
          )}
        >
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-lg text-white shadow-inner shadow-white/30">
            {joining ? '⏳' : '🚀'}
          </span>
          <span className="grow text-left">
            {joining ? t('explore_starting_state') : t('explore_start_button')}
            <span className="block text-xs font-normal text-white/85">{t('explore_ready_description')}</span>
          </span>
          <span aria-hidden className="text-lg transition-transform group-hover:translate-x-1 group-hover:animate-pulse">→</span>
          <span className="absolute inset-0 rounded-2xl border border-white/20 opacity-0 transition group-hover:opacity-100" aria-hidden />
        </button>

        {!accepted && <p className="text-xs text-amber-100">{t('explore_rules_required')}</p>}
        <p className="flex items-center gap-2 text-xs text-white/70">
          <span aria-hidden>💡</span>
          <span>Будь готов к тёплому разговору: мы подбираем людей с похожим настроем.</span>
        </p>
      </div>
    </motion.section>
  );
}
