import Link from 'next/link';
import { EXPERIMENT_LINKS } from '@/data/navigation';

export const Footer = () => {
  return (
    <footer className="mt-12 border-t border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(247,247,255,0.98))] text-neutral-600 shadow-[0_-10px_28px_rgba(15,23,42,0.05)] transition-colors duration-300 dark:border-white/10 dark:bg-slate-950/80 dark:text-neutral-400">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-1">
          <p>© {new Date().getFullYear()} UYAN.chat</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Интернет без шума создаём вместе.</p>
        </div>
        <div className="flex flex-col gap-2 text-xs sm:text-sm">
          <a href="mailto:hey@uyan.chat" className="text-neutral-600 transition-colors hover:text-brand-foreground dark:text-neutral-300">
            hey@uyan.chat
          </a>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Эксперименты</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {EXPERIMENT_LINKS.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-full border border-slate-200/80 px-3 py-1 text-xs text-slate-600 transition-colors hover:border-brand hover:text-brand-foreground dark:border-white/20 dark:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
