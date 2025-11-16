'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { resetDeviceId, getOrCreateDeviceId } from '@/lib/device';

const themes: { value: 'light' | 'dark' | 'system'; label: string }[] = [
  { value: 'system', label: 'Системная' },
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Тёмная' }
];

export default function SettingsPage() {
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const setDevice = useAppStore((state) => state.setDevice);
  const resetStore = useAppStore((state) => state.reset);
  const device = useAppStore((state) => state.device);
  const [notice, setNotice] = useState('');

  const handleThemeChange = (value: 'light' | 'dark' | 'system') => {
    updateSettings({ theme: value });
  };

  const handleReset = () => {
    resetStore();
    resetDeviceId();
    const id = getOrCreateDeviceId();
    setDevice({ deviceId: id, createdAt: new Date().toISOString() });
    setNotice('Локальные данные очищены. Создан новый deviceId.');
  };

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Настройки</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Тема и анимации применяются только к этому устройству. deviceId хранится локально и используется для анонимности.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.07)] dark:border-white/10 dark:bg-slate-900/70">
        <p className="text-sm font-medium text-slate-500">Тема интерфейса</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {themes.map((theme) => (
            <button
              key={theme.value}
              type="button"
              onClick={() => handleThemeChange(theme.value)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                settings.theme === theme.value
                  ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                  : 'border-slate-200 text-slate-600 hover:border-slate-400 dark:border-white/20 dark:text-slate-200'
              }`}
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.07)] dark:border-white/10 dark:bg-slate-900/70">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-white">Анимации</p>
            <p className="text-xs text-slate-500">Выключи, если нужен статичный интерфейс.</p>
          </div>
          <button
            type="button"
            onClick={() => updateSettings({ animationsEnabled: !settings.animationsEnabled })}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
              settings.animationsEnabled ? 'bg-brand' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${settings.animationsEnabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>
      </div>

      <div className="space-y-3 rounded-3xl border border-rose-100 bg-rose-50/60 p-5 text-sm text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
        <p className="font-semibold">Сброс устройства</p>
        <p>Удалим локальные данные, сгенерируем новый deviceId и сбросим тему.</p>
        <p className="text-xs text-rose-700 dark:text-rose-200">Текущий deviceId: {device?.deviceId ?? 'не создан'}</p>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex w-full items-center justify-center rounded-full border border-rose-500 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-500 hover:text-white dark:border-rose-300 dark:text-rose-50"
        >
          Очистить локальные данные
        </button>
        {notice && <p className="text-xs text-rose-600 dark:text-rose-200">{notice}</p>}
      </div>
    </section>
  );
}
