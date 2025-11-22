'use client';

import Link from 'next/link';
import { useTranslation } from '@/i18n/useTranslation';
import { LanguageSwitch } from '@/components/layout/language-switch';
import { useAppStore } from '@/store/useAppStore';
import { AVATAR_PRESETS, DEFAULT_AVATAR_KEY } from '@/constants/avatars';
import { ProfileModalManager } from '@/components/modals/profile-modal-manager';

const getAvatarEmoji = (key?: string | null) =>
  AVATAR_PRESETS.find((preset) => preset.key === key)?.emoji ?? '🙂';

export const Header = () => {
  const t = useTranslation();
  const user = useAppStore((state) => state.user);
  const openProfileModal = useAppStore((state) => state.openProfileModal);
  const avatarEmoji = getAvatarEmoji(user?.avatarKey ?? DEFAULT_AVATAR_KEY);

  return (
    <header className="px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">

        {/* ЛОГО */}
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-full px-2 py-1 text-base font-semibold"
        >
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/80 to-emerald-400/80 text-white shadow-lg">
            <span className="h-2 w-2 rounded-full bg-white/90" />
          </span>

          <span className="text-sm font-semibold text-white sm:text-slate-900 dark:sm:text-white">
            WeekCrew
          </span>
        </Link>

        {/* ПРАВЫЕ КНОПКИ */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* АВАТАР */}
          <button
            type="button"
            onClick={() => openProfileModal()}
            aria-label={t('nav_profile') ?? 'Профиль'}
            className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 p-1.5 text-lg text-white shadow-md hover:bg-white/20 sm:p-2 sm:text-base dark:bg-white/10 dark:border-white/10"
          >
            {avatarEmoji}
          </button>

          {/* ЯЗЫК RU / EN */}
          <LanguageSwitch />

          {/* НАСТРОЙКИ */}
          <Link
            href="/settings"
            aria-label={t('nav_settings') ?? 'Настройки'}
            className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 p-1.5 text-lg text-white shadow-md hover:bg-white/20 sm:p-2 sm:text-base dark:bg-white/10 dark:border-white/10"
          >
            ⚙️
          </Link>
        </div>
      </div>

      <ProfileModalManager />
    </header>
  );
};
