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
  'relative inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white/90 sm:text-base',
  'bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.18),transparent_45%),radial-gradient(circle_at_70%_70%,rgba(16,185,129,0.18),transparent_50%),#0f172a]',
  'shadow-[0_20px_40px_rgba(0,0,0,0.45)] ring-1 ring-white/5 dark:ring-white/10',
  'before:absolute before:inset-0 before:rounded-full before:bg-[radial-gradient(circle_at_50%_20%,rgba(226,232,240,0.06),transparent_50%)] before:opacity-90 before:transition-opacity',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
  motionTiming,
  'hover:-translate-y-0.5 hover:shadow-[0_24px_48px_rgba(0,0,0,0.55)] hover:ring-indigo-200/40 hover:before:opacity-100 active:translate-y-0 active:shadow-[0_14px_30px_rgba(0,0,0,0.42)] disabled:opacity-60 disabled:hover:translate-y-0',
].join(' ');

export const secondaryCtaClass = [
  'inline-flex min-h-[44px] items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] sm:text-base',
  'transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
  'hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]/60 dark:hover:bg-white/5',
].join(' ');

export const cardMotionClass = [
  'rounded-3xl border border-[var(--border-card)] bg-[var(--surface-subtle)] p-5 text-left sm:p-6',
  'shadow-[0_20px_40px_rgba(0,0,0,0.45)]',
  motionTiming,
  'hover:-translate-y-0.5 hover:shadow-[0_24px_54px_rgba(0,0,0,0.5)]',
].join(' ');

export const motionTimingClass = motionTiming;
