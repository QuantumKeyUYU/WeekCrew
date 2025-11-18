'use client';

import { useEffect, useState } from 'react';
import { useWeekcrewStorage } from '@/lib/weekcrewStorage';
import { getOrCreateDeviceId, DEVICE_ID_KEY } from '@/lib/device';
import { primaryCtaClass } from '@/styles/tokens';
import { useTranslation } from '@/i18n/useTranslation';
import { SafetyRulesModal } from '@/components/modals/safety-rules-modal';
import { useSafetyRules } from '@/hooks/useSafetyRules';
import { clearCircleSelection } from '@/lib/circleSelection';

const PUBLIC_MODE = process.env.NEXT_PUBLIC_WEEKCREW_MODE ?? 'demo';
const isDemoMode = PUBLIC_MODE !== 'live';

export default function SettingsPage() {
  const storage = useWeekcrewStorage();
  const t = useTranslation();
  const { markAccepted } = useSafetyRules();
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
      await storage.clearAllLocalData();
      clearCircleSelection();
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

  return (
    <main className="space-y-6 py-6">
      <section className="rounded-[2.75rem] border border-white/10 bg-slate-950/80 p-6 text-slate-50 shadow-[0_30px_90px_rgba(3,5,20,0.9)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand/70">WeekCrew</p>
        <h1 className="mt-2 text-2xl font-semibold">{t('settings_title')}</h1>
        <p className="mt-2 text-sm text-white/80">{t('settings_intro')}</p>
      </section>

      <section className="rounded-[2.5rem] border border-slate-200/70 bg-white/95 p-6 text-sm text-slate-700 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">{t('settings_mode_title')}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{modeDescription}</p>
        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">{t('settings_mode_future')}</p>
      </section>

      <section className="rounded-[2.5rem] border border-slate-200/70 bg-white/95 p-6 text-sm text-slate-700 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">{t('settings_reset_title')}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{t('settings_reset_description')}</p>
        <div className="mt-4">
          <button type="button" onClick={handleClearLocalData} disabled={clearing} className={`${primaryCtaClass} px-7 py-2.5 text-sm`}>
            {resetButtonLabel}
          </button>
        </div>
        {message && <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{message}</p>}
      </section>

      <section className="rounded-[2.5rem] border border-slate-200/70 bg-white/95 p-6 text-sm text-slate-700 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200">
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

      <details className="rounded-[2.5rem] border border-dashed border-slate-200/70 bg-white/95 p-6 text-sm text-slate-700 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-white/20 dark:bg-slate-900/60 dark:text-slate-200">
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
