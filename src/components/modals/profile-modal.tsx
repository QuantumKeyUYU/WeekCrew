'use client';

import { FormEvent, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { AVATAR_PRESETS, DEFAULT_AVATAR_KEY } from '@/constants/avatars';
import { saveProfile } from '@/lib/api/profile';
import type { UserProfile } from '@/types';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (user: UserProfile) => void;
  initialProfile?: UserProfile | null;
}

export const ProfileModal = ({ open, onClose, onSaved, initialProfile }: ProfileModalProps) => {
  const [mounted, setMounted] = useState(false);
  const [nickname, setNickname] = useState('');
  const [avatarKey, setAvatarKey] = useState(DEFAULT_AVATAR_KEY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setNickname('');
      setAvatarKey(DEFAULT_AVATAR_KEY);
      setError(null);
      return;
    }
    setNickname(initialProfile?.nickname ?? '');
    setAvatarKey(initialProfile?.avatarKey ?? DEFAULT_AVATAR_KEY);
    setError(null);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [initialProfile?.avatarKey, initialProfile?.nickname, open]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!nickname.trim()) {
      setError('Введите никнейм');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await saveProfile({ nickname: nickname.trim(), avatarKey });
      if (response.user) {
        onSaved(response.user);
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError('Не удалось сохранить профиль. Попробуйте ещё раз.');
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || !open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 text-slate-900 backdrop-blur">
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/95 p-6 shadow-2xl dark:bg-slate-950/95">
        <button
          type="button"
          className="absolute right-4 top-4 text-slate-500 transition hover:text-slate-900"
          aria-label="Закрыть"
          onClick={onClose}
        >
          ×
        </button>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">WeekCrew</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Ваш профиль</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
              Ник и аватар нужны, чтобы другие участники могли узнать вас в чате.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Никнейм</label>
            <input
              type="text"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-white/10 dark:bg-slate-900/80 dark:text-white"
              placeholder="Например, Луна"
              minLength={2}
              maxLength={40}
              required
            />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Аватар</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {AVATAR_PRESETS.map((preset) => {
                const active = preset.key === avatarKey;
                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => setAvatarKey(preset.key)}
                    className={clsx(
                      'flex flex-col items-center gap-1 rounded-2xl border px-3 py-3 text-sm transition',
                      active
                        ? 'border-brand bg-brand/10 text-brand-foreground shadow-[0_0_25px_rgba(127,90,240,0.25)]'
                        : 'border-slate-200/80 bg-white/90 text-slate-700 hover:-translate-y-0.5 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100',
                    )}
                    aria-pressed={active}
                  >
                    <span className="text-2xl" aria-hidden>
                      {preset.emoji}
                    </span>
                    <span className="text-xs font-semibold">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-200">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(127,90,240,0.35)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving}
          >
            {saving ? 'Сохраняем...' : 'Сохранить и продолжить'}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
};
