export const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80">
      <div className="mx-auto flex max-w-3xl flex-col gap-2 px-4 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} WeekCrew. Кружки недели для уютного общения.
        </p>
        <div className="flex items-center gap-3">
          <a
            href="mailto:hey@weekcrew.app"
            className="transition-colors hover:text-brand-foreground"
          >
            Поддержка
          </a>
          <a href="https://blogs.cornell.edu" className="transition-colors hover:text-brand-foreground">
            Вдохновение
          </a>
        </div>
      </div>
    </footer>
  );
};
