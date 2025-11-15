'use client';

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type { AppSettings, Circle, CircleMessage, DeviceInfo, UserProfile } from '@/types';

/* eslint-disable no-unused-vars */
interface AppStore {
  device: DeviceInfo | null;
  user: UserProfile | null;
  circle: Circle | null;
  messages: CircleMessage[];
  settings: AppSettings;
  setDevice(device: DeviceInfo): void;
  setUser(profile: UserProfile | null): void;
  updateUser(updater: (prev: UserProfile | null) => UserProfile | null): void;
  setCircle(circle: Circle | null): void;
  setMessages(messages: CircleMessage[]): void;
  addMessage(message: CircleMessage): void;
  updateSettings(settings: Partial<AppSettings>): void;
  reset(): void;
}
/* eslint-enable no-unused-vars */

const defaultSettings: AppSettings = {
  language: 'ru',
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
      (set, get) => ({
        device: null,
        user: null,
        circle: null,
        messages: [],
        settings: defaultSettings,
        setDevice: (device) => set({ device }),
        setUser: (profile) => set({ user: profile }),
        updateUser: (updater) => set({ user: updater(get().user) }),
        setCircle: (circle) => set({ circle }),
        setMessages: (messages) => set({ messages }),
        addMessage: (message) => set({ messages: [...get().messages, message] }),
        updateSettings: (settings) => set({ settings: { ...get().settings, ...settings } }),
        reset: () => set({
          device: null,
          user: null,
          circle: null,
          messages: [],
          settings: defaultSettings
        })
      }),
      {
        name: 'weekcrew-store',
        storage,
        partialize: (state) => ({
          device: state.device,
          user: state.user,
          settings: state.settings
        })
      }
    )
  )
);
