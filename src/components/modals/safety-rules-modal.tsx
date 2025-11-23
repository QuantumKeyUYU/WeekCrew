'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

import { useTranslation } from '@/i18n/useTranslation';

interface SafetyRulesModalProps {
  open: boolean;
  onAccept: () => void;
  onClose: () => void;
}

export const SafetyRulesModal = ({
  open,
  onAccept,
  onClose,
}: SafetyRulesModalProps) => {
  const t = useTranslation();
  const router = useRouter();

  const title = t('rules_modal_title') ?? 'Безопасное общение';
  const subtitle =
    t('rules_modal_subtitle') ??
    'Пара коротких правил перед началом — чтобы всем было комфортно.';
  const pointsRaw = t('rules_modal_points') ?? '';
  const points =
    pointsRaw.trim().length > 0
      ? pointsRaw.split('|').map((item) => item.trim()).filter(Boolean)
      : [
          'Общаемся без оскорблений и травли.',
          'Не делимся точными контактами и адресами.',
          'Если становится неприятно — можно прекратить разговор.',
          'При угрозе жизни — обращаемся в службы помощи.',
        ];

  const primaryCta =
    t('rules_modal_primary_cta') ?? 'Понимаю, продолжить';
  const secondaryCta =
    t('rules_modal_secondary_cta') ?? 'Показать все правила';
  const footerText =
    t('rules_modal_footer') ?? 'Общаемся честно и спокойно.';

  // Лочим скролл страницы, пока открыта модалка
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const handleBackdropClick = () => {
    onClose();
  };

  const handleCardClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  };

  const handleShowAllRules = () => {
    onClose();
    router.push('/safety');
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="safety-rules-title"
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 backdrop-blur-md"
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            onClick={handleCardClick}
            className="relative mx-3 w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/95 shadow-2xl shadow-slate-950/80"
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {/* Градиентный фон-шайба */}
            <div className="pointer-events-none absolute inset-0 opacity-70">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(96,165,250,0.25),transparent_48%),radial-gradient(circle_at_100%_0%,rgba(52,211,153,0.2),transparent_52%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(15,23,42,0.96))]" />
            </div>

            {/* Крестик */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              className="absolute right-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/40 text-slate-300 shadow-sm transition hover:bg-slate-900"
            >
              ×
            </button>

            <div className="relative z-10 px-6 pb-6 pt-6 sm:px-7 sm:pb-7 sm:pt-7">
              {/* Бейдж WeekCrew */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.4)]" />
                <span>WeekCrew · safety</span>
              </div>

              <h2
                id="safety-rules-title"
                className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl"
              >
                {title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-200/80">
                {subtitle}
              </p>

              <ul className="mt-4 space-y-3 text-sm text-slate-100/90">
                {points.map((point, index) => (
                  <li key={`${point}-${index}`} className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-950/60 text-[11px] font-semibold text-slate-100 shadow-sm">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={onAccept}
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(79,70,229,0.7)] transition-transform duration-150 hover:-translate-y-[1px]"
                >
                  {primaryCta}
                </button>

                <button
                  type="button"
                  onClick={handleShowAllRules}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-slate-950/40 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-200 transition hover:bg-slate-900/80"
                >
                  {secondaryCta}
                </button>
              </div>

              <p className="mt-4 text-center text-xs text-slate-300/80">
                {footerText}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SafetyRulesModal;
