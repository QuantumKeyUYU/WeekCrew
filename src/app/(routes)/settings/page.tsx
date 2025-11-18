'use client';

import { useEffect, useState } from 'react';
import { useWeekcrewStorage } from '@/lib/weekcrewStorage';
import { getOrCreateDeviceId, DEVICE_ID_KEY } from '@/lib/device';
import { primaryCtaClass } from '@/styles/tokens';
import { useTranslation } from '@/i18n/useTranslation';

const SAFETY_KEY = 'weekcrew:safety-accepted-v2';
const PUBLIC_MODE = process.env.NEXT_PUBLIC_WEEKCREW_MODE ?? 'demo';
const isDemoMode = PUBLIC_MODE !== 'live';

export default function SettingsPage() {
  const storage = useWeekcrewStorage();
  const t = useTranslation();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const id = getOrCreateDeviceId();
    setDeviceId(id);
  }, []);

  const handleClearLocalData = async () => {
    setClearing(true);
    setMessage(null);

    try {
      await storage.clearAllLocalData();
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.removeItem(SAFETY_KEY);
        } catch {
          // игнорируем
        }
      }
      setMessage(t('settings_reset_success'));
    } catch (error) {
      console.error('Failed to clear local data', error);
      setMessage(t('settings_reset_error'));
    } finally {
      setClearing(false);
    }
  };

  const handleResetSafetyOnly = () => {
    setMessage(null);
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(SAFETY_KEY);
      setMessage(t('settings_reset_rules_success'));
    } catch (error) {
      console.error('Failed to reset safety flag', error);
      setMessage(t('settings_reset_rules_error'));
    }
  };

  const modeLabel = isDemoMode ? t('settings_mode_label_demo') : t('settings_mode_label_live');
  const modeDescription = isDemoMode
    ? t('settings_mode_description_demo')
    : t('settings_mode_description_live');
  const resetButtonLabel = clearing ? t('settings_reset_pending') : t('settings_reset_button');

  return (
    <main className="px-4 py-8 sm:py-12">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 sm:gap-8">
        <section className="rounded-[2.75rem] border border-white/10 bg-slate-950/70 p-6 text-slate-50 shadow-[0_28px_90px_rgba(3,5,20,0.9)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand/70">WeekCrew</p>
          <h1 className="mt-2 text-xl font-semibold sm:text-2xl">{t('settings_title')}</h1>
          <p className="mt-2 text-sm text-slate-200/90">{t('settings_description')}</p>
        </section>

        <section className="rounded-[2.5rem] border border-white/10 bg-slate-900/60 p-6 text-sm text-slate-50 shadow-[0_20px_60px_rgba(5,7,22,0.75)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">{t('settings_mode_title')}</h2>
              <p className="mt-1 text-xs text-slate-300/90">{modeDescription}</p>
            </div>
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white/80">
              {modeLabel}
            </span>
          </div>
        </section>

        <section className="rounded-[2.5rem] border border-white/10 bg-slate-900/60 p-6 text-sm text-slate-50 shadow-[0_20px_60px_rgba(5,7,22,0.75)]">
          <h2 className="text-base font-semibold">{t('settings_device_title')}</h2>
          <p className="mt-1 text-xs text-slate-300/90">{t('settings_device_description')}</p>
          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-xs">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">{t('settings_device_current_label')}</p>
            <p className="mt-1 break-all font-mono text-[11px] text-white/90">{deviceId ?? t('settings_device_loading')}</p>
            <p className="mt-2 text-[11px] text-slate-500">
              {t('settings_device_storage_key_label')}: <span className="font-mono">{DEVICE_ID_KEY}</span>
            </p>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-400">{t('settings_device_hint')}</p>
        </section>

        <section className="rounded-[2.5rem] border border-white/10 bg-slate-900/60 p-6 text-sm text-slate-50 shadow-[0_20px_60px_rgba(5,7,22,0.75)]">
          <h2 className="text-base font-semibold">{t('settings_reset_title')}</h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-300/90">{t('settings_reset_description')}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleClearLocalData}
              disabled={clearing}
              className={`${primaryCtaClass} px-7 py-2.5 text-sm disabled:translate-y-0 disabled:opacity-60`}
            >
              {resetButtonLabel}
            </button>
            <button
              type="button"
              onClick={handleResetSafetyOnly}
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-5 py-2 text-xs font-medium text-slate-100 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-white/60"
            >
              {t('settings_reset_rules_button')}
            </button>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-400">{t('settings_reset_secondary_hint')}</p>
          {message && <p className="mt-3 text-[11px] leading-relaxed text-slate-200">{message}</p>}
        </section>
      </div>
    </main>
  );
}
