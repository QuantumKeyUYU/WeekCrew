const motionTiming = 'transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]';

export const primaryCtaClass = [
  'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white sm:text-base',
  'bg-[linear-gradient(120deg,#6f7cf7,#5c9dee_55%,#4ade80)]',
  'ring-1 ring-white/40 dark:ring-white/15 shadow-[0_18px_45px_rgba(80,100,255,0.3)]',
  motionTiming,
  'hover:-translate-y-0.5 hover:shadow-[0_24px_54px_rgba(80,100,255,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:translate-y-0 disabled:opacity-60',
].join(' ');

export const secondaryCtaClass = [
  'inline-flex items-center justify-center rounded-full border border-white/35 px-6 py-3 text-sm font-medium sm:text-base',
  'text-white/90 hover:text-white bg-white/10 backdrop-blur',
  motionTiming,
  'hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
].join(' ');

export const cardMotionClass = [
  'rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-5 text-left',
  'shadow-[var(--shadow-soft)]',
  motionTiming,
  'hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(15,23,42,0.16)] dark:hover:shadow-[0_22px_60px_rgba(0,0,0,0.6)]',
].join(' ');

export const motionTimingClass = motionTiming;
