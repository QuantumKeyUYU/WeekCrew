'use client';

import { useEffect, useState } from 'react';
import { useWeekcrewStorage } from '@/lib/weekcrewStorage';
import { isDemoMode } from '@/config/mode';
import { getOrCreateDeviceId, DEVICE_ID_KEY } from '@/lib/device';

const SAFETY_KEY = 'weekcrew:safety-accepted-v2';

export default function SettingsPage() {
  const storage = useWeekcrewStorage();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // deviceId есть только на клиенте
    const id = getOrCreateDeviceId();
    setDeviceId(id);
  }, []);

  const handleClearLocalData = async () => {
    setClearing(true);
    setMessage(null);

    try {
      await storage.clearAllLocalData();

      // Сбрасываем и флаг про правила безопасности
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.removeItem(SAFETY_KEY);
        } catch {
          // если не получится — не страшно
        }
      }

      setMessage(
        'Локальные данные очищены. При следующем заходе всё начнётся с нуля: новый круг, новое устройство и экран с правилами.'
      );
    } catch (error) {
      console.error('Failed to clear local data', error);
      setMessage('Не получилось очистить данные. Попробуй ещё раз чуть позже.');
    } finally {
      setClearing(false);
    }
  };

  const handleResetSafetyOnly = () => {
    setMessage(null);
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.removeItem(SAFETY_KEY);
      setMessage('При следующем заходе снова появится экран с правилами безопасности.');
    } catch (error) {
      console.error('Failed to reset safety flag', error);
      setMessage('Не получилось сбросить правила. Можно попробовать позже.');
    }
  };

  const modeLabel = isDemoMode ? 'Демо-режим' : 'Онлайн-режим';
  const modeDescription = isDemoMode
    ? 'Сейчас всё работает локально: кружки и сообщения хранятся только на этом устройстве.'
    : 'Сейчас используется live-режим: сообщения отправляются на сервер и могут приходить с разных устройств.';

  return (
    <main className="px-4 py-8 sm:py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 sm:gap-8">
        <section className="rounded-3xl border border-slate-200/80 bg-slate-900/40 p-5 text-slate-50 shadow-[0_20px_60px_rgba(15,23,42,0.8)] dark:border-white/10 sm:p-7">
          <h1 className="text-lg font-semibold sm:text-xl">Настройки WeekCrew</h1>
          <p className="mt-2 text-xs text-slate-300/95 sm:text-sm">
            Здесь можно посмотреть режим работы приложения, свой анонимный идентификатор
            устройства и при необходимости очистить локальные данные.
          </p>
        </section>

        {/* Режим работы */}
        <section className="rounded-3xl border border-slate-200/80 bg-slate-900/40 p-5 text-sm text-slate-50 shadow-[0_16px_50px_rgba(15,23,42,0.7)] dark:border-white/10 sm:p-6">
          <h2 className="text-sm font-semibold sm:text-base">Режим работы</h2>
          <p className="mt-2 inline-flex items-center rounded-full bg-slate-950/70 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-200">
            {modeLabel}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-300/95 sm:text-sm">
            {modeDescription}
          </p>
          {isDemoMode && (
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
              Позже можно будет включить live-режим с реальными кружками и сервером. В
              демо всё, что ты пишешь, остаётся только здесь.
            </p>
          )}
        </section>

        {/* Устройство */}
        <section className="rounded-3xl border border-slate-200/80 bg-slate-900/40 p-5 text-sm text-slate-50 shadow-[0_16px_50px_rgba(15,23,42,0.7)] dark:border-white/10 sm:p-6">
          <h2 className="text-sm font-semibold sm:text-base">Твоё устройство</h2>
          <p className="mt-2 text-xs text-slate-300/95 sm:text-sm">
            WeekCrew использует анонимный идентификатор, чтобы понимать, что это всё ещё
            ты — без логина и пароля.
          </p>

          <div className="mt-3 rounded-2xl bg-slate-950/70 p-3 text-xs text-slate-200">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  Текущий идентификатор устройства
                </p>
                <p className="mt-1 break-all font-mono text-[11px] text-slate-100">
                  {deviceId ?? 'загрузка…'}
                </p>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 sm:mt-0 sm:text-right">
                Ключ в хранилище: <span className="font-mono">{DEVICE_ID_KEY}</span>
              </div>
            </div>
          </div>

          <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
            Этот код не связан с именем или аккаунтом. Он нужен только для работы
            кружков и может быть сброшен вместе с локальными данными.
          </p>
        </section>

        {/* Управление данными */}
        <section className="rounded-3xl border border-slate-200/80 bg-slate-900/40 p-5 text-sm text-slate-50 shadow-[0_16px_50px_rgba(15,23,42,0.7)] dark:border-white/10 sm:p-6">
          <h2 className="text-sm font-semibold sm:text-base">Управление локальными данными</h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-300/95 sm:text-sm">
            Если хочешь начать всё с чистого листа — можно очистить локальное хранилище:
            текущее устройство, демо-кружки, сообщения и статус просмотра правил
            безопасности.
          </p>

          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleClearLocalData}
              disabled={clearing}
              className="inline-flex items-center justify-center rounded-full bg-red-500/90 px-5 py-2 text-xs font-semibold text-white shadow-[0_16px_40px_rgba(239,68,68,0.7)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {clearing ? 'Очищаем…' : 'Сбросить всё локальное'}
            </button>

            <button
              type="button"
              onClick={handleResetSafetyOnly}
              className="inline-flex items-center justify-center rounded-full border border-slate-500/70 bg-transparent px-4 py-2 text-xs font-medium text-slate-200 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-white"
            >
              Показать правила ещё раз
            </button>
          </div>

          <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
            После полного сброса WeekCrew будет вести себя так, как будто ты открыл его
            впервые: новый deviceId, новый демо-кружок, экран с правилами и пустые
            сообщения.
          </p>

          {message && (
            <p className="mt-3 text-[11px] leading-relaxed text-slate-200">
              {message}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
