'use client';

import { ReactNode, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { getOrCreateDeviceId } from '@/lib/device';
import { ensureAnonymousAuth } from '@/config/firebase';
import { useHydrated } from '@/hooks/useHydrated';

interface Props {
  children: ReactNode;
}

const resolveTheme = (theme: 'light' | 'dark' | 'system') => {
  if (theme !== 'system') {
    return theme;
  }
  if (typeof window === 'undefined') {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const ClientProviders = ({ children }: Props) => {
  const hydrated = useHydrated();
  const device = useAppStore((state) => state.device);
  const settings = useAppStore((state) => state.settings);
  const setDevice = useAppStore((state) => state.setDevice);
  const updateUser = useAppStore((state) => state.updateUser);

  useEffect(() => {
    const id = getOrCreateDeviceId();
    if (!device || device.deviceId !== id) {
      setDevice({ deviceId: id, createdAt: new Date().toISOString() });
    }
  }, [device, setDevice]);
  useEffect(() => {
    if (!device) {
      return;
    }
    updateUser((prev) => {
      if (prev) {
        return prev;
      }
      return {
        id: device.deviceId,
        interests: [],
        currentCircleId: null,
        locale: settings.language,
        theme: settings.theme,
        notificationsEnabled: false
      };
    });
  }, [device, updateUser, settings.language, settings.theme]);

  useEffect(() => {
    ensureAnonymousAuth()
      .then((uid) => {
        updateUser((prev) => {
          if (prev && prev.id === uid) {
            return prev;
          }
          return {
            id: uid,
            interests: prev?.interests ?? [],
            currentCircleId: prev?.currentCircleId ?? null,
            locale: settings.language,
            theme: settings.theme,
            notificationsEnabled: prev?.notificationsEnabled ?? false
          };
        });
      })
      .catch((error) => {
        console.warn('Anonymous auth skipped', error);
      });
  }, [updateUser, settings.language, settings.theme]);

  useEffect(() => {
    const applyTheme = () => {
      if (typeof document === 'undefined') {
        return;
      }
      const theme = resolveTheme(settings.theme);
      document.body.dataset.theme = theme;
      document.body.dataset.animations = settings.animationsEnabled ? 'on' : 'off';
    };

    applyTheme();

    if (settings.theme === 'system' && typeof window !== 'undefined') {
      const matcher = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme();
      matcher.addEventListener('change', handler);
      return () => matcher.removeEventListener('change', handler);
    }
  }, [settings.theme, settings.animationsEnabled]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .catch((error) => console.warn('Service worker registration failed', error));
    }
  }, []);

  if (!hydrated) {
    return <div className="min-h-screen bg-slate-950" />;
  }

  return <>{children}</>;
};
