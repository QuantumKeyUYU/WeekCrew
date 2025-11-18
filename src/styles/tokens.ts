const motionTiming = 'transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]';

export const primaryCtaClass = [
  'inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-white sm:text-base',
  'bg-[linear-gradient(120deg,#7f5af0,#9d7bff)]',
  'shadow-[0_0_30px_rgba(142,97,255,0.45)] ring-1 ring-white/30 dark:ring-white/10',
  motionTiming,
  'hover:-translate-y-0.5 hover:shadow-[0_0_45px_rgba(142,97,255,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:translate-y-0',
].join(' ');

export const secondaryCtaClass = [
  'inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-2.5 text-sm font-medium sm:text-base',
  'text-white/90 hover:text-white',
  motionTiming,
  'hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
].join(' ');

export const cardMotionClass = [
  'rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-left',
  'shadow-[0_18px_40px_rgba(3,5,20,0.35)]',
  motionTiming,
  'hover:-translate-y-0.5 hover:shadow-[0_26px_60px_rgba(3,5,20,0.55)]',
].join(' ');

export const motionTimingClass = motionTiming;
