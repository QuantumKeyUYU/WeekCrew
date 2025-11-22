// src/styles/tokens.ts
// Набор готовых className для кнопок и плашек, чтобы не засорять JSX.

export const primaryCtaClass =
  'inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-slate-900/25 transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900/0 disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-black/60';

export const secondaryCtaClass =
  'inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/85 px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:text-sky-700 dark:border-white/15 dark:bg-slate-900/70 dark:text-slate-50 dark:hover:border-sky-400';

export const quietPillClass =
  'inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-200';

export const dangerCtaClass =
  'inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-300 bg-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-rose-500/40 transition hover:-translate-y-0.5 hover:bg-rose-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500 dark:bg-rose-600';

export const chipMutedClass =
  'inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-slate-50/80 px-3 py-1 text-[11px] font-medium text-slate-500 dark:border-white/15 dark:bg-slate-900/70 dark:text-slate-300';
