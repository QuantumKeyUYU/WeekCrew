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
  'relative inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white sm:text-base',
  'bg-[length:200%_200%] bg-[linear-gradient(120deg,#4f46e5,#22c55e)] shadow-[0_10px_30px_rgba(79,70,229,0.35)] ring-1 ring-white/10',
  'before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.12),transparent_30%)] before:opacity-60',
  'after:absolute after:inset-[-1px] after:rounded-full after:border after:border-white/20 after:opacity-70',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
  motionTiming,
  'hover:-translate-y-[2px] hover:bg-[position:80%_50%] hover:shadow-[0_16px_40px_rgba(79,70,229,0.38)] active:translate-y-0 active:shadow-[0_10px_26px_rgba(79,70,229,0.32)] disabled:opacity-70 disabled:cursor-not-allowed',
].join(' ');

export const secondaryCtaClass = [
  'inline-flex min-h-[44px] items-center justify-center rounded-full border border-[var(--border-strong)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] shadow-[0_10px_28px_rgba(15,23,42,0.08)] transition-all sm:text-base dark:text-white',
  'bg-white/80 backdrop-blur dark:border-white/10 dark:bg-white/5',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
  'hover:-translate-y-[2px] hover:border-transparent hover:bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.14),transparent_40%),radial-gradient(circle_at_80%_60%,rgba(34,197,94,0.12),transparent_38%),rgba(255,255,255,0.9)] hover:text-slate-900 dark:hover:bg-white/10',
].join(' ');

export const cardMotionClass = [
  'rounded-3xl border border-[var(--border-card)] bg-[var(--surface-elevated)] p-5 text-left sm:p-6',
  'shadow-[var(--shadow-card)]',
  motionTiming,
  'hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-strong)]',
].join(' ');

export const motionTimingClass = motionTiming;
