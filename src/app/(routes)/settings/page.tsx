'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { getOrCreateDeviceId, DEVICE_ID_KEY, resetDeviceId } from '@/lib/device';
import { primaryCtaClass } from '@/styles/tokens';
import { useTranslation } from '@/i18n/useTranslation';
import { SafetyRulesModal } from '@/components/modals/safety-rules-modal';
import { useSafetyRules } from '@/hooks/useSafetyRules';
import { clearCircleSelection } from '@/lib/circleSelection';
import { useAppStore } from '@/store/useAppStore';
import { ThemePreference } from '@/constants/theme';
import { TestModeHint } from '@/components/shared/test-mode-hint';
import type { CopyKey } from '@/i18n/copy';
import { leaveCircle } from '@/lib/api/circles';

const PUBLIC_MODE = process.env.NEXT_PUBLIC_WEEKCREW_MODE ?? 'demo';
const isDemoMode = PUBLIC_MODE !== 'live';

export default function SettingsPage() {
  const t = useTranslation();
  const { markAccepted } = useSafetyRules();
  const themePreference = useAppStore((state) => state.settings.theme);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const resetStore = useAppStore((state) => state.reset);
  const setDevice = useAppStore((state) => state.setDevice);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    const id = getOrCreateDeviceId();
    setDeviceId(id);
  }, []);

  const handleClearLocalData = async () => {
    setClearing(true);
    setMessage(null);
    try {
      await leaveCircle().catch((error) => {
        console.warn('Failed to leave circle during reset', error);
      });
      resetStore();
      clearCircleSelection();
      resetDeviceId();
      const newId = getOrCreateDeviceId();
      setDevice({ deviceId: newId, createdAt: new Date().toISOString() });
      setDeviceId(newId);
      setMessage(t('settings_reset_success'));
    } catch (error) {
      console.error('Failed to clear local data', error);
      setMessage(t('settings_reset_error'));
    } finally {
      setClearing(false);
    }
  };

  const modeDescription = isDemoMode ? t('settings_mode_description_demo') : t('settings_mode_description_live');
  const resetButtonLabel = clearing ? t('settings_reset_pending') : t('settings_reset_button');
  const themeOptions: ThemePreference[] = ['system', 'light', 'dark'];
  const themeLabelKey: Record<ThemePreference, CopyKey> = {
    system: 'settings_theme_system',
    light: 'settings_theme_light',
    dark: 'settings_theme_dark'
  } as const;

  const handleThemeChange = (value: ThemePreference) => {
    updateSettings({ theme: value });
  };

  return (
    <main className="space-y-6 py-6">
      <section className="app-hero p-6 text-white shadow-[0_28px_120px_rgba(8,7,20,0.85)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand/70">WeekCrew</p>
        <h1 className="mt-2 text-2xl font-semibold">{t('settings_title')}</h1>
        <p className="mt-2 text-sm text-white/80">{t('settings_intro')}</p>
      </section>

      <section className="app-panel p-6 text-sm text-slate-700 dark:text-slate-200">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">{t('settings_mode_title')}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{modeDescription}</p>
        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">{t('settings_mode_future')}</p>
      </section>

      <section className="app-panel p-6 text-sm text-slate-700 dark:text-slate-200">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">{t('settings_theme_title')}</h2>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {themeOptions.map((option) => {
            const active = themePreference === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleThemeChange(option)}
                className={clsx(
                  'app-chip px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                  active
                    ? 'border-brand/70 bg-brand text-white shadow-[0_0_30px_rgba(142,97,255,0.45)]'
                    : 'text-slate-600 hover:-translate-y-0.5 hover:text-brand-foreground dark:text-slate-200',
                )}
                aria-pressed={active}
              >
                {t(themeLabelKey[option])}
              </button>
            );
          })}
        </div>
      </section>

      <section className="app-panel p-6 text-sm text-slate-700 dark:text-slate-200">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">{t('settings_reset_title')}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{t('settings_reset_description')}</p>
        <div className="mt-4">
          <button type="button" onClick={handleClearLocalData} disabled={clearing} className={`${primaryCtaClass} px-7 py-2.5 text-sm`}>
            {resetButtonLabel}
          </button>
        </div>
        {message && <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{message}</p>}
      </section>

      <section className="app-panel p-6 text-sm text-slate-700 dark:text-slate-200">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">{t('settings_rules_title')}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{t('settings_rules_description')}</p>
        <button
          type="button"
          onClick={() => setShowRules(true)}
          className="mt-4 inline-flex items-center rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-600 transition hover:-translate-y-0.5 hover:border-brand/40 hover:text-brand-foreground dark:border-white/20 dark:text-white"
        >
          {t('settings_rules_button')}
        </button>
      </section>

      <details className="app-panel border border-dashed border-slate-200/70 p-6 text-sm text-slate-700 shadow-none dark:border-white/20 dark:text-slate-200">
        <summary className="cursor-pointer text-base font-semibold text-slate-900 dark:text-white">{t('settings_technical_title')}</summary>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{t('settings_technical_description')}</p>
        <div className="mt-4 space-y-3 rounded-2xl border border-slate-200/60 bg-white/80 p-4 text-xs text-slate-600 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">{t('settings_device_current_label')}</p>
            <p className="mt-1 break-all font-mono text-[12px] text-slate-800 dark:text-white">{deviceId ?? t('settings_device_loading')}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">{t('settings_device_storage_key_label')}</p>
            <p className="mt-1 font-mono text-[12px] text-slate-600 dark:text-slate-300">{DEVICE_ID_KEY}</p>
          </div>
        </div>
      </details>

      <TestModeHint />

      <SafetyRulesModal
        open={showRules}
        onAccept={() => {
          markAccepted();
          setShowRules(false);
        }}
        onClose={() => setShowRules(false)}
      />
    </main>
  );
}
