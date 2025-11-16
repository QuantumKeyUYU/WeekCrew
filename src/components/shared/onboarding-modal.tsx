'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from '@/i18n/useTranslation';
import type { CopyKey } from '@/i18n/copy';

interface StepDefinition {
  titleKey: CopyKey;
  descriptionKey: CopyKey;
}

const STEPS: StepDefinition[] = [
  { titleKey: 'home_onboarding_step_choose_title', descriptionKey: 'home_onboarding_step_choose_description' },
  { titleKey: 'home_onboarding_step_team_title', descriptionKey: 'home_onboarding_step_team_description' },
  { titleKey: 'home_onboarding_step_week_title', descriptionKey: 'home_onboarding_step_week_description' },
  { titleKey: 'home_onboarding_step_refresh_title', descriptionKey: 'home_onboarding_step_refresh_description' }
];

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingModal = ({ isOpen, onClose }: OnboardingModalProps) => {
  const t = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  const portalTarget = useMemo(() => {
    if (!mounted) {
      return null;
    }
    return document.body;
  }, [mounted]);

  if (!portalTarget) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('home_onboarding_title')}
            className="relative mx-4 max-h-[90vh] w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-b from-white/95 to-white/90 p-6 text-slate-800 shadow-[0_20px_60px_rgba(15,23,42,0.25)] dark:border-white/10 dark:from-slate-950/90 dark:to-slate-900/90 dark:text-slate-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/70 text-slate-500 transition hover:-translate-y-0.5 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 dark:border-white/20 dark:text-slate-300"
              aria-label={t('home_onboarding_close')}
            >
              ×
            </button>
            <div className="pr-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-foreground">{t('home_onboarding_title')}</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{t('hero_title')}</h2>
            </div>
            <ol className="mt-6 space-y-3">
              {STEPS.map((step, index) => (
                <li
                  key={step.titleKey}
                  className="flex gap-3 rounded-2xl border border-slate-200/70 bg-white/80 p-3 shadow-[0_10px_28px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/60"
                >
                  <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand/15 text-sm font-semibold text-brand-foreground">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">{t(step.titleKey)}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{t(step.descriptionKey)}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex items-center justify-center gap-2">
              {STEPS.map((_, index) => (
                <span
                  key={index}
                  className="h-2.5 w-2.5 rounded-full bg-brand/30"
                />
              ))}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-[0_10px_26px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:border-brand/40 hover:text-brand-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 dark:border-white/20 dark:bg-slate-900/60 dark:text-white"
            >
              {t('home_onboarding_close')}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    portalTarget
  );
};

export const useOnboardingModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const openOnboarding = useCallback(() => setIsOpen(true), []);
  const closeOnboarding = useCallback(() => setIsOpen(false), []);

  const Modal = useCallback(() => <OnboardingModal isOpen={isOpen} onClose={closeOnboarding} />, [isOpen, closeOnboarding]);

  return { OnboardingModal: Modal, openOnboarding, closeOnboarding };
};
