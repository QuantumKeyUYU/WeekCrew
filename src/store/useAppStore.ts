'use client';

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type { AppSettings, DeviceInfo } from '@/types';

/* eslint-disable no-unused-vars */
interface AppStore {
  device: DeviceInfo | null;
  settings: AppSettings;
  setDevice: (value: DeviceInfo) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  reset: () => void;
}
/* eslint-enable no-unused-vars */

const defaultSettings: AppSettings = {
  theme: 'system',
  animationsEnabled: true
};

const memoryStorage = (() => {
  let storage: Record<string, string> = {};
  return {
    getItem: (name: string) => storage[name] ?? null,
    setItem: (name: string, value: string) => {
      storage[name] = value;
    },
    removeItem: (name: string) => {
      delete storage[name];
    }
  };
})();

const storage = createJSONStorage<AppStore>(() => {
  if (typeof window === 'undefined') {
    return memoryStorage as Storage;
  }
  return window.localStorage;
});

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set) => ({
        device: null,
        settings: defaultSettings,
        setDevice: (device) => set({ device }),
        updateSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings } })),
        reset: () =>
          set({
            device: null,
            settings: defaultSettings
          })
      }),
      {
        name: 'uyan-chat-store',
        storage,
        partialize: (state) => ({
          device: state.device,
          settings: state.settings
        })
      }
    )
  )
);
