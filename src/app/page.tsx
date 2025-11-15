import { LandingHero } from '@/components/shared/hero';
import { FEATURES } from '@/data/features';

const steps = [
  {
    title: '1. Выбери интерес',
    description: 'K-pop, аниме, психология или что-то новое. В любой момент можно сменить настроение.'
  },
  {
    title: '2. Присоединись к кружку',
    description: 'Мы подбираем 3–8 людей. Никто не остаётся без внимания, а тишину разогревают айсбрейкеры.'
  },
  {
    title: '3. Семь дней тепла',
    description: 'Обменивайтесь мыслями, мемами, плейлистами. По завершении — архив и кнопка «хочу ещё».'
  }
];

export default function HomePage() {
  return (
    <div className="space-y-16">
      <LandingHero />

      <section id="how-it-works" className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h2 className="text-xl font-semibold text-slate-100">Как работает WeekCrew</h2>
        <div className="grid gap-4">
          {steps.map((step) => (
            <div key={step.title} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <h3 className="text-lg font-medium text-brand-foreground">{step.title}</h3>
              <p className="text-sm text-slate-300">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <h2 className="text-xl font-semibold text-slate-100">Почему это уютно</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-white/10 bg-slate-950/30 p-5 shadow-lg shadow-brand/5"
            >
              <h3 className="text-lg font-medium text-brand-foreground">{feature.title}</h3>
              <p className="text-sm text-slate-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-brand/30 bg-brand/10 p-6 text-center">
        <h2 className="text-2xl font-semibold text-brand-foreground">Готов в новую неделю?</h2>
        <p className="mt-2 text-sm text-slate-300">
          Нажми кнопку ниже — и мы подберём тебе новую команду в течение пары минут.
        </p>
        <div className="mt-4">
          <a
            href="/explore"
            className="inline-flex items-center justify-center rounded-full bg-brand px-8 py-3 text-base font-medium text-slate-950 shadow-soft transition-transform hover:-translate-y-0.5"
          >
            Начать подбор
          </a>
        </div>
      </section>
    </div>
  );
}
