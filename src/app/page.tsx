import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="px-4 py-10 sm:py-14">
      <section className="mx-auto flex max-w-4xl flex-col gap-6 rounded-3xl border border-slate-200/80 bg-slate-900/40 p-6 text-slate-100 shadow-[0_24px_80px_rgba(15,23,42,0.75)] dark:border-white/10 sm:p-10">
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold sm:text-3xl">
            WeekCrew — новый кружок каждую неделю.
          </h1>
          <p className="max-w-2xl text-sm text-slate-200/90 sm:text-base">
            Выбирай интерес — и попадай в уютную мини-команду без лент, лайков и лишнего
            шума. Семь дней тёплого общения, потом новая команда. Общение идёт в чатах
            WeekCrew, без перехода в личные мессенджеры.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/safety"
            className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(129,140,248,0.45)] transition hover:-translate-y-0.5"
          >
            Начать подбор
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center rounded-full border border-slate-500/80 bg-transparent px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-white"
          >
            Как всё работает
          </a>
        </div>
      </section>

      {/* Как всё работает */}
      <section
        id="how-it-works"
        className="mx-auto mt-10 flex max-w-4xl flex-col gap-6 rounded-3xl border border-slate-200/60 bg-slate-900/30 p-6 text-sm text-slate-100 shadow-[0_20px_60px_rgba(15,23,42,0.6)] dark:border-white/10 sm:mt-12 sm:p-8"
      >
        <h2 className="text-base font-semibold sm:text-lg">Как проходит неделя</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/60 bg-slate-900/40 p-4 text-xs sm:text-sm dark:border-white/10">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
              1 шаг
            </p>
            <p className="mt-2 font-medium">Выбери настроение</p>
            <p className="mt-1 text-slate-300/90">
              K-pop, книги, фильмы или что-то новое — интерес можно менять в любой момент.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/60 bg-slate-900/40 p-4 text-xs sm:text-sm dark:border-white/10">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
              2 шаг
            </p>
            <p className="mt-2 font-medium">Присоединяйся к кружку</p>
            <p className="mt-1 text-slate-300/90">
              Мы собираем 3–8 человек с похожим настроением — никто не остаётся без
              внимания.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/60 bg-slate-900/40 p-4 text-xs sm:text-sm dark:border-white/10">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
              3 шаг
            </p>
            <p className="mt-2 font-medium">Семь дней тепла</p>
            <p className="mt-1 text-slate-300/90">
              Мемы, истории, плейлисты. Неделя заканчивается — начинается новый круг.
            </p>
          </div>
        </div>

        <h2 className="mt-2 text-base font-semibold sm:text-lg">Почему здесь спокойно</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/60 bg-slate-900/40 p-4 text-xs sm:text-sm dark:border-white/10">
            <p className="font-medium">Недель хватает</p>
            <p className="mt-1 text-slate-300/90">
              Неделя — комфортный срок, чтобы познакомиться, но не устать от чата.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/60 bg-slate-900/40 p-4 text-xs sm:text-sm dark:border-white/10">
            <p className="font-medium">Маленькая группа</p>
            <p className="mt-1 text-slate-300/90">
              Мини-команда даёт время каждому, без больших анонимных чатов.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/60 bg-slate-900/40 p-4 text-xs sm:text-sm dark:border-white/10">
            <p className="font-medium">Мягкие подсказки</p>
            <p className="mt-1 text-slate-300/90">
              Если сложно начать разговор — помогут маленькие вопросы и темы.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/60 bg-slate-900/40 p-4 text-xs sm:text-sm dark:border-white/10">
            <p className="font-medium">Без гонок</p>
            <p className="mt-1 text-slate-300/90">
              Никаких лайков и лент. Только живые слова и безопасное общение.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200/60 bg-slate-900/50 p-4 text-center text-sm dark:border-white/10">
          <p className="font-medium">Готов к новой неделе?</p>
          <p className="mt-1 text-slate-300/90">
            Нажми кнопку — и мы подберём уютный круг за пару секунд.
          </p>
          <div className="mt-3">
            <Link
              href="/safety"
              className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(129,140,248,0.45)] transition hover:-translate-y-0.5"
            >
              Начать подбор
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
