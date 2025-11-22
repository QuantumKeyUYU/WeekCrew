const motionTiming = 'transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]';

export const colors = {
  appBackgroundBase: '#020617',
  appBackgroundAccent1: '#1d2b64',
  appBackgroundAccent2: '#0f766e',
};

export const primaryCtaClass = [
  'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white sm:text-base',
  'bg-[linear-gradient(115deg,#6178ff,#5cb0ff_55%,#3ddc97)]',
  'ring-1 ring-white/25 dark:ring-white/10 shadow-[0_14px_34px_rgba(64,89,255,0.32)]',
  motionTiming,
  'hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(64,89,255,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:translate-y-0 disabled:opacity-60',
].join(' ');

export const secondaryCtaClass = [
  'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] underline-offset-4',
  motionTiming,
  'hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
].join(' ');

export const cardMotionClass = [
  'rounded-2xl border border-[var(--border-card)] bg-[var(--surface-subtle)] p-5 text-left',
  'shadow-[var(--shadow-soft)]',
  motionTiming,
  'hover:-translate-y-0.5 hover:shadow-[0_16px_44px_rgba(15,23,42,0.16)] dark:hover:shadow-[0_16px_44px_rgba(0,0,0,0.5)]',
].join(' ');

export const motionTimingClass = motionTiming;
