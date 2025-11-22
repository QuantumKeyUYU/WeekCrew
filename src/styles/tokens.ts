const motionTiming = 'transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]';

export const colors = {
  appBackgroundBase: '#0b1120',
  appBackgroundAccent1: '#111827',
  appBackgroundAccent2: '#1f2937',
  accentIndigo: '#c7d2fe',
  accentEmerald: '#34d399',
  accentCyan: '#67e8f9',
};

export const primaryCtaClass = [
  'relative inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white sm:text-base',
  'bg-gradient-to-r from-indigo-500 to-emerald-500',
  'shadow-[0_4px_14px_rgba(16,185,129,0.25)] ring-1 ring-emerald-300/30 dark:ring-white/10',
  'before:absolute before:inset-0 before:rounded-full before:bg-white/10 before:opacity-0 before:transition-opacity',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
  motionTiming,
  'hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(16,185,129,0.32)] hover:before:opacity-100 active:translate-y-0 active:shadow-[0_4px_12px_rgba(16,185,129,0.24)] disabled:opacity-60 disabled:hover:translate-y-0',
].join(' ');

export const secondaryCtaClass = [
  'inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-none transition-colors sm:text-base',
  'duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
  'hover:bg-slate-50 hover:text-slate-900 dark:border-white/15 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10',
].join(' ');

export const cardMotionClass = [
  'rounded-3xl border border-[var(--border-card)] bg-[var(--surface-elevated)] p-5 text-left sm:p-6',
  'shadow-[var(--shadow-card)]',
  motionTiming,
  'hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-strong)]',
].join(' ');

export const motionTimingClass = motionTiming;
