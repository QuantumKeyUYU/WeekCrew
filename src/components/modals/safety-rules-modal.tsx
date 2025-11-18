'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { useTranslation } from '@/i18n/useTranslation';

interface SafetyRulesModalProps {
  open: boolean;
  onAccept: () => void;
  onClose: () => void;
}

export const SafetyRulesModal = ({ open, onAccept, onClose }: SafetyRulesModalProps) => {
  const t = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setExpanded(false);
      return;
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  const points = useMemo(() => t('rules_modal_points').split('|'), [t]);

  if (!mounted || !open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 text-slate-900 backdrop-blur">
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/95 p-6 shadow-2xl dark:bg-slate-950/95">
        <button
          type="button"
          className="absolute right-4 top-4 text-slate-500 transition hover:text-slate-900"
          aria-label={t('rules_modal_close_label')}
          onClick={onClose}
        >
          ×
        </button>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">WeekCrew</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{t('rules_modal_title')}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{t('rules_modal_description')}</p>
          </div>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-200">
            {points.map((point) => (
              <li key={point} className="flex gap-2">
                <span aria-hidden>•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="text-sm font-medium text-brand-foreground transition hover:underline"
          >
            {expanded ? t('rules_modal_hide_full') : t('rules_modal_show_full')}
          </button>
          <div
            className={clsx(
              'overflow-hidden text-sm text-slate-500 transition-all dark:text-slate-200',
              expanded ? 'max-h-48' : 'max-h-0',
            )}
          >
            {expanded && <p className="leading-relaxed">{t('rules_modal_full')}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onAccept}
              className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(127,90,240,0.35)] transition hover:-translate-y-0.5"
            >
              {t('rules_modal_cta')}
            </button>
            <p className="text-center text-xs text-slate-400">{t('rules_modal_footer')}</p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
