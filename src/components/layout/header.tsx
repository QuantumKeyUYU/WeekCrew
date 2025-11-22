'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';

import { useTranslation } from '@/i18n/useTranslation';
import { LanguageSwitch } from '@/components/layout/language-switch';
import { useAppStore } from '@/store/useAppStore';
import { AVATAR_PRESETS, DEFAULT_AVATAR_KEY } from '@/constants/avatars';
import { ProfileModalManager } from '@/components/modals/profile-modal-manager';

const getAvatarEmoji = (key?: string | null) =>
  AVATAR_PRESETS.find((preset) => preset.key === key)?.emoji ?? '🙂';

export const Header = () => {
  const t = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const user = useAppStore((state) => state.user);
  const openProfileModal = useAppStore((state) => state.openProfileModal);

  const avatarEmoji = getAvatarEmoji(user?.avatarKey ?? DEFAULT_AVATAR_KEY);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    // px-3 — те же отступы, что у app-shell (0.75rem), чтобы всё легло ровно
    <header className="sticky top-3 z-50 px-3 sm:top-4 sm:px-6">
      <div
        className={clsx(
          // Основная «таблетка» шапки
          'mx-auto flex w-full max-w-5xl items-center justify-between gap-3 rounded-full border px-3 py-2.5 sm:px-4',
          'backdrop-blur-2xl transition-all duration-300 ease-out',
          'shadow-[0_14px_45px_rgba(15,23,42,0.12)] dark:shadow-[0_18px_55px_rgba(0,0,0,0.55)]',
          isScrolled
            ? 'border-white/30 bg-white/80 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white'
            : 'border-white/40 bg-white/60 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white',
        )}
      >
        {/* Логотип / бренд */}
        <Link
          href="/"
          aria-label="WeekCrew — на главную"
          className="group inline-flex items-center gap-2 rounded-full px-2.5 py-1.5 text-base font-semibold tracking-[0.08em] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:focus-visible:ring-slate-500"
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/80 to-emerald-400/80 text-white shadow-[0_12px_30px_rgba(37,99,235,0.65)]">
            <span className="h-2 w-2 rounded-full bg-white/90 shadow-[0_0_0_4px_rgba(255,255,255,0.18)]" />
          </span>
          <span className="text-slate-900 transition-colors group-hover:text-slate-700 dark:text-white dark:group-hover:text-white/80">
            WeekCrew
          </span>
        </Link>

        {/* Правый блок: профиль + язык + настройки */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => openProfileModal()}
            className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.12)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_16px_40px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-white/10 dark:text-white"
            aria-label="Открыть профиль"
          >
            <span className="text-lg" aria-hidden>
              {avatarEmoji}
            </span>
            <span className="hidden sm:inline">{t('nav_profile') ?? 'Профиль'}</span>
          </button>

          <LanguageSwitch />

          <Link
            href="/settings"
            className="inline-flex items-center rounded-full border border-white/50 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.12)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_16px_40px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-white/10 dark:text-white"
          >
            {t('nav_settings')}
          </Link>
        </div>
      </div>

      <ProfileModalManager />
    </header>
  );
};
