'use client';

import { useEffect, useMemo, useCallback, MouseEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from '@/i18n/useTranslation';

type SafetyRulesModalProps = {
  open: boolean;
  onAccept: () => void;
  onClose: () => void;
};

export const SafetyRulesModal = ({
  open,
  onAccept,
  onClose
}: SafetyRulesModalProps) => {
  const t = useTranslation();

  // Текст правил берём одной строкой и режем по |
  const rules = useMemo(
    () =>
      t('rules_modal_points')
        .split('|')
        .map((rule) => rule.trim())
        .filter(Boolean),
    [t]
  );

  const title = t('rules_modal_title') || 'Безопасное общение';
  const subtitle =
    t('rules_modal_subtitle') ||
    'Пара простых правил, чтобы всем было комфортно.';

  const acceptLabel =
    t('rules_modal_accept_cta') || 'Понимаю, продолжить';

  const footerText =
    t('rules_modal_footer') ||
    'Общаемся честно и спокойно.';

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Закрытие по Esc
  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const handleAccept = useCallback(() => {
    onAccept();
  }, [onAccept]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6 sm:py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={handleBackdropClick}
        >
          {/* Подложка */}
          <div className="pointer-events-none absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />

          {/* Карточка */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="safety-modal-title"
            className="pointer-events-auto relative w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--border-card)] bg-[var(--surface-elevated)]/95 p-5 text-[var(--text-primary)] shadow-[0_24px_80px_rgba(15,23,42,0.75)] sm:p-7"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Лёгкий фон-градиент внутри карточки */}
            <div className="pointer-events-none absolute inset-0 opacity-70">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(56,189,248,0.16),transparent_60%),radial-gradient(circle_at_85%_0%,rgba(129,140,248,0.24),transparent_55%)]" />
            </div>

            <div className="relative space-y-5">
              {/* Верхняя строка: бейдж + крестик */}
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 dark:text-slate-100">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.35)]" />
                  <span>WeekCrew · Safety</span>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t('rules_modal_close') || 'Закрыть'}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-slate-900/60 text-slate-200 transition hover:border-white/30 hover:bg-slate-900/90"
                >
                  ×
                </button>
              </div>

              {/* Заголовок и подзаголовок */}
              <div className="space-y-1.5">
                <h2
                  id="safety-modal-title"
                  className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl"
                >
                  {title}
                </h2>
                <p className="text-sm text-slate-300">
                  {subtitle}
                </p>
              </div>

              {/* Список правил */}
              <ol className="space-y-2.5 text-sm text-slate-100">
                {rules.map((rule, index) => (
                  <li
                    key={`${index}-${rule}`}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-[2px] inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/80 text-xs font-semibold text-slate-100 shadow-[0_10px_30px_rgba(15,23,42,0.7)]">
                      {index + 1}
                    </span>
                    <p className="leading-relaxed text-slate-100/90">
                      {rule}
                    </p>
                  </li>
                ))}
              </ol>

              {/* Нижний блок: “прогресс-бар” + кнопка + подпись */}
              <div className="space-y-4 pt-1">
                {/* Декоративный бар в стиле макета */}
                <div className="flex items-center gap-3">
                  <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-900/50">
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,#22d3ee,#6366f1,#a855f7)]" />
                  </div>
                  <div className="flex h-6 w-9 items-center justify-center rounded-full border border-slate-500/70 bg-slate-950/70 text-[10px] font-semibold text-slate-200">
                    ✓
                  </div>
                </div>

                {/* Основная CTA-кнопка */}
                <button
                  type="button"
                  onClick={handleAccept}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(79,70,229,0.65)] transition hover:-translate-y-[1px] hover:shadow-[0_22px_60px_rgba(79,70,229,0.8)] active:translate-y-0 active:shadow-[0_14px_35px_rgba(15,23,42,0.7)]"
                >
                  {acceptLabel}
                </button>

                {/* Подпись снизу */}
                <p className="text-center text-[11px] text-slate-300/90">
                  {footerText}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
